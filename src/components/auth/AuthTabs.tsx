'use client';

import React, { useState } from 'react';
import SignInForm from './SignInForm';
import RegisterForm from './RegisterForm';

interface AuthTabsProps {
  initialTab?: 'signin' | 'register';
  children?: React.ReactNode;
  redirectTo?: string;
}

export default function AuthTabs({ children, redirectTo, initialTab }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'signin');

  return (
    <>
      <div className='flex border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('signin')}
          className={`w-1/2 py-2 text-center ${
            activeTab === 'signin'
              ? 'border-b-2 border-[#2a7f62] font-medium text-[#2a7f62]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`w-1/2 py-2 text-center ${
            activeTab === 'register'
              ? 'border-b-2 border-[#2a7f62] font-medium text-[#2a7f62]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Register
        </button>
      </div>

      <div className='relative my-6 min-h-[400px]'>
        <div
          className='absolute w-full transition-opacity duration-300 ease-in-out'
          style={{
            opacity: activeTab === 'signin' ? 1 : 0,
            pointerEvents: activeTab === 'signin' ? 'auto' : 'none',
            zIndex: activeTab === 'signin' ? 1 : 0,
          }}
        >
          <SignInForm redirectTo={redirectTo} />
          {children}
        </div>
        <div
          className='absolute w-full transition-opacity duration-300 ease-in-out'
          style={{
            opacity: activeTab === 'register' ? 1 : 0,
            pointerEvents: activeTab === 'register' ? 'auto' : 'none',
            zIndex: activeTab === 'register' ? 1 : 0,
          }}
        >
          <RegisterForm redirectTo={redirectTo} />
          {children}
        </div>
      </div>
    </>
  );
}
