"use client";

import { useState } from 'react';
import { useAppContext } from '@/lib/context';
import UserProfileModal, { UserProfile } from '@/components/UserProfileModal';

export default function CommunityPage() {
  const { user, setUser, communityList, setCommunityList, wishList, setWishList, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'quests' | 'wishes'>('quests');
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const triggerFlowerBurst = (e: React.MouseEvent<HTMLButtonElement>, iconClass: string, colorClass: string) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const fxContainer = document.getElementById('fx-container');
    if (!fxContainer) return;

    const icon = document.createElement('i');
    icon.className = `fa-solid ${iconClass} ${colorClass} flower-burst text-3xl`;
    icon.style.left = `${rect.left + rect.width / 2 - 15}px`;
    icon.style.top = `${rect.top - 20}px`;
    
    fxContainer.appendChild(icon);
    
    setTimeout(() => {
      if (fxContainer.contains(icon)) {
        icon.remove();
      }
    }, 1000);
  };

  const handleGiveFlower = (itemId: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (user.yellow_flowers <= 0) return;
    
    setUser(prev => ({ ...prev, yellow_flowers: prev.yellow_flowers - 1 }));
    setCommunityList(prev => prev.map(item => 
      item.id === itemId ? { ...item, red_flowers: item.red_flowers + 1 } : item
    ));
    
    triggerFlowerBurst(e, 'fa-heart', 'text-brand-red');
    showToast('已送出橘花！對方收到了一朵紅花。');
  };

  const handlePledgeWish = (itemId: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (user.yellow_flowers <= 0) return;
    
    setUser(prev => ({ ...prev, yellow_flowers: prev.yellow_flowers - 1 }));
    setWishList(prev => prev.map(item => 
      item.id === itemId ? { ...item, current: item.current + 1 } : item
    ));
    
    triggerFlowerBurst(e, 'fa-seedling', 'text-brand-yellow');
    showToast('已將橘花投入許願池，為他集氣！');
  };

  const openUserProfile = (item: any) => {
    setSelectedUser({
      name: item.author,
      bio: item.bio,
      yellow: item.yellow_flowers,
      red: item.red_flowers,
      purple: item.purple_flowers
    });
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl p-4 flex items-center gap-4">
        <div className="bg-brand-yellow text-slate-900 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-[0_0_10px_rgba(245,158,11,0.6)] shrink-0">
          <i className="fa-solid fa-hand-holding-heart"></i>
        </div>
        <div>
          <p className="text-sm font-semibold">散播正能量</p>
          <p className="text-xs text-white/60">你有 <span className="text-brand-yellow font-bold">{user.yellow_flowers}</span> 朵橘花可以送出。未送出將於午夜重置。</p>
        </div>
      </div>
      
      <div className="flex bg-black/40 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab('quests')} 
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'quests' ? 'bg-white/20 shadow text-white' : 'text-white/50 hover:text-white'}`}
        >
          正在更新的專案
        </button>
        <button 
          onClick={() => setActiveTab('wishes')} 
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'wishes' ? 'bg-white/20 shadow text-white' : 'text-white/50 hover:text-white'}`}
        >
          許願池
        </button>
      </div>

      {activeTab === 'quests' && (
        <div className="space-y-4 animate-fade-in">
          {communityList.map(item => (
            <div key={item.id} className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 -ml-1 rounded-lg transition active:scale-95" onClick={() => openUserProfile(item)}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-xs font-bold">
                    {item.author.substring(0, 1)}
                  </div>
                  <span className="font-semibold text-sm">{item.author}</span>
                </div>
                <span className="text-xs text-white/40">連更 {item.streak} 天</span>
              </div>
              <p className="text-sm text-white/80 line-clamp-2">{item.content}</p>
              
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-brand-red">
                  <i className="fa-solid fa-heart"></i>
                  <span>{item.red_flowers}</span>
                </div>
                <button 
                  onClick={(e) => handleGiveFlower(item.id, e)} 
                  disabled={user.yellow_flowers <= 0} 
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${user.yellow_flowers > 0 ? 'bg-brand-yellow text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.4)] active:scale-90' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
                >
                  <i className="fa-solid fa-seedling"></i> 送花
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'wishes' && (
        <div className="space-y-4 animate-fade-in">
          {wishList.map(item => (
            <div key={item.id} className="glass-panel p-4 rounded-2xl border border-brand-purple/30 bg-gradient-to-br from-brand-purple/5 to-transparent relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <div className="cursor-pointer hover:bg-white/5 p-1 -ml-1 rounded-lg transition active:scale-95" onClick={() => openUserProfile(item)}>
                  <h3 className="font-bold text-brand-purple">{item.title}</h3>
                  <span className="text-xs text-white/60">by {item.author}</span>
                </div>
              </div>
              
              <div className="mb-3 mt-2">
                <div className="w-full bg-slate-800 rounded-full h-2 border border-slate-700 mb-1">
                  <div 
                    className="bg-brand-yellow h-2 rounded-full relative overflow-hidden shadow-[0_0_5px_rgba(245,158,11,0.5)] transition-all" 
                    style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>已集氣：<span className="text-brand-yellow">{item.current}</span></span>
                  <span>目標：{item.target}</span>
                </div>
              </div>
              
              <button 
                onClick={(e) => handlePledgeWish(item.id, e)} 
                disabled={user.yellow_flowers <= 0} 
                className={`w-full py-2 mt-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-brand-purple/50 text-brand-purple ${user.yellow_flowers > 0 ? 'hover:bg-brand-purple hover:text-white active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i> 投入橘花集氣
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
