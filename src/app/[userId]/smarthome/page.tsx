'use client';

import React from 'react';

// Mock icons - in a real app, these would be proper SVG components or imported assets
const TrendIcon = () => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M2 12L6 8L10 10L14 4' stroke='#9AA3A7' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
);

const TemperatureIcon = () => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M8 2V14M8 2C6.5 2 5.5 3 5.5 4.5S6.5 7 8 7S10.5 6 10.5 4.5S9.5 2 8 2Z'
      stroke='#ED6C02'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const BrightnessIcon = () => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='8' cy='8' r='3' stroke='#ED6C02' strokeWidth='1.5' />
    <path
      d='M8 1V2M8 14V15M15 8H14M2 8H1M13.364 2.636L12.657 3.343M3.343 12.657L2.636 13.364M13.364 13.364L12.657 12.657M3.343 3.343L2.636 2.636'
      stroke='#ED6C02'
      strokeWidth='1.5'
      strokeLinecap='round'
    />
  </svg>
);

// Circular Progress Component
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 64;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className='relative h-32 w-32'>
      <svg height={radius * 2} width={radius * 2} className='-rotate-90 transform'>
        {/* Background circle */}
        <circle
          stroke='#F7F9F8'
          fill='transparent'
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke='#2E7D32'
          fill='transparent'
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-3xl font-medium text-[#111111]'>{percentage}%</span>
      </div>
    </div>
  );
};

// Bar Chart Component for moisture trend
const MoistureTrendChart = () => {
  const data = [
    { time: '0h', height: 15, value: 18 },
    { time: '6h', height: 20, value: 20 },
    { time: '12h', height: 18, value: 19 },
    { time: '18h', height: 22, value: 21 },
    { time: '24h', height: 25, value: 22 },
    { time: '30h', height: 23, value: 21 },
    { time: '36h', height: 20, value: 20 },
    { time: '42h', height: 19, value: 19 },
  ];

  // Calculate trend line points (around 21 degrees)
  const trendLinePoints = data
    .map((item, index) => {
      const x = (index * 100) / (data.length - 1); // 0 to 100%
      const y = 100 - ((item.value - 15) / 10) * 100; // Scale to chart height
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className='h-full rounded-lg bg-[rgba(247,249,248,0.5)] p-2'>
      <div className='relative flex h-full items-end justify-between pb-2'>
        {/* Trend Line */}
        <svg className='absolute inset-0 h-full w-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <polyline
            points={trendLinePoints}
            fill='none'
            stroke='#2E7D32'
            strokeWidth='0.5'
            strokeDasharray='2,2'
            opacity='0.7'
          />
        </svg>

        {/* Bars */}
        {data.map((item, index) => (
          <div key={index} className='flex flex-col items-center gap-1'>
            <div className='w-3 rounded-t-sm bg-[#2A7F62]' style={{ height: `${Math.max(4, item.height)}px` }} />
            <span className='text-xs text-[#9AA3A7]'>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sensor Status Component
const SensorStatus = ({ name, connected }: { name: string; connected: boolean }) => (
  <div className='flex w-full items-center justify-between'>
    <div className='flex items-center gap-2'>
      <div className={`h-2 w-2 rounded-full ${connected ? 'bg-[#2E7D32]' : 'bg-red-500'}`} />
      <span className='text-sm text-[#111111]'>{name}</span>
    </div>
    <span className='text-xs text-[#9AA3A7]'>{connected ? 'Connected' : 'Disconnected'}</span>
  </div>
);

export default function SmartHomePage() {
  return (
    <div className='flex h-full flex-col gap-6 p-6'>
      {/* Main Moisture Card */}
      <div className='relative h-[306px] rounded-xl border border-[rgba(17,17,17,0.1)] bg-white p-6'>
        <h3 className='text-[#111111]'>Humidity</h3>
        <div className='flex h-full flex-col items-center justify-center'>
          <CircularProgress percentage={45} />
          <div className='mt-8'>
            <div className='inline-block rounded-md bg-[#2E7D32] px-4 py-1'>
              <span className='text-sm font-normal text-white'>Optimal</span>
            </div>
          </div>
        </div>
        <div className='absolute bottom-2 left-1/2 -translate-x-1/2 transform'>
          <span className='text-sm text-[#9AA3A7]'>Last updated 2 min ago</span>
        </div>
      </div>

      {/* 48-Hour Moisture Trend */}
      <div className='h-[194px] rounded-xl border border-[rgba(17,17,17,0.1)] bg-white p-4'>
        <div className='mb-10 flex items-center justify-between'>
          <h3 className='text-base font-normal text-[#111111]'>48-Hour Moisture Trend</h3>
          <TrendIcon />
        </div>
        <div className='h-full'>
          <MoistureTrendChart />
        </div>
      </div>

      {/* Temperature and Brightness Cards */}
      <div className='grid h-[170px] grid-cols-2 gap-4'>
        {/* Temperature Card */}
        <div className='rounded-xl border border-[rgba(17,17,17,0.1)] bg-white p-4'>
          <div className='mb-8 flex items-center gap-3'>
            <div className='rounded-lg bg-[rgba(237,108,2,0.1)] p-2'>
              <TemperatureIcon />
            </div>
            <span className='text-sm text-[#9AA3A7]'>Temperature</span>
          </div>
          <div className='mb-4'>
            <span className='text-2xl font-medium text-[#111111]'>21.5°C</span>
          </div>
          <span className='text-xs text-[#9AA3A7]'>Ideal range</span>
        </div>

        {/* Brightness Card */}
        <div className='rounded-xl border border-[rgba(17,17,17,0.1)] bg-white p-4'>
          <div className='mb-8 flex items-center gap-3'>
            <div className='rounded-lg bg-[rgba(237,108,2,0.1)] p-2'>
              <BrightnessIcon />
            </div>
            <span className='text-sm text-[#9AA3A7]'>Brightness</span>
          </div>
          <div className='mb-4'>
            <span className='text-2xl font-medium text-[#111111]'>800</span>
          </div>
          <span className='text-xs text-[#9AA3A7]'>Lux (Moderate)</span>
        </div>
      </div>

      {/* Sensor Status */}
      <div className='h-[178px] rounded-xl border border-[rgba(17,17,17,0.1)] bg-white p-4'>
        <h3 className='mb-9 text-base font-normal text-[#111111]'>Sensor Status</h3>
        <div className='flex flex-col gap-3'>
          <SensorStatus name='Soil Moisture Sensor' connected={true} />
          <SensorStatus name='Temperature Sensor' connected={true} />
          <SensorStatus name='Light Sensor' connected={true} />
        </div>
      </div>
    </div>
  );
}
