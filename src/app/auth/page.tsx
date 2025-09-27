import Link from 'next/link';
import AuthTabs from '@/components/auth/AuthTabs';
import { appConst } from '@/models/const';

export default function AuthPage() {
  return (
    <div className='flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-gray-900'>{appConst.appName}</h1>
        </div>
        <AuthTabs>
          <div className='mt-4 text-center'>
            <Link href='/' className='text-blue-600 hover:text-blue-800'>
              Back to Home
            </Link>
          </div>
        </AuthTabs>
      </div>
    </div>
  );
}
