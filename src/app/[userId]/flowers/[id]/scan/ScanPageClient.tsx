'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ScanPageClientProps {
  flowerId: string;
  userId: string;
}

export default function ScanPageClient({ flowerId, userId }: ScanPageClientProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Start camera when component mounts
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((mediaStream) => {
        setStream(mediaStream);
        setError(null);
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
        setError('Unable to access camera. Please check permissions.');
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error);
      };
    }
  }, [stream]);

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
              const file = new File([blob], 'scan-capture.jpg', { type: 'image/jpeg' });
              handleScanUpload(file);
            }
          },
          'image/jpeg',
          0.8,
        );
      }
    }
  };

  const handleScanUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('flowerId', flowerId);
      formData.append('userId', userId);

      const response = await fetch('/api/flowers/scan', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to scan results page
        router.push(`/${userId}/flowers/${flowerId}/scan/${result.scanId}`);
      } else {
        setError(result.error || 'Scan failed. Please try again.');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setError('Scan failed due to network error');
    } finally {
      setUploading(false);
    }
  };

  if (error) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-[#f7f9f8] px-6'>
        <div className='rounded-lg bg-white p-6 shadow-lg'>
          <div className='mb-4 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <svg className='h-6 w-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='text-lg font-semibold text-gray-900'>Camera Error</h2>
            <p className='mt-2 text-sm text-gray-600'>{error}</p>
          </div>
          <div className='flex gap-3'>
            <Link
              href={`/${userId}/flowers/${flowerId}`}
              className='flex-1 rounded-md bg-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-gray-300'
            >
              Go Back
            </Link>
            <button
              onClick={() => window.location.reload()}
              className='flex-1 rounded-md bg-[#2a7f62] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f5f4a]'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-50 bg-black'>
      {/* Header */}
      <div className='absolute top-0 right-0 left-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6'>
        <div className='flex items-center justify-between'>
          <Link
            href={`/${userId}/flowers/${flowerId}`}
            className='flex items-center gap-2 rounded-md bg-black/50 px-3 py-2 text-white transition-colors hover:bg-black/70'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            <span className='text-sm font-medium'>Back</span>
          </Link>
        </div>
      </div>

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

        {/* Plant positioning guide */}
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
              <h3 className='mb-1 text-sm font-bold text-white'>Scan Tips:</h3>
              <p className='text-sm text-white'>
                Center the plant in the frame. Ensure good lighting. Keep the camera steady for best results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className='absolute right-6 bottom-6 left-6'>
        <div className='flex items-center justify-between'>
          <Link
            href={`/${userId}/flowers/${flowerId}`}
            className='rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10'
          >
            Cancel
          </Link>
          <button
            onClick={capturePhoto}
            disabled={uploading || !stream}
            className='flex h-16 w-16 items-center justify-center rounded-full bg-green-600 transition-colors hover:bg-green-700 disabled:opacity-50'
          >
            {uploading ? (
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent' />
            ) : (
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
            )}
          </button>
          <div className='w-16' /> {/* Spacer for centering */}
        </div>
      </div>

      <canvas ref={canvasRef} className='hidden' />
    </div>
  );
}
