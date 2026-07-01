"use client";

import { useState } from 'react';
import { useAppContext } from '@/lib/context';

export default function CreateQuestModal({ onClose }: { onClose: () => void }) {
  const { setQuest, showToast } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [durationType, setDurationType] = useState<'DAYS'|'WEEKS'|'MONTHS'>('DAYS');
  const [durationValue, setDurationValue] = useState<number>(100);
  const [wishTarget, setWishTarget] = useState<number>(100);

  const calculateTotalDays = () => {
    if (!durationValue) return 0;
    switch (durationType) {
      case 'DAYS': return durationValue;
      case 'WEEKS': return durationValue * 7;
      case 'MONTHS': return durationValue * 30;
      default: return durationValue;
    }
  };

  const totalDays = calculateTotalDays();
  const isValid = title.trim().length > 0 && totalDays >= 21 && wishTarget >= 10;

  const handleCreate = () => {
    if (!isValid) return;

    setQuest({
      title: title.trim(),
      durationType,
      durationValue,
      total_target_days: totalDays,
      current_streak: 0,
      wish_target: wishTarget,
      wish_current: 0,
      logs: []
    });

    showToast('新專案建立成功！開始你的日更之旅吧！');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col p-6 animate-fade-in pt-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">建立新專案</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 active:scale-90 transition">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide pb-20">
        <div>
          <label className="block text-sm font-semibold mb-2 text-white/80">專案名稱</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-purple/50 transition" 
            placeholder="例如：百日寫作計畫" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-white/80">目標長度 (最少 21 天)</label>
          <div className="flex gap-2 mb-2">
            <button onClick={() => setDurationType('DAYS')} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${durationType === 'DAYS' ? 'bg-brand-purple text-white border-brand-purple' : 'bg-transparent text-white/60 border-white/20'}`}>天</button>
            <button onClick={() => setDurationType('WEEKS')} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${durationType === 'WEEKS' ? 'bg-brand-purple text-white border-brand-purple' : 'bg-transparent text-white/60 border-white/20'}`}>週</button>
            <button onClick={() => setDurationType('MONTHS')} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${durationType === 'MONTHS' ? 'bg-brand-purple text-white border-brand-purple' : 'bg-transparent text-white/60 border-white/20'}`}>月</button>
          </div>
          <input 
            type="number" 
            min="1" 
            value={durationValue} 
            onChange={e => setDurationValue(parseInt(e.target.value) || 0)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-purple/50 transition" 
            placeholder="輸入數值..." 
          />
          {totalDays < 21 ? (
            <p className="text-xs text-brand-red mt-2">
              <i className="fa-solid fa-circle-exclamation"></i> 系統換算為 {totalDays} 天。為確保習慣養成，專案長度必須至少 21 天。
            </p>
          ) : (
            <p className="text-xs text-white/50 mt-2">
              系統換算為：總計 <span className="text-brand-purple font-bold">{totalDays}</span> 天
            </p>
          )}
        </div>

        <div className="bg-brand-purple/10 border border-brand-purple/30 p-4 rounded-xl">
          <label className="block text-sm font-semibold mb-2 text-brand-purple"><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>設定許願池目標</label>
          <p className="text-xs text-white/60 mb-3">當達成目標時，期望能獲得多少朵紫花？大家會將橘花投入池中為你集氣！</p>
          <input 
            type="number" 
            min="10" 
            value={wishTarget} 
            onChange={e => setWishTarget(parseInt(e.target.value) || 0)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-purple/50 transition" 
            placeholder="例如：100" 
          />
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 mt-auto">
        <button 
          onClick={handleCreate} 
          disabled={!isValid} 
          className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${!isValid ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-gradient-to-r from-brand-purple to-indigo-500 text-white'}`}
        >
          建立專案
        </button>
      </div>
    </div>
  );
}
