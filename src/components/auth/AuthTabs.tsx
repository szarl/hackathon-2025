'use client';

import React, { useState } from 'react';
import SignInForm from './SignInForm';
import RegisterForm from './RegisterForm';

interface AuthTabsProps {
  initialTab?: 'signin' | 'register';
  children?: React.ReactNode;
}

export default function AuthTabs({ children }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState('signin');

  return (
    <>
      <div className='flex border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('signin')}
          className={`w-1/2 py-2 text-center ${
            activeTab === 'signin'
              ? 'border-b-2 border-blue-500 font-medium text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`w-1/2 py-2 text-center ${
            activeTab === 'register'
              ? 'border-b-2 border-blue-500 font-medium text-blue-600'
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
          <SignInForm />
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
          <RegisterForm />
          {children}
        </div>
      </div>
    </>
  );
}
