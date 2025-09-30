'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MainPlant from '@/assets/PlantMain.svg';
import {
  generatePlantRecommendations,
  type PlantRecommendation,
  type PlantPreferences,
} from '@/services/actions/plantRecommendationActions';

export interface PlantCardProps {
  recommendation: PlantRecommendation;
  index: number;
}

function PlantCard({ recommendation, index }: PlantCardProps) {
  return (
    <div className='relative box-border flex w-full shrink-0 flex-col content-stretch items-start rounded-[12px] bg-white p-[17px]'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
      />
      <div className='relative w-full shrink-0'>
        <div className='relative box-border flex w-full content-stretch items-start gap-[16px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='relative size-[80px] shrink-0 rounded-[8px] bg-[#f7f9f8]'>
            <div className='relative box-border flex size-[80px] flex-col content-stretch items-start overflow-clip border-0 border-solid border-[transparent] bg-clip-padding'>
              <div className='relative h-[80px] w-full shrink-0'>
                <Image
                  src={recommendation.image}
                  alt={recommendation.name}
                  width={80}
                  height={80}
                  className='pointer-events-none absolute inset-0 size-full max-w-none object-cover'
                />
              </div>
            </div>
          </div>
          <div className='relative min-h-px min-w-px shrink-0 grow basis-0'>
            <div className='relative box-border flex w-full flex-col content-stretch items-start gap-[8px] border-0 border-solid border-[transparent] bg-clip-padding'>
              <div className='relative flex h-[44px] w-full shrink-0 flex-col content-stretch items-start'>
                <div className='relative h-[24px] w-full shrink-0'>
                  <div className='absolute top-[-0.5px] left-0 text-[16px] leading-[0] font-medium tracking-[-0.3125px] text-nowrap text-[#111111] not-italic'>
                    <p className='leading-[24px] whitespace-pre'>{recommendation.name}</p>
                  </div>
                </div>
                <div className='relative h-[20px] w-full shrink-0'>
                  <div className='absolute top-[0.5px] left-0 text-[14px] leading-[0] font-normal tracking-[-0.1504px] text-nowrap text-[#9aa3a7] not-italic'>
                    <p className='leading-[20px] whitespace-pre'>{recommendation.latinName}</p>
                  </div>
                </div>
              </div>
              <div className='relative w-full shrink-0 text-[12px] leading-[0] font-normal tracking-[-0.1504px] text-[#111111] not-italic'>
                <p className='leading-[20px]'>{recommendation.keyReason}</p>
              </div>
              <div className='relative w-full shrink-0 text-[12px] leading-[0] font-normal text-[#9aa3a7] not-italic'>
                <p className='leading-[16px]'>{recommendation.careTip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThirdStepFallback() {
  return (
    <div className='relative box-border flex size-full min-h-screen flex-col content-stretch items-center justify-center bg-[#f7f9f8] px-[24px]'>
      <div className='relative flex flex-col items-center gap-[16px]'>
        <div className='relative size-[58px] shrink-0'>
          <Image src={MainPlant} alt='Plantastic Logo' width={58} height={58} />
        </div>
        <div className='text-[16px] font-normal text-[#9aa3a7]'>Loading your perfect plants...</div>
      </div>
    </div>
  );
}

export function ThirdStepInner({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Get preferences from URL params
        const preferences: PlantPreferences = {
          lightConditions: searchParams.get('light') || 'Medium',
          spaceSize: searchParams.get('space') || 'Medium',
          experienceLevel: searchParams.get('experience') || 'Beginner',
          humidityLevel: searchParams.get('humidity') || 'Normal',
          temperature: searchParams.get('temperature') || 'Moderate',
        };

        const plantRecommendations = await generatePlantRecommendations(preferences);
        setRecommendations(plantRecommendations);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Failed to load plant recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [searchParams]);

  if (loading) {
    return <ThirdStepFallback />;
  }

  if (error) {
    return (
      <div className='relative box-border flex size-full min-h-screen flex-col content-stretch items-center justify-center bg-[#f7f9f8] px-[24px]'>
        <div className='relative flex flex-col items-center gap-[16px] text-center'>
          <div className='relative size-[58px] shrink-0'>
            <Image src={MainPlant} alt='Plantastic Logo' width={58} height={58} />
          </div>
          <div className='text-[16px] font-normal text-[#9aa3a7]'>{error}</div>
          <Link
            href='/registration/secondStep'
            className='relative flex h-[48px] w-[200px] shrink-0 items-center justify-center rounded-[6px] bg-[#2a7f62] transition-colors hover:bg-[#2a7f62]/90'
          >
            <span className='text-[14px] leading-[20px] font-medium tracking-[-0.1504px] text-white'>Try Again</span>
          </Link>
        </div>
      </div>
    );
  }

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
                <p className='leading-[32px]'>Perfect plants for you!</p>
              </div>
              <div className='relative w-full shrink-0 text-[16px] font-normal tracking-[-0.3125px] text-[#9aa3a7]'>
                <p className='leading-[24px]'>Based on your space and experience level</p>
              </div>
            </div>
          </div>
          <div className='relative flex w-full shrink-0 flex-col content-stretch items-start gap-[16px] overflow-clip'>
            {recommendations.map((recommendation, index) => (
              <PlantCard key={index} recommendation={recommendation} index={index} />
            ))}
          </div>
        </div>
      </div>
      <div className='relative w-full max-w-md shrink-0'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 border-[1px_0px_0px] border-solid border-[rgba(17,17,17,0.1)]'
        />
        <div className='relative box-border flex w-full flex-col content-stretch items-start gap-[12px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <Link
            href={`/${userId}/dashboard`}
            className='relative flex h-[48px] w-full shrink-0 items-center justify-center rounded-[6px] bg-[#2a7f62] transition-colors hover:bg-[#2a7f62]/90'
          >
            <div className='text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-white not-italic'>
              <p className='leading-[20px] whitespace-pre'>Start your plant journey</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
