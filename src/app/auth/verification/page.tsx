import Image from 'next/image';
import Link from 'next/link';
import emailIcon from '@/assets/email.svg';

export default function VerificationPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8 text-center'>
        <Image
          src={emailIcon}
          alt='Email has been sent'
          width={164}
          height={164}
          className='mx-auto mb-4'
          priority
          loading='eager'
        />
        <h1 className='text-3xl font-bold'>Check your email</h1>
        <p className='mt-2 text-gray-600'>
          We&apos;ve sent you an email with a verification link. Please check your inbox and click the link to complete
          your registration.
        </p>
        <div className='mt-6'>
          <Link href='/auth' className='text-green-600 hover:text-green-800'>
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
