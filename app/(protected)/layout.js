'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// Step back 3 levels to find root level lib folder
import { supabase } from '../../lib/supabaseClient';


const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Transactions', href: '/transactions', icon: '💸' },
  { name: 'Recurring Spend', href: '/recurring', icon: '🔄' },
];

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-900">
      {/* Sidebar navigation panel */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <span className="text-2xl">🧠</span>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            WealthMind
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 transition-all"
          >
            <span>🚪</span>
            <span>Exit Workspace</span>
          </button>
        </div>
      </aside>

      {/* Main viewport canvas layout */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}