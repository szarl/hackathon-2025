import { getFlowerUpdateById } from '@/services/actions/flowerActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ScanResultPageProps {
  params: Promise<{ id: string; userId: string; scanId: string }>;
}

export default async function ScanResultPage({ params }: ScanResultPageProps) {
  const { id: flowerId, userId, scanId } = await params;

  const scanResult = await getFlowerUpdateById(scanId, userId);

  if (!scanResult) {
    notFound();
  }

  const recommendations = scanResult.recommendations || [];

  return (
    <div className='min-h-screen bg-[#f7f9f8]'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white px-6 py-6'>
        <div className='flex items-center gap-4'>
          <Link
            href={`/${userId}/flowers/${flowerId}`}
            className='flex items-center gap-2 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            <span className='text-sm font-medium'>Back</span>
          </Link>
        </div>

        <div className='mt-4'>
          <div className='inline-flex items-center rounded-md bg-orange-500 px-3 py-1'>
            <span className='text-xs font-medium text-white'>
              {scanResult.issue_type
                ? `${scanResult.issue_type} (${Math.round((scanResult.confidence_score || 0) * 100)}% confidence)`
                : 'Analysis complete'}
            </span>
          </div>
          <p className='mt-2 text-sm text-gray-600'>
            {scanResult.issue_description || 'Plant analysis completed successfully'}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className='px-6 py-6'>
        {/* Scan image */}
        <div className='mb-6'>
          <div className='h-48 w-full overflow-hidden rounded-lg'>
            <img
              alt='Plant scan'
              className='h-full w-full object-cover'
              src={scanResult.scan_image_url || '/placeholder-plant.jpg'}
            />
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className='mb-4 text-lg font-medium text-gray-900'>Recommendations</h3>
          <div className='space-y-3'>
            {recommendations.map((rec: any, index: number) => (
              <div key={index} className='flex items-center gap-3 rounded-lg bg-white p-3'>
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100'>
                  <svg className='h-4 w-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div className='flex-1'>
                  <p className='text-sm text-gray-900'>{rec.action || 'Monitor plant health'}</p>
                </div>
                <div
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    rec.priority === 'urgent'
                      ? 'bg-orange-500 text-white'
                      : rec.priority === 'high'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {rec.priority === 'urgent' ? 'Today' : rec.priority === 'high' ? 'This week' : 'Ongoing'}
                </div>
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className='flex items-center gap-3 rounded-lg bg-white p-3'>
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100'>
                  <svg className='h-4 w-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div className='flex-1'>
                  <p className='text-sm text-gray-900'>Continue monitoring plant health</p>
                </div>
                <div className='rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600'>Ongoing</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className='fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white p-6'>
        <div className='space-y-3'>
          <Link
            href={`/${userId}/flowers/${flowerId}/scan`}
            className='block w-full rounded-md bg-[#2a7f62] py-3 text-center font-medium text-white transition-colors hover:bg-[#1f5f4a]'
          >
            Scan your room
          </Link>
          <div className='flex gap-3'>
            <Link
              href={`/${userId}/flowers/${flowerId}/scan`}
              className='flex-1 rounded-md bg-gray-100 py-2 text-center font-medium text-gray-900 transition-colors hover:bg-gray-200'
            >
              Scan again
            </Link>
            <Link
              href={`/${userId}/flowers/${flowerId}`}
              className='flex-1 rounded-md bg-gray-100 py-2 text-center font-medium text-gray-900 transition-colors hover:bg-gray-200'
            >
              Save diagnosis only
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
