import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { GlobeIcon, MergeIcon, ScanIcon, ScissorsIcon } from "./components/icons";

const API_URL = import.meta.env.API_URL || 'http://localhost:3001';

export default function App() {
  return (
    <section className='mt-32 mx-auto w-full max-w-screen-lg min-h-screen flex justify-center gap-3'>

      <div>
        <GlobeIcon className="size-10" />
      </div>

      <Tabs defaultValue="split" className="mt-1.5 w-full max-w-md rounded-lg">
        <h1 className="text-xl text-zinc-900 font-medium">hey, what do wanna do?</h1>

        <TabsList className="mt-4">
          <TabsTrigger value="split">
            <ScissorsIcon className="w-4 h-4" />
            Split
          </TabsTrigger>
          <TabsTrigger value="merge">
            <MergeIcon className="w-4 h-4" />
            Merge
          </TabsTrigger>
          <p className="text-base text-zinc-600">or</p>
          <TabsTrigger value="ocr">
            <ScanIcon className="w-4 h-4" />
            OCR
          </TabsTrigger>
        </TabsList>

        <div className='mt-1 p-2 rounded-md'>
          <TabsContent value="split" className='pt-12'>
            <SplitPDF />
          </TabsContent>
          <TabsContent value="merge" className='pt-12'>
            <MergePDFs />
          </TabsContent>
          <TabsContent value="ocr">
            Todo
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}

function SplitPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageRanges, setPageRanges] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [zipFileName, setZipFileName] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const invalidFiles = selectedFiles.filter(
      file => file.type !== 'application/pdf'
    );

    if (invalidFiles.length > 0) {
      setError('Please upload PDF files only');
      return;
    }

    setFiles(selectedFiles);
    setError('');
    setSuccess('');
  };

  const validatePageRanges = (ranges: string) => {
    if (!ranges.trim()) return true;
    const rangePattern = /^\d+\-\d+(?:,\d+\-\d+)*$/;
    return rangePattern.test(ranges);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (files.length === 0) {
        throw new Error('Please upload at least one PDF file');
      }

      if (pageRanges && !validatePageRanges(pageRanges)) {
        throw new Error('Invalid page ranges format. Use format: 1-3,4-6');
      }

      const formData = new FormData();

      formData.append('pdf', files[0]);

      if (pageRanges) {
        formData.append('pageRanges', pageRanges);
      }

      const fileName = files[0].name;

      const response = await fetch(`${API_URL}/split`, {
        method: 'POST',
        body: formData,
      });

      const reponseData = await response.blob();

      const url = window.URL.createObjectURL(reponseData);
      setDownloadLink(url);

      setSuccess(`${fileName} split successfully!`);
      setFiles([]);
      setPageRanges('');

    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-2.5 text-base text-zinc-600 lowercase">
        <div>
          <label htmlFor="split-file-upload" className="flex items-baseline gap-1.5 hover:text-zinc-900 cursor-pointer transition-all duration-300 ease-in-out">
            {files.length > 0 ?
              <>
                <span>you uploaded:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md">{files[0].name}</span>
              </> :
              <>
                <span>upload the</span>
                <span className="px-2 py-0.5 bg-zinc-200/80 rounded-md">document</span>
              </>
            }
          </label>
          <input
            id="split-file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex items-baseline gap-1.5">
          <label htmlFor='file-name' className='whitespace-nowrap'>you can add the</label>
          <textarea rows={1} id='file-name' value={zipFileName} onChange={e => setZipFileName(e.target.value)} placeholder='Zip file name'
            className='px-2.5 py-1 min-w-28 bg-zinc-200/80 placeholder:text-zinc-600 text-zinc-900 resize-none field-sizing-content outline outline-none rounded-lg' />
          <p className='whitespace-nowrap'>if you want,</p>
        </div>

        <p className='whitespace-nowrap'>you can also specify the pages you want split,</p>

        <div className="flex items-baseline gap-1.5">
          <label htmlFor='upload-file' className="whitespace-nowrap">
            you add the page range here
          </label>
          <input
            id='upload-file'
            type="text"
            placeholder="e.g., 1-3,4-6"
            value={pageRanges}
            onChange={(e) => setPageRanges(e.target.value)}
            className="px-2.5 py-1 w-22 placeholder:text-zinc-600 text-zinc-900 bg-zinc-200/80 outline outline-none rounded-lg"
          />
        </div>
        <p className='whitespace-nowrap'>
          leave blank if you want the entire document split
        </p>

        <button
          type="submit"
          disabled={loading}
          className="mt-16 flex items-center gap-2 font-normal cursor-pointer hover:text-zinc-900"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <>
              <span>when you're ready go ahead and</span>
              <div className="px-3 py-1 flex items-center gap-1 text-white bg-zinc-900 rounded-full">
                <ScissorsIcon className="w-3.5 h-3.5" />
                <span>split</span>
              </div>
            </>
          )}
        </button>
      </form>


      {error && (
       <div className="mt-12">
         <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
       </div>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
          <div className='pt-4'>
            <a href={downloadLink} download={zipFileName} className='text-sm px-4 py-2 bg-green-900 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-900 rounded-lg transition-all duration-500 ease-in-out'>
              Download Zip File</a>
          </div>
        </Alert>
      )}
    </>
  );
}

function MergePDFs() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [mergedDocFileName, setMergedDocFileName] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const invalidFiles = selectedFiles.filter(
      file => file.type !== 'application/pdf'
    );

    if (invalidFiles.length > 0) {
      setError('Please upload PDF files only');
      return;
    }

    setFiles(selectedFiles);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (files.length === 0) {
        throw new Error('Please select at least one PDF file');
      }

      const formData = new FormData();

      for (const file of files) {
        formData.append('pdfs', file);
      }

      const response = await fetch(`${API_URL}/merge`, {
        method: 'POST',
        body: formData,
      });

      const reponseData = await response.blob();

      const url = window.URL.createObjectURL(reponseData);
      setDownloadLink(url);

      setSuccess('Merged successfully');
      setFiles([]);

    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-zinc-300 rounded-lg text-center">
        <label className="cursor-pointer block p-6">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-zinc-400 mb-2" />
            <span className="text-zinc-600">
              Click to upload multiple PDFs to merge
            </span>
            <span className="text-sm text-zinc-500 mt-1">
              You can select multiple files
            </span>
          </div>
        </label>
      </div>

      <div>
        <label htmlFor='file-name' className='text-sm text-zinc-900'>File name</label>
        <input id='file-name' value={mergedDocFileName} onChange={e => setMergedDocFileName(e.target.value)} placeholder='Assign file name' required
          className='mt-1 px-2.5 py-1.5 w-full text-sm border border-zinc-200 rounded-md' />
      </div>

      {files.length > 0 && (
        <div className="bg-zinc-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Selected Files:</h3>
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.name} className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-2 text-zinc-500" />
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
          <div className='pt-4'>
            <a href={downloadLink} download={mergedDocFileName} className='text-sm px-4 py-2 bg-green-900 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-900 rounded-lg transition-all duration-500 ease-in-out'>
              Download Zip File</a>
          </div>
        </Alert>
      )}

      <button
        type="submit"
        disabled={loading || (files.length === 0 && mergedDocFileName === "")}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-zinc-400 flex items-center justify-center"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Processing...' : 'Merge PDF'}
      </button>
    </form>
  );
}