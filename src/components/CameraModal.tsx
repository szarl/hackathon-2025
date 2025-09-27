'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CameraModal({ isOpen, onClose, userId }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

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
              const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
              handleFileUpload(file);
            }
          },
          'image/jpeg',
          0.8,
        );
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file-0', file);

      const response = await fetch('/api/flowers/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(`Successfully identified flower!`);
        onClose();
        // Refresh the page to show updated data
        router.refresh();
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed due to network error');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black'>
      {/* Back button */}
      <button
        onClick={onClose}
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
              <h3 className='mb-1 text-sm font-bold text-white'>Tips:</h3>
              <p className='text-sm text-white'>Center one plant. Ensure good light. Keep steady.</p>
            </div>
          </div>
        </div>
      </div>

      <div className='absolute right-6 bottom-6 left-6'>
        <div className='flex items-center justify-between'>
          <button
            onClick={onClose}
            className='rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10'
          >
            Cancel
          </button>
          <button
            onClick={capturePhoto}
            disabled={uploading}
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
