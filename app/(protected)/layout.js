'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// Safe relative path import to root lib directory
import { supabase } from '../../lib/supabaseClient';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Transactions', href: '/transactions', icon: '💸' },
  { name: 'Recurring Spend', href: '/recurring', icon: '🔄' },
  // High-Impact Portfolio Sidebar Modules
  { name: 'Anomaly Radar', href: '/anomalies', icon: '⚠️' },
  { name: 'Expense Drift', href: '/drift', icon: '📈' },
  { name: 'Monte Carlo Sim', href: '/simulation', icon: '🎲' },
];

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row antialiased text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 bg-slate-900/90 text-white flex flex-col border-r border-slate-800/80 backdrop-blur-xl shrink-0">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
          <span className="text-2xl animate-pulse">🧠</span>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            WealthMind
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            Analytics Engine
          </div>

          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out / Exit Panel */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-all duration-200"
          >
            <span>🚪</span>
            <span className="tracking-tight font-semibold">Exit Workspace</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport Canvas Layout */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto bg-slate-950">
        {children}
      </main>
    </div>
  );
}