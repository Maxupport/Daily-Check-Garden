"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserData = {
  total_red_flowers: number;
  total_purple_flowers: number;
  yellow_flowers: number;
  has_claimed_daily: boolean;
  last_login_date: string;
};

type LogEntry = {
  date: string;
  text: string;
};

type QuestData = {
  title: string;
  durationType: 'DAYS' | 'WEEKS' | 'MONTHS';
  durationValue: number | null;
  total_target_days: number;
  current_streak: number;
  wish_target: number | null;
  wish_current: number;
  logs: LogEntry[];
};

type AppContextType = {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  quest: QuestData;
  setQuest: React.Dispatch<React.SetStateAction<QuestData>>;
  communityList: any[];
  setCommunityList: React.Dispatch<React.SetStateAction<any[]>>;
  wishList: any[];
  setWishList: React.Dispatch<React.SetStateAction<any[]>>;
  toast: { show: boolean; message: string };
  showToast: (msg: string) => void;
  checkDailyReset: () => void;
  claimDailyFlowers: () => void;
  hasCheckedInToday: () => boolean;
  performCheckIn: (logText: string) => void;
};

const defaultUser: UserData = {
  total_red_flowers: 0,
  total_purple_flowers: 0,
  yellow_flowers: 0,
  has_claimed_daily: false,
  last_login_date: new Date().toDateString()
};

const defaultQuest: QuestData = {
  title: '',
  durationType: 'DAYS',
  durationValue: null,
  total_target_days: 0,
  current_streak: 0,
  wish_target: null,
  wish_current: 0,
  logs: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(defaultUser);
  const [quest, setQuest] = useState<QuestData>(defaultQuest);
  
  const [communityList, setCommunityList] = useState([]);

  const [wishList, setWishList] = useState([]);

  const [toast, setToast] = useState({ show: false, message: '' });
  const [initialized, setInitialized] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('dailyQuestApp_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.user) setUser(parsed.user);
      if (parsed.quest) setQuest(parsed.quest);
      if (parsed.communityList) setCommunityList(parsed.communityList);
      if (parsed.wishList) setWishList(parsed.wishList);
    }
    setInitialized(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('dailyQuestApp_v2', JSON.stringify({ user, quest, communityList, wishList }));
    }
  }, [user, quest, communityList, wishList, initialized]);

  useEffect(() => {
    if (initialized) {
      checkDailyReset();
    }
  }, [initialized]);

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const checkDailyReset = () => {
    const today = new Date().toDateString();
    if (user.last_login_date !== today) {
      setUser(prev => ({
        ...prev,
        yellow_flowers: 0,
        has_claimed_daily: false,
        last_login_date: today
      }));
    }
  };

  const claimDailyFlowers = () => {
    setUser(prev => ({
      ...prev,
      yellow_flowers: 3,
      has_claimed_daily: true
    }));
  };

  const hasCheckedInToday = () => {
    if (!quest.logs || quest.logs.length === 0) return false;
    const today = new Date().toDateString();
    const lastLog = new Date(quest.logs[0].date).toDateString();
    return lastLog === today;
  };

  const performCheckIn = (logText: string) => {
    if (hasCheckedInToday()) {
      showToast('今日已打卡過囉！');
      return;
    }
    const newStreak = quest.current_streak + 1;
    const updatedUser = { ...user, yellow_flowers: user.yellow_flowers + 1 };
    
    if (newStreak >= quest.total_target_days && quest.wish_target) {
        updatedUser.total_purple_flowers += quest.wish_target;
        showToast('恭喜達成目標！許願池解鎖，獲得紫花！');
    } else {
        showToast('打卡成功！獲得 1 朵可用於送人的橘花！');
    }

    setQuest(prev => ({
      ...prev,
      current_streak: newStreak,
      logs: [{ date: new Date().toISOString(), text: logText }, ...prev.logs]
    }));
    setUser(updatedUser);
  };

  return (
    <AppContext.Provider value={{
      user, setUser, quest, setQuest,
      communityList, setCommunityList, wishList, setWishList,
      toast, showToast, checkDailyReset, claimDailyFlowers,
      hasCheckedInToday, performCheckIn
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
