"use client";

import { useAppContext } from '@/lib/context';

export default function Toast() {
  const { toast } = useAppContext();

  if (!toast.show) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[110] bg-white/90 text-slate-900 px-4 py-2 rounded-full shadow-lg font-bold text-sm whitespace-nowrap animate-fade-in">
      {toast.message}
    </div>
  );
}
