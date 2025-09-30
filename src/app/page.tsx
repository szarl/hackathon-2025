import { appConst } from '@/models/const';
import Image from 'next/image';
import Link from 'next/link';
import mainImage from '@/assets/PlantMain.svg';

export default function Home() {
  return (
    <div className='relative box-border flex size-full min-h-screen flex-col content-stretch items-center justify-center gap-[32px] bg-[#f7f9f8] p-[24px]'>
      <div className='relative size-[128px] shrink-0'>
        <Image alt='Plantastic Logo' className='block size-full max-w-none' src={mainImage} />
      </div>

      <div className='relative h-[96px] w-full shrink-0'>
        <div className='relative box-border flex h-[96px] w-full flex-col content-stretch items-start gap-[16px] border-0 border-solid border-[transparent] bg-clip-padding text-center leading-[0] not-italic'>
          <div className="relative w-full shrink-0 font-['Inter:Medium',_sans-serif] text-[24px] font-medium tracking-[0.0703px] text-[#111111]">
            <p className='leading-[32px]'>Welcome to {appConst.appName}</p>
          </div>
          <div className="relative w-full shrink-0 font-['Inter:Regular',_sans-serif] text-[16px] font-normal tracking-[-0.3125px] text-[#9aa3a7]">
            <p className='leading-[24px]'>Your personal plant health companion powered by AI</p>
          </div>
        </div>
      </div>

      <div className='relative w-full max-w-[420px] shrink-0'>
        <div className='relative box-border flex w-full flex-col content-stretch items-start gap-[16px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <Link
            href='/auth?registration=false'
            className='relative flex h-[48px] w-full shrink-0 items-center justify-center rounded-[6px] bg-[#2a7f62]'
          >
            <div className="font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-white not-italic">
              <p className='leading-[20px] whitespace-pre'>Sign in</p>
            </div>
          </Link>
          <Link
            href='/auth?registration=true'
            className='relative flex h-[48px] w-full shrink-0 items-center justify-center rounded-[6px] bg-[#f7f9f8]'
          >
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 rounded-[6px] border border-solid border-[rgba(17,17,17,0.1)]'
            />
            <div className="font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic">
              <p className='leading-[20px] whitespace-pre'>Create account</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
