import React from 'react';
import { login } from '@/services/actions/supabaseActions';

interface SignInFormProps {
  redirectTo?: string;
}

export default function SignInForm({ redirectTo }: SignInFormProps) {
  return (
    <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-gray-900'>Sign In</h2>
        <p className='mt-2 text-sm text-gray-600'>Welcome back</p>
      </div>
      <form className='mt-8 space-y-6' action={login}>
        {redirectTo && <input type='hidden' name='redirectTo' value={redirectTo} />}
        <div className='space-y-6'>
          <div className='space-y-2'>
            <label htmlFor='email' className='block text-sm font-medium text-gray-900'>
              Email
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <svg className='h-4 w-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                  />
                </svg>
              </div>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                placeholder='Enter your email'
                className='block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-[#2a7f62] focus:placeholder-gray-400 focus:ring-1 focus:ring-[#2a7f62] focus:outline-none sm:text-sm'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='block text-sm font-medium text-gray-900'>
              Password
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <svg className='h-4 w-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                placeholder='Enter your password'
                className='block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-10 leading-5 placeholder-gray-500 focus:border-[#2a7f62] focus:placeholder-gray-400 focus:ring-1 focus:ring-[#2a7f62] focus:outline-none sm:text-sm'
              />
              <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                <button
                  type='button'
                  className='text-gray-400 hover:text-gray-500 focus:text-gray-500 focus:outline-none'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <button
            type='submit'
            className='flex w-full justify-center rounded-md border border-transparent bg-[#2a7f62] px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#2a7f62]/90 focus:ring-2 focus:ring-[#2a7f62] focus:ring-offset-2 focus:outline-none'
          >
            Sign in
          </button>

          <div className='text-center'>
            <span className='text-sm text-gray-500'>Don't have an account? </span>
            <button
              type='button'
              className='text-sm font-medium text-[#2a7f62] hover:text-[#2a7f62]/80 focus:outline-none'
            >
              Sign up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
