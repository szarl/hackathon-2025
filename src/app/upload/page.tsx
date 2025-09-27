'use client';

import { useState, useRef } from 'react';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles((prev) => [...prev, ...result.urls]);
        alert(`Successfully uploaded ${result.urls.length} file(s)!`);
      } else {
        alert(`Upload failed: ${result.error}`);
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-2xl px-4'>
        <div className='rounded-lg bg-white p-6 shadow-md'>
          <h1 className='mb-6 text-3xl font-bold text-gray-900'>Upload Images</h1>

          <div className='rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400'>
            <div className='mb-4'>
              <svg className='mx-auto h-12 w-12 text-gray-400' stroke='currentColor' fill='none' viewBox='0 0 48 48'>
                <path
                  d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>

            <div className='mb-4'>
              <p className='mb-2 text-lg text-gray-600'>Choose your images to upload </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </button>
              <p className='mt-2 text-sm text-gray-500'>Supports: JPG, PNG, GIF, WebP</p>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='image/*'
              onChange={handleFileInput}
              className='hidden'
            />

            {uploading && (
              <div className='mt-4'>
                <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
                <p className='mt-2 text-sm text-gray-600'>Uploading...</p>
              </div>
            )}
          </div>

          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className='mt-8'>
              <h2 className='mb-4 text-xl font-bold text-gray-900'>Uploaded Images</h2>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                {uploadedFiles.map((url, index) => (
                  <div key={index} className='aspect-square overflow-hidden rounded-lg bg-gray-200'>
                    <img src={url} alt={`Uploaded ${index + 1}`} className='h-full w-full object-cover' />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
