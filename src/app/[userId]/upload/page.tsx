'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UploadResult {
  name: string;
  id: string;
  image_url: string;
  confidence_score: number;
}

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  // Camera functionality
  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          setStream(mediaStream);
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
          alert('Unable to access camera. Please check permissions.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [showCamera]);

  // Separate effect to handle video element
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Setting video stream:', stream);
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        videoRef.current?.play().catch(console.error);
      };
    }
  }, [stream]);

  const startCamera = () => {
    setShowCamera(true);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
              const fileList = new DataTransfer();
              fileList.items.add(file);
              handleFileUpload(fileList.files);
              stopCamera();
            }
          },
          'image/jpeg',
          0.8,
        );
      }
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    setAnalysisProgress('Preparing files for analysis...');
    setUploadResults([]);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });

      setAnalysisProgress('Analyzing images with AI...');

      const response = await fetch('/api/flowers/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResults(result.data || []);
        setAnalysisProgress('');

        if (result.data && result.data.length > 0) {
          // Show success message
          const successCount = result.data.length;
          alert(`Successfully identified ${successCount} flower${successCount !== 1 ? 's' : ''}!`);

          // Redirect to dashboard after successful upload
          setTimeout(() => {
            router.push(`/${window.location.pathname.split('/')[1]}/dashboard`);
          }, 2000);
        }

        if (result.errors && result.errors.length > 0) {
          console.log('Some files had errors:', result.errors);
        }
      } else {
        alert(`Upload failed: ${result.error}`);
        if (result.details) {
          console.log('Error details:', result.details);
        }
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed due to network error');
    } finally {
      setUploading(false);
      setAnalysisProgress('');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  // Camera screen component
  if (showCamera) {
    return (
      <div className='fixed inset-0 z-50 bg-black'>
        {/* Back button */}
        <button
          onClick={stopCamera}
          className='absolute top-6 left-6 z-10 rounded-md bg-black/50 p-2 text-white transition-colors hover:bg-black/70'
        >
          <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
        </button>

        {/* Camera preview - full screen */}
        <div className='absolute inset-0'>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className='h-full w-full object-cover'
            style={{ backgroundColor: '#000' }}
          />

          {/* Plant positioning guide - larger overlay */}
          <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
            <div className='relative h-80 w-80 rounded-3xl border-4 border-white/60 shadow-lg'>
              <div className='absolute inset-0 rounded-3xl border-2 border-white/40' />
              {/* Corner guides */}
              <div className='absolute -top-2 -left-2 h-6 w-6 rounded-tl-lg border-t-4 border-l-4 border-white' />
              <div className='absolute -top-2 -right-2 h-6 w-6 rounded-tr-lg border-t-4 border-r-4 border-white' />
              <div className='absolute -bottom-2 -left-2 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-white' />
              <div className='absolute -right-2 -bottom-2 h-6 w-6 rounded-br-lg border-r-4 border-b-4 border-white' />
            </div>
          </div>
        </div>

        {/* Tips section */}
        <div className='absolute right-6 bottom-32 left-6'>
          <div className='rounded-lg border border-orange-500 bg-orange-500/20 p-4'>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0'>
                <svg className='mt-0.5 h-5 w-5 text-orange-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div>
                <h3 className='mb-1 text-sm font-bold text-white'>Tips:</h3>
                <p className='text-sm text-white'>Center one plant. Ensure good light. Keep steady.</p>
              </div>
            </div>
          </div>
        </div>

        <div className='absolute right-6 bottom-6 left-6'>
          <div className='flex items-center justify-between'>
            <button
              onClick={stopCamera}
              className='rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10'
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className='flex h-16 w-16 items-center justify-center rounded-full bg-green-600 transition-colors hover:bg-green-700'
            >
              <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
            </button>
            <div className='w-16' /> {/* Spacer for centering */}
          </div>
        </div>

        <canvas ref={canvasRef} className='hidden' />
      </div>
    );
  }

  return (
    <div className='min-h-screen py-8'>
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
              <p className='mb-2 text-lg text-gray-600'>Upload flower and plant images for AI identification</p>
              <div className='space-y-3'>
                <button
                  onClick={startCamera}
                  className='w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50'
                  disabled={uploading}
                >
                  📷 Take Photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
                  disabled={uploading}
                >
                  {uploading ? 'Analyzing...' : '📁 From Gallery'}
                </button>
              </div>
              <p className='mt-2 text-sm text-gray-500'>
                AI will identify flowers, assess health, and provide care recommendations
              </p>
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
                <p className='mt-2 text-sm text-gray-600'>{analysisProgress || 'Processing...'}</p>
              </div>
            )}
          </div>

          {/* Display analysis results */}
          {uploadResults.length > 0 && (
            <div className='mt-8'>
              <h2 className='mb-4 text-xl font-bold text-gray-900'>
                AI Analysis Results ({uploadResults.length} identified)
              </h2>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {uploadResults.map((result, index) => (
                  <div key={index} className='rounded-lg border border-gray-200 bg-green-50 p-4'>
                    <div className='flex items-start space-x-4'>
                      <img src={result.image_url} alt={result.name} className='h-20 w-20 rounded-lg object-cover' />
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900'>{result.name}</h3>
                        <p className='mb-2 text-sm text-gray-600'>
                          Confidence: {Math.round(result.confidence_score * 100)}%
                        </p>
                        <div className='h-2 w-full rounded-full bg-gray-200'>
                          <div
                            className='h-2 rounded-full bg-green-600'
                            style={{ width: `${result.confidence_score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-4 text-center'>
                <p className='mb-2 text-sm text-gray-600'>View detailed information and care tips in your dashboard</p>
                <a
                  href={`/${window.location.pathname.split('/')[1]}/dashboard`}
                  className='inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700'
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
