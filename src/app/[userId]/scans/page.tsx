import { getAllFlowerUpdates } from '@/services/actions/flowerActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ScansPageProps {
  params: Promise<{ userId: string }>;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Processing';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}

function getIssueTypeColor(issueType: string | null) {
  switch (issueType) {
    case 'light':
      return 'bg-orange-100 text-orange-800';
    case 'water':
      return 'bg-blue-100 text-blue-800';
    case 'nutrients':
      return 'bg-purple-100 text-purple-800';
    case 'pests':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function ScansPage({ params }: ScansPageProps) {
  const { userId } = await params;

  const scans = await getAllFlowerUpdates(userId);

  if (!scans || scans.length === 0) {
    return (
      <div className='min-h-screen bg-[#f7f9f8] px-6 py-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-gray-900'>Plant Scans</h1>
            <p className='mt-2 text-gray-600'>View all your plant health scans and analysis results</p>
          </div>

          <div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-white p-8 shadow-sm'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                <svg className='h-8 w-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900'>No scans yet</h3>
              <p className='mt-2 text-gray-600'>Start by scanning your plants to see their health analysis here.</p>
              <div className='mt-6'>
                <Link
                  href={`/${userId}/flowers`}
                  className='inline-flex items-center rounded-md bg-[#2a7f62] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f5f4a]'
                >
                  <svg className='mr-2 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                  </svg>
                  Go to Plants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f7f9f8] px-6 py-8'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>Plant Scans</h1>
          <p className='mt-2 text-gray-600'>View all your plant health scans and analysis results</p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {scans.map((scan) => (
            <Link
              key={scan.id}
              href={`/${userId}/flowers/${scan.flower_id}/scan/${scan.id}`}
              className='group block rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md'
            >
              <div className='mb-4'>
                <div className='relative h-32 w-full overflow-hidden rounded-lg'>
                  <img
                    src={scan.scan_image_url || scan.flowers?.image_url || '/firstPlant.jpg'}
                    alt={scan.flowers?.name || 'Plant scan'}
                    className='h-full w-full object-cover transition-transform group-hover:scale-105'
                  />
                  <div className='absolute top-2 right-2'>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(scan.status)}`}
                    >
                      {getStatusText(scan.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <div>
                  <h3 className='text-lg font-medium text-gray-900 transition-colors group-hover:text-[#2a7f62]'>
                    {scan.flowers?.name || 'Unknown Plant'}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {new Date(scan.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {scan.issue_type && (
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getIssueTypeColor(scan.issue_type)}`}
                    >
                      {scan.issue_type.charAt(0).toUpperCase() + scan.issue_type.slice(1)} Issue
                    </span>
                    {scan.confidence_score && (
                      <span className='ml-2 text-xs text-gray-500'>
                        {Math.round(scan.confidence_score * 100)}% confidence
                      </span>
                    )}
                  </div>
                )}

                {scan.issue_description && (
                  <p className='line-clamp-2 text-sm text-gray-600'>{scan.issue_description}</p>
                )}

                {scan.recommendations && Array.isArray(scan.recommendations) && scan.recommendations.length > 0 && (
                  <div className='flex items-center text-sm text-gray-500'>
                    <svg className='mr-1 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    {scan.recommendations.length} recommendation{scan.recommendations.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {scans.length > 0 && (
          <div className='mt-8 text-center'>
            <p className='text-sm text-gray-500'>
              Showing {scans.length} scan{scans.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
