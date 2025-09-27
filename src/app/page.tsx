import { appConst } from '@/models/const';
import Image from 'next/image';

export default function Home() {
  return (
    <div className='grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20'>
      <main className='row-start-2 flex flex-col items-center gap-[32px] sm:items-start'>
        <Image className='dark:invert' src='/next.svg' alt='Next.js logo' width={180} height={38} priority />
        <h1 className='text-center text-4xl font-bold text-white sm:text-left'>
          Welcome to <span className='text-blue-600'>{appConst.appName}</span>
        </h1>
      </main>
    </div>
  );
}
