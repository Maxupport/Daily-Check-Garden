"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/lib/context';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAppContext();

  return (
    <nav className="absolute bottom-0 w-full bg-slate-900/80 backdrop-blur-xl border-t border-white/10 pb-6 pt-3 px-6 z-20">
      <div className="flex justify-between items-center">
        <Link href="/" className={`flex flex-col items-center gap-1.5 w-16 transition-colors ${pathname === '/' ? 'text-white' : 'text-white/40'}`}>
          <i className={`fa-solid fa-house text-xl mb-0.5 transition-transform ${pathname === '/' ? 'scale-110' : ''}`}></i>
          <span className="text-[10px] font-medium">花園</span>
        </Link>
        
        <Link href="/quest" className={`flex flex-col items-center gap-1.5 w-16 transition-colors ${pathname === '/quest' ? 'text-brand-purple' : 'text-white/40'}`}>
          <i className={`fa-solid fa-pen-nib text-xl mb-0.5 transition-transform ${pathname === '/quest' ? 'scale-110' : ''}`}></i>
          <span className="text-[10px] font-medium">紀錄</span>
        </Link>
        
        <Link href="/community" className={`flex flex-col items-center gap-1.5 w-16 transition-colors relative ${pathname === '/community' ? 'text-brand-yellow' : 'text-white/40'}`}>
          {user.yellow_flowers > 0 && (
            <>
              <div className="absolute top-0 right-2 w-2 h-2 bg-brand-yellow rounded-full animate-ping"></div>
              <div className="absolute top-0 right-2 w-2 h-2 bg-brand-yellow rounded-full"></div>
            </>
          )}
          <i className={`fa-solid fa-earth-asia text-xl mb-0.5 transition-transform ${pathname === '/community' ? 'scale-110' : ''}`}></i>
          <span className="text-[10px] font-medium">社群</span>
        </Link>
        
        <Link href="/admin" className={`flex flex-col items-center gap-1.5 w-16 transition-colors ${pathname === '/admin' ? 'text-white' : 'text-white/40'}`}>
          <i className={`fa-solid fa-user text-xl mb-0.5 transition-transform ${pathname === '/admin' ? 'scale-110' : ''}`}></i>
          <span className="text-[10px] font-medium">我的</span>
        </Link>
      </div>
    </nav>
  );
}
