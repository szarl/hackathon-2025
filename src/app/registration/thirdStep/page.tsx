import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/services/actions/supabaseActions';
import { ThirdStepFallback, ThirdStepInner } from '@/components/registration/ThirdStepInner';

export default async function ThirdStep() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect('/auth');
  }
  return (
    <Suspense fallback={<ThirdStepFallback />}>
      <ThirdStepInner userId={userId} />
    </Suspense>
  );
}
