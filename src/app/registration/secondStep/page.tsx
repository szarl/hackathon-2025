'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MainPlant from '@/assets/PlantMain.svg';

interface PlantPreferences {
  lightConditions: string | null;
  spaceSize: string | null;
  experienceLevel: string | null;
  humidityLevel: string | null;
  temperature: string | null;
}

interface ChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

function Chip({ label, isSelected, onClick, className = '' }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`relative h-[32px] rounded-[6px] transition-colors ${
        isSelected ? 'bg-[#2a7f62] text-white' : 'border border-[rgba(17,17,17,0.1)] bg-[#f7f9f8] text-[#111111]'
      } ${className}`}
    >
      <div className='flex h-full items-center justify-center px-3'>
        <span className='text-[12px] leading-[16px] font-medium whitespace-nowrap'>{label}</span>
      </div>
    </button>
  );
}

interface FormSectionProps {
  title: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  equalWidth?: boolean;
}

function FormSection({ title, options, selectedValue, onSelect, equalWidth = false }: FormSectionProps) {
  return (
    <div className='flex w-full flex-col items-start gap-[12px]'>
      <div className='text-[16px] leading-[24px] font-normal tracking-[-0.3125px] text-[#111111]'>{title}</div>
      <div className={`flex w-full items-start gap-[12px] ${equalWidth ? 'h-[32px]' : ''}`}>
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            isSelected={selectedValue === option}
            onClick={() => onSelect(option)}
            className={equalWidth ? 'flex-1' : ''}
          />
        ))}
      </div>
    </div>
  );
}

export default function SecondStep() {
  const [preferences, setPreferences] = useState<PlantPreferences>({
    lightConditions: null,
    spaceSize: null,
    experienceLevel: null,
    humidityLevel: null,
    temperature: null,
  });

  const handlePreferenceChange = (category: keyof PlantPreferences, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: prev[category] === value ? null : value,
    }));
  };

  const isFormComplete = Object.values(preferences).every((value) => value !== null);

  return (
    <div className='relative box-border flex size-full min-h-screen flex-col content-stretch items-center justify-between bg-[#f7f9f8] px-[24px] pt-[56px] pb-[24px]'>
      <div className='relative w-full max-w-md shrink-0'>
        <div className='relative box-border flex w-full flex-col content-stretch items-center gap-[32px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='relative flex w-full shrink-0 flex-col content-stretch items-center gap-[32px]'>
            <div className='relative size-[58px] shrink-0'>
              <Image src={MainPlant} alt='Plantastic Logo' width={58} height={58} />
            </div>
            <div className='relative flex w-full shrink-0 flex-col content-stretch items-center gap-[12px] text-center leading-[0] not-italic'>
              <div className='relative w-full shrink-0 text-[24px] font-medium tracking-[0.0703px] text-[#111111]'>
                <p className='leading-[32px]'>Tell us about your home</p>
              </div>
              <div className='relative w-full shrink-0 text-[16px] font-normal tracking-[-0.3125px] text-[#9aa3a7]'>
                <p className='leading-[24px]'>We'll recommend the perfect plants for your space</p>
              </div>
            </div>
          </div>
          <div className='relative flex w-full shrink-0 flex-col content-stretch items-start gap-[24px]'>
            <FormSection
              title='Light conditions'
              options={['Low', 'Medium', 'High']}
              selectedValue={preferences.lightConditions}
              onSelect={(value) => handlePreferenceChange('lightConditions', value)}
              equalWidth
            />
            <FormSection
              title='Space size'
              options={['Small', 'Medium', 'Large']}
              selectedValue={preferences.spaceSize}
              onSelect={(value) => handlePreferenceChange('spaceSize', value)}
              equalWidth
            />
            <FormSection
              title='Experience level'
              options={['Beginner', 'Some', 'Expert']}
              selectedValue={preferences.experienceLevel}
              onSelect={(value) => handlePreferenceChange('experienceLevel', value)}
              equalWidth
            />
            <FormSection
              title='Humidity level'
              options={['Dry', 'Normal', 'Humid']}
              selectedValue={preferences.humidityLevel}
              onSelect={(value) => handlePreferenceChange('humidityLevel', value)}
              equalWidth
            />
            <FormSection
              title='Temperature'
              options={['Cool', 'Moderate', 'Warm']}
              selectedValue={preferences.temperature}
              onSelect={(value) => handlePreferenceChange('temperature', value)}
              equalWidth
            />
          </div>
        </div>
      </div>
      {isFormComplete ? (
        <Link
          href={`/registration/thirdStep?light=${preferences.lightConditions}&space=${preferences.spaceSize}&experience=${preferences.experienceLevel}&humidity=${preferences.humidityLevel}&temperature=${preferences.temperature}`}
          className='relative flex h-[48px] w-[336px] shrink-0 items-center justify-center rounded-[6px] bg-[#2a7f62] transition-colors hover:bg-[#2a7f62]/90'
        >
          <span className='text-[14px] leading-[20px] font-medium tracking-[-0.1504px] text-white'>Continue</span>
        </Link>
      ) : (
        <div className='relative flex h-[48px] w-[336px] shrink-0 cursor-not-allowed items-center justify-center rounded-[6px] bg-gray-300'>
          <span className='text-[14px] leading-[20px] font-medium tracking-[-0.1504px] text-white'>Continue</span>
        </div>
      )}
    </div>
  );
}
