"use client";

import { usePathname } from 'next/navigation';
import { useAppContext } from '@/lib/context';

export default function Header() {
  const pathname = usePathname();
  const { user } = useAppContext();

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'The Garden';
      case '/quest': return '紀錄';
      case '/community': return '社群';
      case '/admin': return '管理與設定';
      case '/auth/register': return '加入';
      case '/auth/signin': return '登入';
      default: return '日更の花圃';
    }
  };

  return (
    <header className="pt-12 pb-4 px-6 flex justify-between items-center z-20 bg-gradient-to-b from-slate-900/90 to-transparent backdrop-blur-sm sticky top-0">
      <h1 className="text-2xl font-bold tracking-wide">{getPageTitle()}</h1>
      <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
        <i className="fa-solid fa-seedling text-brand-yellow drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"></i>
        <span className="font-semibold text-sm">{user.yellow_flowers}</span>
      </div>
    </header>
  );
}
