'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
      
      if (data.session?.user) {
        setIsAdmin(data.session.user.email?.includes('admin') || false);
      }
    };
    
    checkUser();
    
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    if (typeof window !== 'undefined') {
      const supabase = getSupabase();
      if (supabase) {
        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
              setIsAdmin(session.user.email?.includes('admin') || false);
            } else {
              setIsAdmin(false);
            }
          }
        );
        authListener = listener;
      }
    }
    
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  return (
    <nav className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center">
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            Hackathon Vote
          </span>
        </Link>
        
        <div className="flex md:order-2">
          {/* Authentication UI elements removed as per requirements */}
        </div>
        
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-800 dark:border-gray-700">
            <li>
              <Link 
                href="/" 
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/projects" 
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Projects
              </Link>
            </li>
            <li>
              <Link 
                href="/results" 
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Results
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link 
                  href="/admin" 
                  className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
