import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { appConst } from '@/models/const';
import HamburgerMenu from '@/components/navigation/HamburgerMenu';

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { userId } = await params;

  return (
    <div className='min-h-screen self-center bg-gray-50'>
      <HamburgerMenu userId={userId} />
      <main className='pt-16 pr-4 pl-4'>{children}</main>
    </div>
  );
}
