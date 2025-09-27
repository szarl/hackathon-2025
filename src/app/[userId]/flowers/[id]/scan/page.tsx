import ScanPageClient from '@/app/[userId]/flowers/[id]/scan/ScanPageClient';

interface ScanPageProps {
  params: Promise<{ id: string; userId: string }>;
}

export default async function ScanPage({ params }: ScanPageProps) {
  const { id: flowerId, userId } = await params;

  return <ScanPageClient flowerId={flowerId} userId={userId} />;
}
