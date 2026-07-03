'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Change the absolute alias to a direct relative reference path:
import { supabase } from '../lib/supabaseClient';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    };
    checkUserSession();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center space-y-3">
        <div className="text-4xl animate-bounce">🧠</div>
        <p className="text-sm font-medium text-slate-500">Syncing WealthMind application states...</p>
      </div>
    </div>
  );
} 