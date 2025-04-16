import JSZip from 'jszip';
import multer from 'multer';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { PDFDocument } from 'pdf-lib';
import { serve } from '@hono/node-server';
import { Mistral } from '@mistralai/mistralai';

const app = new Hono();

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const upload = multer({
  dest: 'uploads/',
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to handle file uploads
const handleUpload = upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'pdfs', maxCount: 20 }
]);

// Convert multer middleware to Hono middleware
// const uploadMiddleware = async (c: Context, next: Next) => {

//   const req = c.req.raw as unknown as IncomingMessage;
//   const res = c.res as unknown as ServerResponse;

//   return new Promise((resolve, reject) => {
//     handleUpload(req, res, (err?: HTTPResponseError) => {
//       if (err) reject(err);
//       else resolve(next());
//     });
//   });
// };

// Enable CORS
app.use('/*', cors());
app.use(logger());

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

// Split PDF endpoint
app.post('/split', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.pdf as File;
    const pageRanges = body.pageRanges as string;
    const fileName = body.zipFileName as string;

    console.log("file data:", file);
    console.log("page ranges:", pageRanges);

    if (!file) {
      return c.json({
        success: false, error: 'No PDF file provided'
      }, 400);
    }

    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    // Parse page ranges or default to individual pages
    let ranges: number[][] = [];

    if (pageRanges) {
      ranges = pageRanges.split(',').map(range => {
        const [startStr, endStr] = range.split('-');
        const start = Number.parseInt(startStr) - 1;
        const end = endStr ? Number.parseInt(endStr) - 1 : start;

        if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end >= totalPages || start > end) {
          throw new Error(`Invalid page range: ${range}`);
        }

        return [start, end];
      });
    } else {
      ranges = Array.from({ length: totalPages }, (_, i) => [i, i]);
    }

    // Create split PDFs
    const splitPDFs = await Promise.all(
      ranges.map(async ([start, end]) => {
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdfDoc, Array.from({ length: end - start + 1 }, (_, i) => start + i));

        for (const page of pages) {
          newPdf.addPage(page);
        }

        return newPdf.save();
      })
    );

    // Return split PDFs as a ZIP file
    const zip = new JSZip();
    splitPDFs.forEach((pdf, i) => {
      const [start, end] = ranges[i];
      const name = `${fileName}-pages-${start + 1}-${end + 1}.pdf`;
      zip.file(name, pdf);
    });

    const zipContent = await zip.generateAsync({ type: 'arraybuffer' });

    return new Response(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${`${fileName}.zip` || 'split_pdfs.zip'}"`
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// Merge PDFs endpoint
app.post('/merge', async (c) => {
  try {
    const formData = await c.req.formData();
    const pdfFiles = formData.getAll('pdfs') as File[];

    if (!pdfFiles.length) {
      return c.json({ success: false, error: 'No PDF files provided' }, 400);
    }

    // Create merged PDF
    const mergedPdf = await PDFDocument.create();

    for (const file of pdfFiles) {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      for (const page of pages) {
        mergedPdf.addPage(page);
      }
    }

    const mergedPdfBytes = await mergedPdf.save();

    return new Response(mergedPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"'
      }
    });

  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// OCR endpoint
app.post('/ocr', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.pdf as File;

    console.log(file);

    // const uploadedFile = fs.readFileSync('uploaded_file.pdf');

    const uploadedPdf = await mistral.files.upload({
      file: {
        fileName: file.name,
        content: file,
      },
      purpose: "ocr"
    });

    const signedUrl = await mistral.files.getSignedUrl({
      fileId: uploadedPdf.id,
    });

    const ocrResponse = await mistral.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: signedUrl.url,
      },
      includeImageBase64: true
    });

    // Convert the OCR page objects to a markdown string
    // const markdownContent = ocrResponse.pages
    //   .map((page, index) => `## Page ${index + 1}\n\n${page.markdown}`)
    //   .join('\n\n');

    // return new Response(markdownContent, {
    //   headers: {
    //     'Content-Type': 'text/markdown',
    //     'Content-Disposition': `attachment; filename="${uploadedPdf.filename || 'ocr_results.md'}"`
    //   }
    // });

    return new Response(JSON.stringify(ocrResponse.pages), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${uploadedPdf.filename || 'ocr_results.json'}"`
      }
    });

  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
