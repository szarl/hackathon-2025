'use client';

import { ChatMessage as ChatMessageType } from '@/services/actions/chatActions';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-[#2a7f62] text-white' : 'border border-[rgba(17,17,17,0.1)] bg-white text-[#111111]'
        } `}
      >
        <div className='flex items-start gap-3'>
          {isAssistant && (
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100'>
              <svg className='h-4 w-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
              </svg>
            </div>
          )}

          <div className='flex-1'>
            <p className='text-sm leading-relaxed whitespace-pre-wrap'>{message.content}</p>

            {message.audio_url && (
              <div className='mt-2'>
                <audio controls className='w-full max-w-xs'>
                  <source src={message.audio_url} type='audio/mpeg' />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <p className={`mt-2 text-xs ${isUser ? 'text-green-100' : 'text-gray-500'}`}>
              {new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
