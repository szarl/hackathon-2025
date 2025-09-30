'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MainPlant from '@/assets/PlantMain.svg';
import PlantIcon from '@/assets/plant.svg';
import CactusIcon from '@/assets/Cactus.svg';

export default function PlantExperienceSelection() {
  const [selectedOption, setSelectedOption] = useState<boolean | null>(null);

  const handleOptionClick = (hasPlants: boolean) => {
    setSelectedOption(hasPlants);
  };

  return (
    <div className='relative box-border flex size-full min-h-screen flex-col content-stretch items-center justify-between bg-[#f7f9f8] px-[24px] pt-[56px] pb-[24px]'>
      <div className='relative w-full max-w-md shrink-0'>
        <div className='relative box-border flex w-full flex-col content-stretch items-center gap-[56px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='relative flex w-full shrink-0 flex-col content-stretch items-center gap-[32px]'>
            <div className='relative size-[58px] shrink-0'>
              <Image src={MainPlant} alt='LeafCare Logo' width={58} height={58} />
            </div>
            <div className='relative flex w-full shrink-0 flex-col content-stretch items-center gap-[12px] leading-[0] not-italic'>
              <div className='relative min-w-full shrink-0 text-center text-[24px] font-medium tracking-[0.0703px] text-[#111111]'>
                <p className='leading-[32px]'>Welcome to your plant journey!</p>
              </div>
              <div className='relative shrink-0 text-[16px] font-normal tracking-[-0.3125px] text-nowrap text-[#9aa3a7]'>
                <p className='leading-[24px] whitespace-pre'>Let's personalize your LeafCare experience</p>
              </div>
            </div>
          </div>
          <div className='relative flex w-full shrink-0 flex-col content-stretch items-center gap-[32px]'>
            <div className='relative flex w-[263px] shrink-0 flex-col content-stretch items-center gap-[16px] text-center leading-[0] font-normal not-italic'>
              <div className='relative w-full shrink-0 text-[16px] tracking-[-0.3125px] text-[#111111]'>
                <p className='leading-[24px]'>Do you already have plants?</p>
              </div>
              <div className='relative w-full shrink-0 text-[14px] tracking-[-0.1504px] text-[#9aa3a7]'>
                <p className='leading-[20px]'>This helps us customize your experience</p>
              </div>
            </div>
            <div className='relative flex h-[144px] w-full shrink-0 flex-col content-stretch items-start gap-[16px]'>
              <button
                onClick={() => handleOptionClick(true)}
                className={`relative h-[64px] w-full shrink-0 rounded-[6px] border transition-colors ${
                  selectedOption === true
                    ? 'border-[#2a7f62] bg-[#2a7f62]'
                    : 'border-[rgba(17,17,17,0.1)] bg-[#f7f9f8] hover:bg-[#f0f2f1]'
                }`}
              >
                <div className='absolute top-[12px] left-[17px] flex h-[40px] w-[263.805px] content-stretch items-center gap-[12px]'>
                  <div className='relative size-[40px] shrink-0'>
                    <Image src={PlantIcon} alt='Plant' width={40} height={40} />
                  </div>
                  <div className='relative h-[40px] shrink-0'>
                    <div className='relative box-border flex h-[40px] flex-col content-stretch items-start border-0 border-solid border-[transparent] bg-clip-padding'>
                      <div className='relative h-[20px] w-[211.805px] shrink-0'>
                        <div
                          className={`absolute top-[0.5px] left-0 text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic ${
                            selectedOption === true ? 'text-white' : 'text-[#111111]'
                          }`}
                        >
                          <p className='leading-[20px] whitespace-pre'>Yes, I have plants</p>
                        </div>
                      </div>
                      <div className='relative h-[20px] w-[211.805px] shrink-0'>
                        <div
                          className={`absolute top-[0.5px] left-0 text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic ${
                            selectedOption === true ? 'text-[#ebebeb]' : 'text-[#9aa3a7]'
                          }`}
                        >
                          <p className='leading-[20px] whitespace-pre'>I want to scan and monitor them</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleOptionClick(false)}
                className={`relative h-[64px] w-full shrink-0 rounded-[6px] border transition-colors ${
                  selectedOption === false
                    ? 'border-[#2a7f62] bg-[#2a7f62]'
                    : 'border-[rgba(17,17,17,0.1)] bg-[#f7f9f8] hover:bg-[#f0f2f1]'
                }`}
              >
                <div className='absolute top-[12px] left-[16px] flex h-[40px] w-[303.031px] content-stretch items-center gap-[12px]'>
                  <div className='relative size-[40px] shrink-0'>
                    <Image src={CactusIcon} alt='Cactus' width={40} height={40} />
                  </div>
                  <div className='relative h-[40px] min-h-px min-w-px shrink-0 grow basis-0'>
                    <div className='relative box-border flex h-[40px] w-full flex-col content-stretch items-start border-0 border-solid border-[transparent] bg-clip-padding'>
                      <div className='relative h-[20px] w-full shrink-0'>
                        <div
                          className={`absolute top-[0.5px] left-0 text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic ${
                            selectedOption === false ? 'text-white' : 'text-[#111111]'
                          }`}
                        >
                          <p className='leading-[20px] whitespace-pre'>No, I'm new to plants</p>
                        </div>
                      </div>
                      <div className='relative h-[20px] w-full shrink-0'>
                        <div
                          className={`absolute top-[0.5px] left-0 text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic ${
                            selectedOption === false ? 'text-[#ebebeb]' : 'text-[#9aa3a7]'
                          }`}
                        >
                          <p className='leading-[20px] whitespace-pre'>I want recommendations for my space</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Link
        href='/registration/secondStep'
        className='relative h-[48px] w-[336px] shrink-0 cursor-pointer rounded-[6px] bg-[#2a7f62] transition-colors hover:bg-[#2a7f62]/90'
      >
        <div className='relative box-border h-[48px] w-[336px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='absolute top-[14.5px] left-[138.22px] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-white not-italic'>
            <p className='leading-[20px] whitespace-pre'>Continue</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
