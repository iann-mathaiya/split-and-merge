import { useState } from 'react';
import { twMerge } from "tailwind-merge";
import { FileText, Loader2 } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
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
  const [canMergeAfterwards, setCanMergeAfterwards] = useState(false);
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
      formData.append('zipFileName', zipFileName);
      formData.append('canMergeAfterwards', canMergeAfterwards.toString());

      const fileName = files[0].name;

      const response = await fetch(`${API_URL}/split`, {
        method: 'POST',
        body: formData,
      });

      const reponseData = await response.blob();
      console.log("reponseData", reponseData);

      const url = window.URL.createObjectURL(reponseData);
      setDownloadLink(url);

      console.log(url);

      setSuccess(`${fileName} split successfully!`);
      setFiles([]);
      setPageRanges('');
      setZipFileName('');
      setCanMergeAfterwards(false);
      setError('');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
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
        </div>

        <p className='whitespace-nowrap'>if you want, specify the pages you want split</p>

        <div className="flex items-baseline gap-1.5">
          <label htmlFor='upload-file' className="whitespace-nowrap">
            add the page range here
          </label>
          <input
            id='upload-file'
            type="text"
            placeholder="e.g. 4-6"
            value={pageRanges}
            onChange={(e) => setPageRanges(e.target.value)}
            className="px-2.5 py-1 w-22 placeholder:text-zinc-600 text-zinc-900 bg-zinc-200/80 outline outline-none rounded-lg"
          />
        </div>
        <p className='whitespace-nowrap'>
          leave blank if you want the entire document split
        </p>

        {pageRanges &&
          <div className="flex flex-col items-baseline gap-1.5">
            <p className='whitespace-nowrap'>
              last thing, do you want to split the specified pages
            </p>
            <p className='whitespace-nowrap'>
              then merge them to a unified document?
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="omg-yes" className={twMerge(
                "px-2.5 py-1 w-fit text-zinc-600 bg-zinc-200/80 cursor-pointer rounded-lg",
                canMergeAfterwards === true && "bg-blue-100 text-blue-600"
              )}>
                <input
                  type="radio"
                  id="omg-yes"
                  className="hidden"
                  checked={canMergeAfterwards === true}
                  onChange={() => setCanMergeAfterwards(true)}
                />
                <span>omg yes</span>
              </label>

              <label htmlFor="nope" className={twMerge(
                "px-2.5 py-1 w-fit text-zinc-600 bg-zinc-200/80 cursor-pointer rounded-lg",
                canMergeAfterwards === false && "bg-blue-100 text-blue-600"
              )}>
                <input
                  id="nope"
                  type="radio"
                  className="hidden"
                  checked={canMergeAfterwards === false}
                  onChange={() => setCanMergeAfterwards(false)}
                />
                <span>nope</span>
              </label>
            </div>
          </div>
        }

        <button
          type="submit"
          disabled={loading}
          className="mt-16 flex items-center gap-2 font-normal cursor-pointer hover:text-zinc-900"
        >
          {loading ? (
            <>
              <span>splitting {files[0]?.name}</span>
              <div className="p-1 flex items-center gap-1 text-white bg-zinc-900 rounded-full">
                <Loader2 className="w-4 h-4 text-whte animate-spin" aria-hidden />
              </div>
            </>
          ) : (
            <>
              <span>when you're ready go ahead and</span>
              <div className="px-3 py-1 flex items-center gap-1 text-white bg-zinc-900 rounded-full">
                <ScissorsIcon className="w-3.5 h-3.5 text-whte" aria-hidden />
                <span>split</span>
              </div>
            </>
          )}
        </button>
      </form>


      {error && (
        <div className="mt-8">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-8 space-y-2.5">
          <p className="text-sm text-green-700">{success}</p>

          <a href={downloadLink} download={zipFileName} className='mt-3 text-sm px-4 py-2 bg-green-800 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-900 rounded-full transition-all duration-500 ease-in-out'>
            Download Zip File
          </a>
        </div>
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
    <>
      <form onSubmit={handleSubmit} className="space-y-2.5 text-base text-zinc-600 lowercase">
        <div>
          <label htmlFor="merge-file-upload" className="flex items-baseline gap-1.5 hover:text-zinc-900 cursor-pointer transition-all duration-300 ease-in-out">
            {files.length > 0 ?
              <>
                <span>you uploaded:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md">{files.length} pdf documents</span>
              </> :
              <>
                <span>upload the</span>
                <span className="px-2 py-0.5 bg-zinc-200/80 rounded-md">document</span>
              </>
            }
          </label>
          <input
            id="merge-file-upload"
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex items-baseline gap-1.5">
          <label htmlFor='file-name' className='whitespace-nowrap'>you can add the</label>
          <textarea rows={1} id='file-name' value={mergedDocFileName} onChange={e => setMergedDocFileName(e.target.value)} placeholder='File name'
            className='px-2.5 py-1 min-w-20 bg-zinc-200/80 placeholder:text-zinc-600 text-zinc-900 resize-none field-sizing-content outline outline-none rounded-lg' />
        </div>

        {files.length > 0 && (
          <div className="mt-8 space-y-1.5">
            <h3 className="text-sm text-blue-600 italic font-medium">pdfs you've already uploaded</h3>
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

        <button
          type="submit"
          disabled={loading || (files.length === 0 && mergedDocFileName === "")}
          className="mt-16 flex items-center gap-2 font-normal cursor-pointer hover:text-zinc-900"
        >
          {loading ? (
            <>
              <span>splitting {files[0]?.name}</span>
              <div className="p-1 flex items-center gap-1 text-white bg-zinc-900 rounded-full">
                <Loader2 className="w-4 h-4 text-whte animate-spin" aria-hidden />
              </div>
            </>
          ) : (
            <>
              <span>when you're ready go ahead and</span>
              <div className="px-3 py-1 flex items-center gap-1 text-white bg-zinc-900 rounded-full">
                <MergeIcon className="w-3.5 h-3.5 text-whte" aria-hidden />
                <span>merge</span>
              </div>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-8">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-8 space-y-2.5">
          <p className="text-sm text-green-700">{success}</p>

          <a href={downloadLink} download={mergedDocFileName} className='mt-4 text-sm px-4 py-2 bg-green-900 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-900 rounded-lg transition-all duration-500 ease-in-out'>
            Download Zip File
          </a>
        </div>
      )}
    </>
  );
}