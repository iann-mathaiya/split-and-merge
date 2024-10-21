import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Upload, FileText, Scissors, Merge, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './components/alert'

const API_URL = import.meta.env.API_URL || 'http://localhost:3000'

const PDFProcessor = () => {
  const [files, setFiles] = useState<File[]>([])
  const [mode, setMode] = useState('split') // 'split' or 'merge'
  const [pageRanges, setPageRanges] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [downloadLink, setDownloadLink] = useState('')
  const [docFileName, setDocFileName] = useState('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const invalidFiles = selectedFiles.filter(
      file => file.type !== 'application/pdf'
    )

    if (invalidFiles.length > 0) {
      setError('Please upload PDF files only')
      return
    }

    setFiles(selectedFiles)
    setError('')
    setSuccess('')
  }

  const validatePageRanges = (ranges: string) => {
    if (!ranges.trim()) return true
    const rangePattern = /^\d+\-\d+(?:,\d+\-\d+)*$/
    return rangePattern.test(ranges)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (files.length === 0) {
        throw new Error('Please select at least one PDF file')
      }

      if (mode === 'split' && pageRanges && !validatePageRanges(pageRanges)) {
        throw new Error('Invalid page ranges format. Use format: 1-3,4-6')
      }

      const formData = new FormData()


      if (mode === 'split') {
        formData.append('pdf', files[0])

        if (pageRanges) {
          formData.append('pageRanges', pageRanges)
        }
      } else {
        for (const file of files) {
          formData.append('pdfs', file)
        }
      }

      // const fileName = mode === 'split' ? 'split_pdfs.zip' : 'merged.pdf'
      const fileName = files[0].name

      const response = await fetch(`${API_URL}/${mode}`, {
        method: 'POST',
        body: formData,
      })

      const reponseData = await response.blob()

      const url = window.URL.createObjectURL(reponseData)
      setDownloadLink(url)
      mode === 'split' ? setDocFileName(`${fileName}.zip`) : setDocFileName(fileName)

      setSuccess(`${fileName} ${mode === 'split' ? 'split' : 'merged'} successfully!`)
      setFiles([])
      setPageRanges('')

    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('split')
            setFiles([])
            setPageRanges('')
            setError('')
            setSuccess('')
          }}
          className={`flex items-center px-4 py-2 rounded-lg ${mode === 'split'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700'
            }`}
        >
          <Scissors className="w-4 h-4 mr-2" />
          Split PDF
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('merge')
            setFiles([])
            setPageRanges('')
            setError('')
            setSuccess('')
          }}
          className={`flex items-center px-4 py-2 rounded-lg ${mode === 'merge'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700'
            }`}
        >
          <Merge className="w-4 h-4 mr-2" />
          Merge PDFs
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg text-center">
          <label className="cursor-pointer block p-6">
            <input
              type="file"
              accept="application/pdf"
              multiple={mode === 'merge'}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-gray-600">
                {mode === 'split'
                  ? 'Click to upload a PDF to split'
                  : 'Click to upload multiple PDFs to merge'}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                {mode === 'merge' ? 'You can select multiple files' : ''}
              </span>
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Selected Files:</h3>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.name} className="flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {mode === 'split' && (
          <div>
            <label htmlFor='upload-file' className="block text-sm font-medium text-gray-700 mb-1">
              Page Ranges (optional)
            </label>
            <input
              id='upload-file'
              type="text"
              placeholder="e.g., 1-3,4-6"
              value={pageRanges}
              onChange={(e) => setPageRanges(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to split into individual pages
            </p>
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
              <a href={downloadLink} download={docFileName} className='text-sm px-4 py-2 bg-green-900 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-900 rounded-lg transition-all duration-500 ease-in-out'>
                Download Zip File</a>
            </div>
          </Alert>
        )}

        <button
          type="submit"
          disabled={loading || files.length === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Processing...' : `${mode === 'split' ? 'Split' : 'Merge'} PDF`}
        </button>
      </form>
    </div>
  )
}

export default PDFProcessor