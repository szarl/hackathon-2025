import { getFlowerById, FlowerRecord } from '@/services/actions/flowerActions';
import { getChatHistory } from '@/services/actions/chatActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChatInterface } from '@/components/chat';

interface ChatPageProps {
  params: { id: string; userId: string };
}

function BackIcon() {
  return (
    <svg className='size-4' viewBox='0 0 24 24' fill='none'>
      <path
        d='M19 12H5M12 19L5 12L12 5'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id, userId } = await params;

  const flower = await getFlowerById(id, userId);

  if (!flower) {
    notFound();
  }

  // Load chat history
  const chatHistory = await getChatHistory(id, userId);

  return (
    <div className='min-h-screen bg-[#f7f9f8]'>
      {/* Header */}
      <div className='border-b border-[rgba(17,17,17,0.1)] bg-white px-6 py-6'>
        <div className='flex items-center justify-between'>
          <Link
            href={`/${userId}/flowers/${id}`}
            className='flex items-center gap-2 text-[#111111] transition-opacity hover:opacity-70'
          >
            <BackIcon />
            <span className='text-sm font-medium'>Back</span>
          </Link>
        </div>

        <div className='mt-6'>
          <h2 className='mb-1 text-xl font-normal text-[#111111]'>Chat with Plantastic</h2>
          <p className='text-sm text-[#9aa3a7]'>Ask questions about {flower.name}</p>
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface flower={flower} userId={userId} initialMessages={chatHistory} />
    </div>
  );
}
