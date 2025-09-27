import { getUserFlowers, type FlowerRecord } from '@/services/actions/flowerActions';
import { createClient } from '@/services/supabase/server';
import { redirect } from 'next/navigation';
import FlowerGrid from '@/components/flowers/FlowerGrid';

export default async function DashboardPage({ params }: { params: { userId: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth');
  }

  const userId = (await params).userId;
  if (user.id !== userId) {
    redirect('/auth');
  }

  const flowers = await getUserFlowers(user.id);

  return (
    <div className='min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900'>My Flower Collection</h1>
          <p className='mt-2 text-lg text-gray-600'>Discover and manage your identified flowers and plants</p>
        </div>

        {flowers.length === 0 ? (
          <div className='py-12 text-center'>
            <div className='mx-auto h-24 w-24 text-gray-400'>
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 3v18m9-9H3' />
              </svg>
            </div>
            <h3 className='mt-4 text-lg font-medium text-gray-900'>No flowers yet</h3>
            <p className='mt-2 text-gray-500'>
              Upload your first flower image to get started with AI-powered identification!
            </p>
            <div className='mt-6'>
              <a
                href={`/${user.id}/upload`}
                className='inline-flex items-center rounded-md bg-[#2a7f62] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#71e6bf]'
              >
                Upload Flower Image
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className='mb-6 flex items-center justify-between'>
              <p className='text-gray-600'>
                {flowers.length} flower{flowers.length !== 1 ? 's' : ''} in your collection
              </p>
              <a
                href={`/${user.id}/upload`}
                className='inline-flex items-center rounded-md bg-[#2a7f62] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#71e6bf]'
              >
                Add New Flower
              </a>
            </div>
            <FlowerGrid flowers={flowers} userId={user.id} />
          </>
        )}
      </div>
    </div>
  );
}
