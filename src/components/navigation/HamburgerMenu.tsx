'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface HamburgerMenuProps {
  userId: string;
}

export default function HamburgerMenu({ userId }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { href: `/${userId}/dashboard`, label: 'Dashboard' },
    { href: `/${userId}/calendar`, label: 'Care Calendar' },
    { href: `/${userId}/flowers`, label: 'Flowers' },
    { href: `/${userId}/upload`, label: 'Upload' },
    { href: `/${userId}/smarthome`, label: 'Smarthome' },
    { href: `/${userId}/partnerships`, label: 'Partnerships' },
    { href: `/${userId}/settings`, label: 'Settings' },
  ];

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className='fixed top-4 left-4 z-50 rounded-md border border-gray-200 bg-white p-2 shadow-lg transition-colors hover:bg-gray-50'
        aria-label='Toggle menu'
      >
        <div className='flex h-6 w-6 flex-col items-center justify-center'>
          <span
            className={`block h-0.5 w-6 rounded-sm bg-gray-600 transition-all duration-300 ease-out ${
              isOpen ? 'translate-y-1 rotate-45' : '-translate-y-0.5'
            }`}
          ></span>
          <span
            className={`my-0.5 block h-0.5 w-6 rounded-sm bg-gray-600 transition-all duration-300 ease-out ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          ></span>
          <span
            className={`block h-0.5 w-6 rounded-sm bg-gray-600 transition-all duration-300 ease-out ${
              isOpen ? '-translate-y-1 -rotate-45' : 'translate-y-0.5'
            }`}
          ></span>
        </div>
      </button>

      {isOpen && <div className='bg-opacity-50 fixed inset-0 z-40 bg-black' onClick={closeMenu}></div>}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='p-6 pt-16'>
          <nav className='space-y-4'>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`block rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 ${
                  isActiveLink(item.href) ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className='mt-8 border-t border-gray-200 pt-6'>
            <Link
              href='/auth'
              onClick={closeMenu}
              className='block rounded-lg px-4 py-3 text-red-600 transition-colors hover:bg-red-50'
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
