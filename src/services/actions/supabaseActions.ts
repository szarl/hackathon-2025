'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import { appConst } from '@/models/const';

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
    options: {
      emailRedirectTo: appConst.appUrl + '/registration',
      data: { fullName: formData.get('fullName') as string },
    },
  };

  const validation = await validateRegisterForm(data);
  if (validation.error) {
    throw new Error(validation.message);
  }

  const { error } = await supabase.auth.signUp(data);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath('/', 'layout');
  redirect(`/auth/verification`);
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

async function validateRegisterForm(data: any): Promise<{ error: boolean; message: string }> {
  if (!data.email || !data.password) {
    return { error: true, message: 'Missing required fields' };
  }
  if (!data.email.includes('@')) {
    return { error: true, message: 'Invalid email' };
  }
  if (data.password.length < 5) {
    return { error: true, message: 'Password must be at least 6 characters long' };
  }

  return { error: false, message: '' };
}
