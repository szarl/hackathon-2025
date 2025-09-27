'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/services/actions/chatActions';
import { FlowerRecord } from '@/services/actions/flowerActions';
import ChatMessage from './ChatMessage';
import VoiceInput from './VoiceInput';

interface ChatInterfaceProps {
  flower: FlowerRecord;
  userId: string;
  initialMessages: ChatMessageType[];
}

export default function ChatInterface({ flower, userId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string, audioUrl?: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: `temp-${Date.now()}`,
      flower_id: flower.id,
      user_id: userId,
      role: 'user',
      content: message,
      audio_url: audioUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          flower_id: flower.id,
          user_id: userId,
          audio_url: audioUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Replace the temporary user message with the real one from the server
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== userMessage.id);
        return [...filtered, data.userMessage, data.assistantMessage];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));

      // Add error message
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        flower_id: flower.id,
        user_id: userId,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = (transcript: string) => {
    setInputMessage(transcript);
    sendMessage(transcript);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className='flex h-[calc(100vh-200px)] flex-col'>
      {/* Messages Area */}
      <div className='flex-1 space-y-4 overflow-y-auto p-6'>
        {messages.length === 0 ? (
          <div className='py-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
              <svg className='h-8 w-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
              </svg>
            </div>
            <h3 className='mb-2 text-lg font-medium text-[#111111]'>Start a conversation</h3>
            <p className='mb-4 text-sm text-[#9aa3a7]'>Ask me anything about your {flower.name} plant!</p>
            <div className='mx-auto max-w-md rounded-lg bg-[rgba(247,249,248,0.5)] p-4 text-left'>
              <p className='mb-2 text-sm font-medium text-[#111111]'>Try asking:</p>
              <ul className='space-y-1 text-xs text-[#9aa3a7]'>
                <li>• "How often should I water this plant?"</li>
                <li>• "Why are the leaves turning yellow?"</li>
                <li>• "What's the best fertilizer for this plant?"</li>
                <li>• "How much sunlight does it need?"</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='rounded-2xl border border-[rgba(17,17,17,0.1)] bg-white px-4 py-3'>
              <div className='flex items-center gap-3'>
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
                <div className='flex space-x-1'>
                  <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400'></div>
                  <div
                    className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className='border-t border-[rgba(17,17,17,0.1)] bg-white p-6'>
        <div className='flex items-center gap-4'>
          {/* Voice Input */}
          <VoiceInput onTranscription={handleVoiceTranscription} disabled={isLoading} />

          {/* Text Input */}
          <form onSubmit={handleSubmit} className='flex flex-1 items-center gap-3'>
            <input
              type='text'
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder='Type your message...'
              disabled={isLoading}
              className='flex-1 rounded-full border border-[rgba(17,17,17,0.1)] px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50'
            />
            <button
              type='submit'
              disabled={!inputMessage.trim() || isLoading}
              className='rounded-full bg-[#2a7f62] px-6 py-3 text-white transition-colors hover:bg-[#1f5f4a] disabled:cursor-not-allowed disabled:opacity-50'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
