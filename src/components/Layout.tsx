'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();

  return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-800">
                  Scan-In Feature Poll
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {session ? (
                    <>
                      <Link href="/features/new" className="text-gray-600 hover:text-gray-900">
                        New Feature Request
                      </Link>
                      <button
                          onClick={() => signOut()}
                          className="text-gray-600 hover:text-gray-900"
                      >
                        Sign Out
                      </button>
                    </>
                ) : (
                    <>
                      <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
                        Sign In
                      </Link>
                      <Link href="/auth/signup" className="text-gray-600 hover:text-gray-900">
                        Sign Up
                      </Link>
                    </>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
      </div>
  );
}