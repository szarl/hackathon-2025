import React from 'react';
import { login } from '@/services/actions/supabaseActions';

export default function SignInForm() {
  return (
    <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-gray-900'>Sign In</h2>
        <p className='mt-2 text-sm text-gray-600'>Welcome back</p>
      </div>
      <form className='mt-8 space-y-6' action={login}>
        <div className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email address
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2'
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-900'>
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              required
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2'
            />
          </div>
        </div>

        <div>
          <button
            type='submit'
            className='w-full cursor-pointer rounded-md border border-transparent bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
