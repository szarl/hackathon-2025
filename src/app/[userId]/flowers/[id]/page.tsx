import { getFlowerById } from '@/services/actions/flowerActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface FlowerDetailPageProps {
  params: { id: string; userId: string };
}

// Chat bubble icon component
function ChatBubbleOutline() {
  return (
    <div className='relative size-full'>
      <svg className='absolute inset-0 size-full' viewBox='0 0 24 24' fill='none'>
        <path
          d='M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path d='M7 9H17M7 13H13' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    </div>
  );
}

export default async function FlowerPage({ params }: FlowerDetailPageProps) {
  const { id, userId } = await params;

  const flower = await getFlowerById(id, userId);

  if (!flower) {
    notFound();
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // For demonstration - in a real app, this would come from a watering log
  const lastWatering = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

  return (
    <div className='relative box-border flex size-full flex-col content-stretch items-center gap-[56px] bg-[#f7f9f8] px-[24px] pt-[56px] pb-[24px]'>
      <div className='relative w-full shrink-0'>
        <div className='relative box-border flex w-full flex-col content-stretch items-start gap-[32px] border-0 border-solid border-[transparent] bg-clip-padding'>
          {/* Image Section */}
          <div className='relative h-[222px] w-full shrink-0 rounded-[12px]'>
            <img
              alt={flower.name}
              className='object-50%-50% pointer-events-none absolute inset-0 size-full max-w-none rounded-[12px] object-cover'
              src={flower.image_url}
            />
          </div>

          <div className='relative flex w-full shrink-0 flex-col content-stretch items-start gap-[32px]'>
            {/* Plant Name and Basic Info */}
            <div className='relative flex w-full shrink-0 flex-col content-stretch items-start gap-[16px]'>
              <div className='relative flex w-full shrink-0 flex-col content-stretch items-start gap-[8px] text-center leading-[0] not-italic'>
                <div className="relative w-full shrink-0 font-['Inter:Medium',_sans-serif] text-[20px] font-medium tracking-[-0.4492px] text-[#111111]">
                  <p className='leading-[28px]'>{flower.name}</p>
                </div>
                <div className="relative w-full shrink-0 font-['Inter:Regular',_sans-serif] text-[14px] font-normal tracking-[-0.1504px] text-[#9aa3a7]">
                  <p className='leading-[20px]'>Plant species</p>
                </div>
              </div>

              <div className="relative flex w-full shrink-0 content-stretch items-start justify-between font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic">
                <div className='relative shrink-0 text-[#111111]'>
                  <p className='leading-[20px] text-nowrap whitespace-pre'>Last watering</p>
                </div>
                <div className='relative shrink-0 text-[#9aa3a7]'>
                  <p className='leading-[20px] text-nowrap whitespace-pre'>
                    {formatDateShort(lastWatering.toISOString())}
                  </p>
                </div>
              </div>

              <div className="relative flex w-full shrink-0 content-stretch items-start justify-between font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic">
                <div className='relative shrink-0 text-[#111111]'>
                  <p className='leading-[20px] text-nowrap whitespace-pre'>Last updated</p>
                </div>
                <div className='relative shrink-0 text-[#9aa3a7]'>
                  <p className='leading-[20px] text-nowrap whitespace-pre'>{formatDateShort(flower.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className='relative box-border flex w-full shrink-0 flex-col content-stretch items-start gap-[16px] rounded-[12px] bg-[rgba(247,249,248,0.5)] p-[17px]'>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className="relative shrink-0 font-['Inter:Regular',_sans-serif] text-[16px] leading-[0] font-normal tracking-[-0.3125px] text-nowrap text-[#111111] not-italic">
                <p className='leading-[24px] whitespace-pre'>Description</p>
              </div>
              <div
                className="relative min-w-full shrink-0 font-['Inter:Regular',_sans-serif] text-[14px] leading-[0] font-normal tracking-[-0.1504px] text-[#9aa3a7] not-italic"
                style={{ width: 'min-content' }}
              >
                <p className='leading-[20px]'>
                  {flower.description ||
                    'Lorem ipsum dolor sit amet consectetur. Egestas lacus nisi etiam rhoncus praesent dolor quam. Libero elementum quis erat magnis sed gravida.'}
                </p>
              </div>
            </div>

            {/* Tasks Schedule Card */}
            <div className='relative box-border flex w-full shrink-0 flex-col content-stretch items-start gap-[16px] rounded-[12px] bg-[rgba(247,249,248,0.5)] p-[17px]'>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className="relative shrink-0 font-['Inter:Regular',_sans-serif] text-[16px] leading-[0] font-normal tracking-[-0.3125px] text-nowrap text-[#111111] not-italic">
                <p className='leading-[24px] whitespace-pre'>Tasks schedule</p>
              </div>

              <div className='relative w-full shrink-0'>
                <div className="relative box-border flex w-full content-stretch items-start justify-between border-0 border-solid border-[transparent] bg-clip-padding font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic">
                  <div className='relative shrink-0 text-[#111111]'>
                    <p className='leading-[20px] text-nowrap whitespace-pre'>Watering</p>
                  </div>
                  <div className='relative shrink-0 text-[#9aa3a7]'>
                    <p className='leading-[20px] text-nowrap whitespace-pre'>
                      {formatDateShort(lastWatering.toISOString())}
                    </p>
                  </div>
                </div>
              </div>

              <div className='relative w-full shrink-0'>
                <div className="relative box-border flex w-full content-stretch items-start justify-between border-0 border-solid border-[transparent] bg-clip-padding font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic">
                  <div className='relative shrink-0 text-[#111111]'>
                    <p className='leading-[20px] text-nowrap whitespace-pre'>Fertilizing</p>
                  </div>
                  <div className='relative shrink-0 text-[#9aa3a7]'>
                    <p className='leading-[20px] text-nowrap whitespace-pre'>{formatDateShort(flower.updated_at)}</p>
                  </div>
                </div>
              </div>

              <div className='relative w-full shrink-0'>
                <div className="relative box-border flex w-full content-stretch items-start justify-between border-0 border-solid border-[transparent] bg-clip-padding font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap not-italic">
                  <div className='relative shrink-0 text-[#111111]'>
                    <p className='leading-[20px] text-nowrap whitespace-pre'>Rotate</p>
                  </div>
                  <div className='relative shrink-0 text-[#9aa3a7]'>
                    <p className='leading-[20px] text-nowrap whitespace-pre'>{formatDateShort(flower.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Notes Card */}
            <div className='relative box-border flex w-full shrink-0 flex-col content-stretch items-start gap-[16px] rounded-[12px] bg-[rgba(247,249,248,0.5)] p-[17px]'>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)]'
              />
              <div className="relative shrink-0 font-['Inter:Regular',_sans-serif] text-[16px] leading-[0] font-normal tracking-[-0.3125px] text-nowrap text-[#111111] not-italic">
                <p className='leading-[24px] whitespace-pre'>Health notes</p>
              </div>
              <div
                className="relative min-w-full shrink-0 font-['Inter:Regular',_sans-serif] text-[14px] leading-[0] font-normal tracking-[-0.1504px] text-[#9aa3a7] not-italic"
                style={{ width: 'min-content' }}
              >
                <p className='leading-[20px]'>
                  {flower.health_notes ||
                    'Lorem ipsum dolor sit amet consectetur. Elementum vulputate ultrices proin diam in viverra faucibus. Rutrum neque neque at enim id varius velit adipiscing.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='relative flex h-[112px] w-full shrink-0 flex-col content-stretch items-start gap-[16px]'>
              <div className='relative box-border flex w-full shrink-0 content-stretch items-center justify-center gap-[12px] rounded-[6px] bg-[#2a7f62] px-[108px] py-[14px]'>
                <div className='relative size-[16px] shrink-0'>
                  <svg className='size-full' viewBox='0 0 24 24' fill='none'>
                    <path d='M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z' fill='white' />
                  </svg>
                </div>
                <div className="relative shrink-0 font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-white not-italic">
                  <p className='leading-[20px] whitespace-pre'>Scan now</p>
                </div>
              </div>

              <div className='relative box-border flex w-full shrink-0 content-stretch items-center justify-center gap-[12px] rounded-[6px] bg-[#f7f9f8] px-[135px] py-[14px]'>
                <div
                  aria-hidden='true'
                  className='pointer-events-none absolute inset-0 rounded-[6px] border border-solid border-[rgba(17,17,17,0.1)]'
                />
                <div className='relative size-[16px] shrink-0 overflow-clip'>
                  <ChatBubbleOutline />
                </div>
                <div className="relative shrink-0 font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-[#111111] not-italic">
                  <p className='leading-[20px] whitespace-pre'>Chat with Plantastic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
