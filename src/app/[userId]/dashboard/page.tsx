'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFlowersLimited, getRandomFlower, type FlowerRecord } from '@/services/actions/flowerActions';
import { supabase } from '@/services/supabase/client';
import AnimatedCounter from '@/components/AnimatedCounter';
import CameraModal from '@/components/CameraModal';
import Link from 'next/link';

interface DashboardStats {
  totalPlants: number;
  healthyPlants: number;
  needsAttention: number;
  totalSpecies: number;
}

export default function DashboardPage({ params }: { params: { userId: string } }) {
  const [user, setUser] = useState<any>(null);
  const [flowers, setFlowers] = useState<FlowerRecord[]>([]);
  const [randomFlower, setRandomFlower] = useState<FlowerRecord | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlants: 0,
    healthyPlants: 0,
    needsAttention: 0,
    totalSpecies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/auth');
          return;
        }

        setUser(user);

        // Fetch limited flowers for "Your plants" section
        const limitedFlowers = await getUserFlowersLimited(user.id, 2);
        setFlowers(limitedFlowers);

        // Fetch random flower for tasks
        const random = await getRandomFlower(user.id);
        setRandomFlower(random);

        // Calculate stats (mock data for now)
        const allFlowers = await getUserFlowersLimited(user.id, 100); // Get more for stats
        const healthyCount = allFlowers.filter((f) => f.health_status === 'healthy').length;
        const needsAttentionCount = allFlowers.filter((f) => f.health_status === 'needs_attention').length;
        const uniqueSpecies = new Set(allFlowers.map((f) => f.name)).size;

        setStats({
          totalPlants: allFlowers.length,
          healthyPlants: healthyCount,
          needsAttention: needsAttentionCount,
          totalSpecies: uniqueSpecies,
        });
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const handleQuickAction = (action: string) => {
    if (!user) return;

    switch (action) {
      case 'scan':
        setShowCamera(true);
        break;
      case 'myPlants':
        router.push(`/${user.id}/flowers`);
        break;
      case 'smartSensors':
        router.push(`/${user.id}/smarthome`);
        break;
      case 'lightAnalysis':
        router.push(`/${user.id}/lightAnalysis`);
        break;
      case 'exclusiveDiscounts':
        router.push(`/${user.id}/partnerships`);
        break;
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='relative box-border flex size-full flex-col content-stretch items-start gap-[32px] bg-[#f7f9f8] p-[24px]'>
      {/* Header */}
      <div className='relative h-[44px] shrink-0'>
        <div className='relative box-border flex h-[44px] content-stretch items-center gap-[12px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='relative flex shrink-0 flex-col content-stretch items-start font-["Inter:Regular",_sans-serif] leading-[0] font-normal text-nowrap not-italic'>
            <div className='relative shrink-0 text-[16px] tracking-[-0.3125px] text-[#111111]'>
              <p className='leading-[24px] text-nowrap whitespace-pre'>Good morning! 👋</p>
            </div>
            <div className='relative shrink-0 text-[14px] tracking-[-0.1504px] text-[#9aa3a7]'>
              <p className='leading-[20px] text-nowrap whitespace-pre'>
                {user?.user_metadata?.full_name || 'Plant Lover'}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className='relative w-full shrink-0'>
        <div className='relative box-border flex w-full content-stretch items-center gap-[12px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='relative box-border flex min-h-px min-w-px shrink-0 grow basis-0 flex-col content-stretch items-center gap-[8px] rounded-[12px] bg-white p-[9px]'>
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
            />
            <div className='relative shrink-0 text-center font-["Inter:Medium",_sans-serif] text-[24px] leading-[0] font-medium tracking-[0.0703px] text-nowrap text-[#2e7d32] not-italic'>
              <p className='leading-[32px] whitespace-pre'>
                <AnimatedCounter value={stats.healthyPlants} />
              </p>
            </div>
            <div className='relative h-[16px] w-[67.328px] shrink-0'>
              <div className='relative box-border h-[16px] w-[67.328px] border-0 border-solid border-[transparent] bg-clip-padding'>
                <div className='absolute top-px left-[34.1px] translate-x-[-50%] text-center font-["Inter:Regular",_sans-serif] text-[12px] leading-[0] font-normal text-nowrap text-[#9aa3a7] not-italic'>
                  <p className='leading-[16px] whitespace-pre'>Healthy</p>
                </div>
              </div>
            </div>
          </div>
          <div className='relative box-border flex min-h-px min-w-px shrink-0 grow basis-0 flex-col content-stretch items-center gap-[8px] rounded-[12px] bg-white p-[9px]'>
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
            />
            <div className='relative shrink-0 text-center font-["Inter:Medium",_sans-serif] text-[24px] leading-[0] font-medium tracking-[0.0703px] text-nowrap text-[#ed6c02] not-italic'>
              <p className='leading-[32px] whitespace-pre'>
                <AnimatedCounter value={stats.needsAttention} />
              </p>
            </div>
            <div className='relative h-[16px] w-[67.328px] shrink-0'>
              <div className='relative box-border h-[16px] w-[67.328px] border-0 border-solid border-[transparent] bg-clip-padding'>
                <div className='absolute top-px left-[34.6px] translate-x-[-50%] text-center font-["Inter:Regular",_sans-serif] text-[12px] leading-[0] font-normal text-nowrap text-[#9aa3a7] not-italic'>
                  <p className='leading-[16px] whitespace-pre'>Need care</p>
                </div>
              </div>
            </div>
          </div>
          <div className='relative box-border flex min-h-px min-w-px shrink-0 grow basis-0 flex-col content-stretch items-center gap-[8px] rounded-[12px] bg-white p-[9px]'>
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
            />
            <div className='relative shrink-0 text-center font-["Inter:Medium",_sans-serif] text-[24px] leading-[0] font-medium tracking-[0.0703px] text-nowrap text-[#d32f2f] not-italic'>
              <p className='leading-[32px] whitespace-pre'>
                <AnimatedCounter value={stats.totalPlants - stats.healthyPlants - stats.needsAttention} />
              </p>
            </div>
            <div className='relative h-[16px] w-[67.328px] shrink-0'>
              <div className='relative box-border h-[16px] w-[67.328px] border-0 border-solid border-[transparent] bg-clip-padding'>
                <div className='absolute top-px left-[34.1px] translate-x-[-50%] text-center font-["Inter:Regular",_sans-serif] text-[12px] leading-[0] font-normal text-nowrap text-[#9aa3a7] not-italic'>
                  <p className='leading-[16px] whitespace-pre'>Critical</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className='relative w-full shrink-0'>
        <div className='relative box-border flex w-full flex-col content-stretch items-start gap-[16px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='relative flex h-[32px] w-full shrink-0 content-stretch items-center justify-between'>
            <div className='relative shrink-0 font-["Inter:Regular",_sans-serif] text-[16px] leading-[0] font-normal tracking-[-0.3125px] text-nowrap text-[#111111] not-italic'>
              <p className='leading-[24px] whitespace-pre'>Tasks</p>
            </div>
            <div className='relative h-[32px] w-[74.578px] shrink-0 rounded-[6px]'>
              <div className='relative box-border flex h-[32px] w-[74.578px] content-stretch items-center justify-center gap-[6px] border-0 border-solid border-[transparent] bg-clip-padding px-[12px] py-0'>
                <div className='relative shrink-0 font-["Inter:Medium",_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic'>
                  <Link href={`/${user.id}/calendar`}>
                    <p className='leading-[20px] whitespace-pre'>View all</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {randomFlower ? (
            <div className='relative box-border flex h-[82px] w-full shrink-0 flex-col content-stretch items-start rounded-[12px] bg-white p-[17px]'>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className='relative min-h-px w-full min-w-px shrink-0 grow basis-0'>
                <div className='relative box-border flex size-full content-stretch items-center gap-[12px] border-0 border-solid border-[transparent] bg-clip-padding'>
                  <div className='relative size-[48px] shrink-0 rounded-[8px] bg-[#f7f9f8]'>
                    <div className='relative box-border flex size-[48px] flex-col content-stretch items-start overflow-clip border-0 border-solid border-[transparent] bg-clip-padding'>
                      <div className='relative h-[48px] w-full shrink-0'>
                        <img
                          alt={randomFlower.name}
                          className='object-50%-50% pointer-events-none absolute inset-0 size-full max-w-none rounded-[8px] object-cover'
                          src={randomFlower.image_url}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='relative min-h-px min-w-px shrink-0 grow basis-0'>
                    <div className='relative box-border flex w-full content-stretch items-center justify-between border-0 border-solid border-[transparent] bg-clip-padding'>
                      <div className='relative h-[44px] w-[107.734px] shrink-0'>
                        <div className='relative box-border flex h-[44px] w-[107.734px] flex-col content-stretch items-start border-0 border-solid border-[transparent] bg-clip-padding'>
                          <div className='relative h-[24px] w-full shrink-0'>
                            <div className='absolute top-[-0.5px] left-0 font-["Inter:Medium",_sans-serif] text-[16px] leading-[0] font-medium tracking-[-0.3125px] text-nowrap text-[#111111] not-italic'>
                              <p className='leading-[24px] whitespace-pre'>{randomFlower.name}</p>
                            </div>
                          </div>
                          <div className='relative h-[20px] w-full shrink-0'>
                            <div className='absolute top-[0.5px] left-0 font-["Inter:Regular",_sans-serif] text-[14px] leading-[0] font-normal tracking-[-0.1504px] text-nowrap text-[#9aa3a7] not-italic'>
                              <p className='leading-[20px] whitespace-pre'>Water • Today</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='relative h-[32px] w-[58.586px] shrink-0 rounded-[6px] bg-[#2a7f62]'>
                        <div className='relative box-border flex h-[32px] w-[58.586px] content-stretch items-center justify-center gap-[6px] border-0 border-solid border-[transparent] bg-clip-padding px-[12px] py-0'>
                          <div className='relative shrink-0 font-["Inter:Medium",_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-white not-italic'>
                            <p className='leading-[20px] whitespace-pre'>Done</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='relative box-border flex h-[82px] w-full shrink-0 flex-col content-stretch items-center justify-center rounded-[12px] bg-white p-[17px]'>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className='relative shrink-0 text-center font-["Inter:Regular",_sans-serif] text-[14px] leading-[0] font-normal tracking-[-0.1504px] text-nowrap text-[#9aa3a7] not-italic'>
                <p className='leading-[20px] whitespace-pre'>No tasks yet. Add your first plant!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='relative h-[296px] w-full shrink-0'>
        <div className='relative box-border flex h-[296px] w-full flex-col content-stretch items-start gap-[16px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='relative h-[24px] w-full shrink-0'>
            <div className='absolute top-[-0.5px] left-0 font-["Inter:Regular",_sans-serif] text-[16px] leading-[0] font-normal tracking-[-0.3125px] text-nowrap text-[#111111] not-italic'>
              <p className='leading-[24px] whitespace-pre'>Quick actions</p>
            </div>
          </div>
          <div className='relative grid h-[172px] w-full shrink-0 grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] gap-[12px]'>
            <button
              onClick={() => handleQuickAction('scan')}
              className='relative box-border flex shrink-0 flex-col content-stretch items-center justify-center gap-[16px] rounded-[6px] bg-white p-px [grid-area:1_/_1]'
            >
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[6px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className='relative size-[16px] shrink-0'>
                <svg className='size-full' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                  />
                </svg>
              </div>
              <div className='relative h-[20px] w-[69.719px] shrink-0'>
                <div className='relative box-border h-[20px] w-[69.719px] border-0 border-solid border-[transparent] bg-clip-padding'>
                  <div className='absolute top-[0.5px] left-0 font-["Inter:Medium",_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic'>
                    <p className='leading-[20px] whitespace-pre'>Scan plant</p>
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('myPlants')}
              className='relative box-border flex shrink-0 flex-col content-stretch items-center justify-center gap-[16px] rounded-[6px] bg-white p-px [grid-area:1_/_2]'
            >
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[6px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className='relative size-[16px] shrink-0'>
                <svg className='size-full' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  />
                </svg>
              </div>
              <div className='relative h-[20px] w-[64.18px] shrink-0'>
                <div className='relative box-border h-[20px] w-[64.18px] border-0 border-solid border-[transparent] bg-clip-padding'>
                  <div className='absolute top-[0.5px] left-0 font-["Inter:Medium",_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic'>
                    <p className='leading-[20px] whitespace-pre'>My plants</p>
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('smartSensors')}
              className='relative box-border flex shrink-0 flex-col content-stretch items-center justify-center gap-[16px] rounded-[6px] bg-white p-px [grid-area:2_/_1]'
            >
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[6px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className='relative size-[16px] shrink-0'>
                <svg className='size-full' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <div className='relative h-[20px] w-[95.328px] shrink-0'>
                <div className='relative box-border h-[20px] w-[95.328px] border-0 border-solid border-[transparent] bg-clip-padding'>
                  <div className='absolute top-[0.5px] left-0 font-["Inter:Medium",_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic'>
                    <p className='leading-[20px] whitespace-pre'>Smart sensors</p>
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickAction('lightAnalysis')}
              className='relative box-border flex shrink-0 flex-col content-stretch items-center justify-center gap-[16px] rounded-[6px] bg-white p-px [grid-area:2_/_2]'
            >
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[6px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className='relative size-[16px] shrink-0'>
                <svg className='size-full' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                </svg>
              </div>
              <div className='relative h-[20px] w-[90.172px] shrink-0'>
                <div className='relative box-border h-[20px] w-[90.172px] border-0 border-solid border-[transparent] bg-clip-padding'>
                  <div className='absolute top-[0.5px] left-0 font-["Inter:Medium",_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic'>
                    <p className='leading-[20px] whitespace-pre'>Light analysis</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
          <button
            onClick={() => handleQuickAction('exclusiveDiscounts')}
            className='relative flex h-[48px] w-full shrink-0 items-center justify-center gap-[6px] rounded-[6px] bg-white'
          >
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 rounded-[6px] border border-solid border-[rgba(17,17,17,0.1)]'
            />
            <div className='relative size-[16px]'>
              <svg className='size-full' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                />
              </svg>
            </div>
            <div className='font-["Inter:Medium",_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic'>
              <p className='leading-[20px] whitespace-pre'>Exclusive discounts</p>
            </div>
          </button>
        </div>
      </div>

      {/* Your Plants Section */}
      <div className='relative w-full shrink-0'>
        <div className='relative box-border flex w-full flex-col content-stretch items-start gap-[16px] border-0 border-solid border-[transparent] bg-clip-padding'>
          <div className='relative flex h-[32px] w-full shrink-0 content-stretch items-center justify-between'>
            <div className='relative h-[24px] w-[81.109px] shrink-0'>
              <div className='relative box-border h-[24px] w-[81.109px] border-0 border-solid border-[transparent] bg-clip-padding'>
                <div className='absolute top-[-0.5px] left-0 font-["Inter:Regular",_sans-serif] text-[16px] leading-[0] font-normal tracking-[-0.3125px] text-nowrap text-[#111111] not-italic'>
                  <p className='leading-[24px] whitespace-pre'>Your plants</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleQuickAction('myPlants')}
              className='relative h-[32px] w-[74.578px] shrink-0 rounded-[6px]'
            >
              <div className='relative box-border flex h-[32px] w-[74.578px] content-stretch items-center justify-center gap-[6px] border-0 border-solid border-[transparent] bg-clip-padding px-[12px] py-0'>
                <div className='relative shrink-0 font-["Inter:Medium",_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic'>
                  <p className='leading-[20px] whitespace-pre'>View all</p>
                </div>
              </div>
            </button>
          </div>
          {flowers.length > 0 ? (
            <div className='relative grid w-full shrink-0 grid-cols-2 gap-3'>
              {flowers.map((flower, index) => (
                <div
                  key={flower.id}
                  className='relative flex flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm'
                >
                  <div className='relative mb-3 h-32 w-full overflow-hidden rounded-lg bg-gray-50'>
                    <img alt={flower.name} className='h-full w-full object-cover' src={flower.image_url} />
                  </div>
                  <div className='flex flex-col space-y-2'>
                    <h3 className='truncate text-sm font-medium text-gray-900'>{flower.name}</h3>
                    <div className='flex items-center justify-between'>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          flower.health_status === 'healthy' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'
                        }`}
                      >
                        {flower.health_status === 'healthy' ? 'Good' : 'Care'}
                      </span>
                      <span className='text-xs text-gray-500'>Next week</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='relative box-border flex h-[222px] w-full shrink-0 flex-col content-stretch items-center justify-center rounded-[12px] bg-white p-[17px]'>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className='relative shrink-0 text-center font-["Inter:Regular",_sans-serif] text-[14px] leading-[0] font-normal tracking-[-0.1504px] text-nowrap text-[#9aa3a7] not-italic'>
                <p className='leading-[20px] whitespace-pre'>No plants yet. Add your first plant!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && <CameraModal isOpen={showCamera} onClose={() => setShowCamera(false)} userId={user.id} />}
    </div>
  );
}
