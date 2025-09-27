import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface Session {
  user: User;
  expires_at: number;
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          console.debug('Error setting cookies');
        }
      },
    },
  });
}

export async function auth(): Promise<Session> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!data.user || !sessionData.session) {
    return redirect('/auth');
  }

  return {
    user: data.user,
    expires_at: sessionData.session.expires_at!,
  };
}
