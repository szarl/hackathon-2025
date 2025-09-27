'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscription, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  const startRecording = async () => {
    try {
      setError(null);

      // Check for speech recognition support
      if (!isSupported) {
        setError('Speech recognition is not supported in this browser');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscription(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start voice recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  if (!isSupported) {
    return <div className='text-center text-sm text-gray-500'>Voice input is not supported in this browser</div>;
  }

  return (
    <div className='flex flex-col items-center gap-2'>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
          isRecording ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
      >
        {isRecording ? (
          <svg className='h-6 w-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
            <rect x='6' y='6' width='12' height='12' rx='2' />
          </svg>
        ) : (
          <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
            />
          </svg>
        )}
      </button>

      <div className='text-center'>
        <p className='text-xs text-gray-600'>{isRecording ? 'Listening...' : 'Tap to speak'}</p>
        {error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
