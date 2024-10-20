import JSZip from 'jszip'
import multer from 'multer'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { PDFDocument } from 'pdf-lib'
import { serve } from '@hono/node-server'
import type { Context, Next } from 'hono'

const app = new Hono()

const upload = multer({
  dest: 'uploads/',
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Middleware to handle file uploads
const handleUpload = upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'pdfs', maxCount: 20 }
])

// Convert multer middleware to Hono middleware
const uploadMiddleware = async (c: Context, next: Next) => {

  const req = c.req.raw as any
  const res = c.res as any

  return new Promise((resolve, reject) => {
    handleUpload(req, res, (err) => {
      if (err) reject(err)
      else resolve(next())
    })
  })
}

// Enable CORS
app.use('/*', cors())
app.use(logger())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Split PDF endpoint
app.post('/split', uploadMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body.pdf as File
    const pageRanges = body.pageRanges as string

    const filename = file.name

    if (!file) {
      return c.json({
        success: false, error: 'No PDF file provided'
      }, 400)
    }

    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const totalPages = pdfDoc.getPageCount()

    // Parse page ranges or default to individual pages
    let ranges = []
    if (pageRanges) {
      ranges = pageRanges.split(',').map(range => {
        const [start, end] = range.split('-').map(num => parseInt(num))
        return [start, end]
      })
    } else {
      ranges = Array.from({ length: totalPages }, (_, i) => [i, i])
    }

    // Create split PDFs
    const splitPDFs = await Promise.all(ranges.map(async ([start, end]) => {
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(pdfDoc,
        Array.from({ length: end - start + 1 }, (_, i) => start + i))

      pages.forEach(page => newPdf.addPage(page))
      return newPdf.save()
    }))

    // Return split PDFs as a ZIP file
    const zip = new JSZip()
    splitPDFs.forEach((pdf, i) => {
      const [start, end] = ranges[i]
      zip.file(`page-${start + 1}.pdf`, pdf)
    })

    const zipContent = await zip.generateAsync({ type: 'arraybuffer' })

    return new Response(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="split_pdfs.zip"'
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})


// Merge PDFs endpoint
// app.post('/merge', uploadMiddleware, async (c) => {
//   try {
//     const files = c.req.parseBody()
//     if (!files?.pdfs) {
//       return c.json({ error: 'No PDF files provided' }, 400)
//     }

//     // Create merged PDF
//     const mergedPdf = await PDFDocument.create()

//     for (const file of files.pdfs) {
//       const pdf = await PDFDocument.load(file.buffer)
//       const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
//       pages.forEach(page => mergedPdf.addPage(page))
//     }

//     const mergedPdfBytes = await mergedPdf.save()

//     c.header('Content-Type', 'application/pdf')
//     c.header('Content-Disposition', 'attachment; filename=merged.pdf')

//     return new Response(mergedPdfBytes)

//   } catch (error) {
//     return c.json({ error: error.message }, 500)
//   }
// })

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
