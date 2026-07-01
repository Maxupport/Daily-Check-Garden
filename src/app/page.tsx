"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import GardenCanvas from '@/components/GardenCanvas';
import ExchangeModal from '@/components/ExchangeModal';

export default function Home() {
  const router = useRouter();
  const { user, setUser, claimDailyFlowers } = useAppContext();
  const [showExchange, setShowExchange] = useState(false);

  const handleClaim = () => {
    claimDailyFlowers();
    setTimeout(() => {
      router.push('/quest');
    }, 600);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center relative">
      <GardenCanvas />
      
      {!user.has_claimed_daily ? (
        <div className="z-20 text-center animate-fade-in cursor-pointer group mt-20" onClick={handleClaim}>
          <div className="text-white/90 text-sm tracking-widest mb-6 font-bold bg-black/40 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            點擊收取今日花束
          </div>
          
          <div className="flex justify-center items-end gap-1 mb-10">
            <div className="text-6xl text-brand-yellow drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] -rotate-12 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"><i className="fa-solid fa-seedling"></i></div>
            <div className="text-7xl text-brand-yellow drop-shadow-[0_0_20px_rgba(245,158,11,0.9)] z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 pb-2"><i className="fa-solid fa-seedling"></i></div>
            <div className="text-6xl text-brand-yellow drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] rotate-12 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"><i className="fa-solid fa-seedling"></i></div>
          </div>
          
          <div className="bg-gradient-to-r from-brand-yellow to-orange-400 text-slate-900 font-bold px-10 py-4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transform transition active:scale-95 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] text-lg">
            收取 3 朵黃橘花
          </div>
        </div>
      ) : (
        <div className="z-10 text-center mt-32 space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl inline-block shadow-lg border border-white/10 bg-white/5 backdrop-blur-md">
            <h2 className="text-white/70 text-sm uppercase tracking-widest mb-2">你的精神花園</h2>
            <div className="flex gap-6 justify-center">
              <div className="text-center">
                <div className="text-4xl text-brand-red drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] mb-1">
                  <i className="fa-solid fa-fan fa-spin-pulse" style={{ animationDuration: '4s' }}></i>
                </div>
                <div className="font-bold text-xl">{user.total_red_flowers}</div>
                <div className="text-xs text-white/50">支持紅花</div>
              </div>
              <div className="text-center">
                <div className="text-4xl text-brand-purple drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] mb-1">
                  <i className="fa-solid fa-star fa-beat" style={{ animationDuration: '3s' }}></i>
                </div>
                <div className="font-bold text-xl">{user.total_purple_flowers}</div>
                <div className="text-xs text-white/50">達標紫花</div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowExchange(true)}
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white/70 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-building-columns text-brand-yellow"></i> 前往央行兌換黃橘花
            </button>
          </div>

          <button onClick={() => router.push('/quest')} className="w-full bg-gradient-to-r from-brand-purple to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg transform transition active:scale-95 text-lg">
            順手更新專案 <i className="fa-solid fa-arrow-right ml-1"></i>
          </button>
        </div>
      )}

      {showExchange && (
        <ExchangeModal
          onClose={() => setShowExchange(false)}
          currentRed={user.total_red_flowers}
          currentPurple={user.total_purple_flowers}
          onExchangeSuccess={(yellowEarned, type, amount) => {
            // Update local context manually to reflect exchange
            setUser(prev => ({
              ...prev,
              yellow_flowers: prev.yellow_flowers + yellowEarned,
              total_red_flowers: type === "RED" ? prev.total_red_flowers - amount : prev.total_red_flowers,
              total_purple_flowers: type === "PURPLE" ? prev.total_purple_flowers - amount : prev.total_purple_flowers
            }));
            alert(`兌換成功！獲得 ${yellowEarned} 朵橘花`);
          }}
        />
      )}
    </div>
  );
}
