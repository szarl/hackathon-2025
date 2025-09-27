import PlantExperienceSelection from '../../components/auth/PlantExperienceSelection';
import { getCurrentUserId } from '@/services/actions/supabaseActions';
import { redirect } from 'next/navigation';

interface RegistrationPageProps {
  searchParams: {
    redirectTo?: string;
  };
}

export default async function RegistrationPage({ searchParams }: RegistrationPageProps) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect('/auth');
  }

  const redirectTo = '/registration/secondStep';

  return <PlantExperienceSelection redirectTo={redirectTo} userId={userId} />;
}
