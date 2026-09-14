'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Repeat, 
  ShieldAlert, 
  TrendingUp, 
  Dice5, 
  SlidersHorizontal, 
  Sparkles, 
  FileText, 
  Flame,
  LogOut 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'MONEY',
      items: [
        { name: 'Transactions', href: '/transactions', icon: Receipt },
        { name: 'Recurring Spend', href: '/recurring', icon: Repeat },
        
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { name: 'Anomaly Radar', href: '/anomalies', icon: ShieldAlert },
        { name: 'Expense Drift', href: '/drift', icon: TrendingUp },
        
        { name: 'Monte Carlo Simulation', href: '/simulation', icon: Dice5 },
      ],
    },
    {
      title: 'AI',
      items: [
        { name: 'AI Financial Copilot', href: '/assistant', icon: Sparkles },
        { name: 'Financial Report', href: '/report', icon: FileText },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 text-slate-100 select-none">
      <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          WealthMind
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wider text-slate-500 px-3 uppercase">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}