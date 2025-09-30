'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className='flex min-h-[100dvh] items-center justify-center bg-gray-50 px-6 py-12'>
          <div className='w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200'>
            <div className='flex flex-col items-center gap-4 text-center'>
              <div className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='h-6 w-6'
                  aria-hidden
                >
                  <path
                    fillRule='evenodd'
                    d='M9.401 3.003c1.155-2 4.043-2 5.197 0l7.356 12.744c1.155 2-.289 4.5-2.598 4.5H4.643c-2.31 0-3.753-2.5-2.598-4.5L9.4 3.003zM12 8a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 12 8zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>

              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>Something went wrong</h1>
              <p className='text-gray-600'>We hit an unexpected error. You can try again, or head back home.</p>

              <div className='mt-2 w-full'>
                <details className='group w-full rounded-lg bg-gray-50 p-4 text-left text-sm text-gray-700'>
                  <summary className='cursor-pointer list-none font-medium text-gray-800'>
                    Error details
                    <span className='text-gray-400'> (for debugging)</span>
                  </summary>
                  <pre className='mt-2 overflow-auto text-left text-xs break-words whitespace-pre-wrap text-gray-600'>
                    {error?.message || 'Unknown error'}
                    {error?.digest ? `\n\nDigest: ${error.digest}` : ''}
                  </pre>
                </details>
              </div>

              <div className='mt-4 flex flex-wrap items-center justify-center gap-3'>
                <button
                  onClick={() => reset()}
                  className='inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
                  type='button'
                >
                  Try again
                </button>
                <Link
                  href='/'
                  className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300'
                >
                  Go home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
