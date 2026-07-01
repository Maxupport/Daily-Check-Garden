"use client";

import { useMemo } from 'react';
import { useAppContext } from '@/lib/context';

export default function CalendarView() {
  const { quest } = useAppContext();

  const calendarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    const currentMonthName = `${year}年 ${monthNames[month]}`;
    
    const firstDayDate = new Date(year, month, 1);
    const firstDay = firstDayDate.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const loggedDates = new Set((quest.logs || []).map(log => new Date(log.date).toDateString()));
    const todayStr = today.toDateString();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ empty: true, dayNumber: 0, isLogged: false, isToday: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dStr = d.toDateString();
      days.push({
        empty: false,
        dayNumber: i,
        isLogged: loggedDates.has(dStr),
        isToday: dStr === todayStr
      });
    }

    return { currentMonthName, days };
  }, [quest.logs]);

  if (!quest.total_target_days) return null;

  return (
    <div className="glass-panel p-5 rounded-3xl mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm">{calendarData.currentMonthName}</h3>
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <div className="w-2 h-2 rounded-full bg-brand-yellow shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div> 已打卡
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-white/40 mb-2 font-medium">
        <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarData.days.map((day, index) => (
          <div 
            key={index} 
            className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all relative ${
              day.empty ? 'opacity-0' :
              day.isLogged ? 'bg-brand-yellow text-slate-900 font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)] scale-105 z-10' :
              day.isToday ? 'border border-brand-purple text-brand-purple font-bold' :
              'bg-white/5 text-white/30'
            }`}
          >
            {!day.empty && <span>{day.dayNumber}</span>}
            {day.isLogged && <i className="fa-solid fa-seedling absolute bottom-0.5 right-0.5 text-[8px] opacity-60"></i>}
          </div>
        ))}
      </div>
    </div>
  );
}
