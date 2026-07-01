"use client";

import { useState } from 'react';
import { useAppContext } from '@/lib/context';
import CalendarView from '@/components/CalendarView';
import CreateQuestModal from '@/components/CreateQuestModal';

export default function QuestPage() {
  const { quest, hasCheckedInToday, performCheckIn } = useAppContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [logText, setLogText] = useState('');

  const handleCheckIn = () => {
    performCheckIn(logText);
    setLogText('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {quest.total_target_days > 0 && !hasCheckedInToday() && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">今日紀錄</h3>
          <textarea 
            className="w-full bg-black/40 border border-brand-purple/30 rounded-2xl p-4 text-sm focus:outline-none focus:border-brand-purple transition resize-none h-28 placeholder:text-white/30" 
            placeholder="今天有什麼進展或心得？寫下來吧..."
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
          ></textarea>
          <button 
            onClick={handleCheckIn} 
            disabled={!logText.trim()}
            className={`w-full font-bold py-4 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transform transition active:scale-95 text-lg flex items-center justify-center gap-2 ${logText.trim() ? 'bg-brand-yellow text-slate-900' : 'bg-white/10 text-white/30 shadow-none cursor-not-allowed'}`}
          >
            <i className="fa-solid fa-check-circle"></i> 完成打卡 (+1 橘花)
          </button>
        </div>
      )}

      {hasCheckedInToday() && (
        <div className="glass-panel text-center py-6 px-4 rounded-3xl border border-brand-yellow/30 bg-gradient-to-br from-brand-yellow/10 to-transparent">
          <div className="text-3xl text-brand-yellow mb-2"><i className="fa-regular fa-face-smile-beam"></i></div>
          <p className="font-bold text-brand-yellow">今日已完成紀錄！</p>
          <p className="text-xs mt-1 text-white/70">去社群把獲得的橘花送給別人吧</p>
        </div>
      )}

      <div className="glass-panel p-5 rounded-3xl mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">{quest.title || '尚未建立專案'}</h3>
            <p className="text-sm text-white/60">目標：<span>{quest.total_target_days ? quest.total_target_days + ' 天' : '-'}</span></p>
          </div>
          {quest.total_target_days > 0 && (
            <div className="bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full text-xs font-bold border border-brand-purple/30">
              進行中
            </div>
          )}
        </div>
        
        {quest.total_target_days > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>進度：<span>{quest.current_streak}</span>/<span>{quest.total_target_days}</span> 天</span>
              <span className="text-brand-purple">{Math.round((quest.current_streak / quest.total_target_days) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-brand-purple to-pink-500 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${(quest.current_streak / quest.total_target_days) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCreateModal(true)} className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition text-sm font-semibold">
            + 建立新專案
          </button>
        )}
      </div>
      
      <CalendarView />

      {quest.total_target_days > 0 && (
        <div className="glass-panel p-5 rounded-3xl border border-brand-purple/30 bg-gradient-to-br from-brand-purple/10 to-transparent relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-6xl opacity-10 text-brand-purple"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
          <h3 className="font-bold text-brand-purple mb-2"><i className="fa-solid fa-moon mr-2"></i>我的許願池</h3>
          <p className="text-sm text-white/80 mb-4">期望獲得 {quest.wish_target} 朵紫花獎勵</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700">
              <div 
                className="bg-brand-yellow h-3 rounded-full relative overflow-hidden shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-500" 
                style={{ width: `${Math.min((quest.wish_current / (quest.wish_target || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>已集氣：<span className="text-brand-yellow font-bold">{quest.wish_current}</span> 朵橘花</span>
            <span>目標：<span>{quest.wish_target}</span></span>
          </div>
        </div>
      )}

      {showCreateModal && <CreateQuestModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
