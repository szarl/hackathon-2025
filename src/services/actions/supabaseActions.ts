'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };
  const redirectTo = formData.get('redirectTo') as string;

  const { error, data: userData } = await supabase.auth.signInWithPassword(data);
  if (error) {
    redirect('/error');
  }
  revalidatePath('/', 'layout');
  redirect(redirectTo || `/${userData.user.id}/dashboard`);
}

export async function register(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };
  const redirectTo = formData.get('redirectTo') as string;
  const { error } = await supabase.auth.signUp(data);
  if (error) {
    redirect('/error');
  }
  revalidatePath('/', 'layout');
  if (redirectTo) {
    redirect(`/registration?redirectTo=${encodeURIComponent(redirectTo)}`);
  } else {
    redirect('/registration');
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    redirect('/error');
  }
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}
