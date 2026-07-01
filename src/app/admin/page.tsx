"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "next-auth/react";

type Stats = {
  totalUsers: number;
  totalQuests: number;
  activeQuests: number;
  totalLogs: number;
  totalFlowers: number;
  completedWishes: number;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  yellowFlowers: number;
  redFlowers: number;
  purpleFlowers: number;
  isActive: boolean;
  createdAt: string;
  _count: { quests: number; logsAuthored: number };
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "users">("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState({ redRate: 2, purpleRate: 5 });
  const [savingRates, setSavingRates] = useState(false);
  const [sessionUser, setSessionUser] = useState<{name?: string | null, email?: string | null, role?: string} | null>(null);

  useEffect(() => {
    getSession().then(session => {
      if (session?.user) {
        setSessionUser(session.user as any);
        if ((session.user as any).role === "ADMIN") {
          fetchStats();
          fetchUsers();
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (activeTab === "users" && users.length === 0) fetchUsers();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin?type=stats");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin?type=users");
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserAction = async (userId: string, action: "DISABLE" | "ENABLE" | "DELETE") => {
    if (action === "DELETE") {
      if (!confirm("確定要徹底刪除此會員及其所有關聯紀錄嗎？此動作不可逆！")) return;
    } else if (action === "DISABLE") {
      if (!confirm("確定要停用此會員嗎？停用後該會員將無法登入系統。")) return;
    }

    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId })
      });

      if (res.ok) {
        if (action === "DELETE") {
          setUsers(users.filter(u => u.id !== userId));
        } else {
          const updated = await res.json();
          setUsers(users.map(u => u.id === userId ? { ...u, isActive: updated.isActive } : u));
        }
      } else {
        const error = await res.json();
        alert(error.error || "操作失敗");
      }
    } catch (e) {
      console.error(e);
      alert("操作失敗，請稍後再試");
    }
  };

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      setRates(data);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveRates = async () => {
    setSavingRates(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      });
      if (res.ok) {
        alert("匯率更新成功！");
      } else {
        alert("匯率更新失敗");
      }
    } finally {
      setSavingRates(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("dailyQuestApp_v2");
    window.location.href = "/";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Profile Section */}
      <div className="text-center py-6 border-b border-white/10">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-3 flex items-center justify-center text-2xl font-bold shadow-lg">
          {sessionUser?.name ? sessionUser.name.charAt(0).toUpperCase() : 'M'}
        </div>
        <h2 className="font-bold text-xl">{sessionUser?.name || "未知使用者"}</h2>
        <p className="text-sm text-white/50">{sessionUser?.email}</p>
        <p className="text-sm text-white/50 mt-1">
          會員等級：{sessionUser?.role === "ADMIN" ? "管理員 (Admin)" : "一般會員 (User)"}
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
        <button className="w-full text-left p-4 flex justify-between items-center text-sm hover:bg-white/10 transition">
          <span><i className="fa-solid fa-circle-half-stroke w-6 text-center text-white/50"></i> 主題設定</span>
          <i className="fa-solid fa-chevron-right text-white/30"></i>
        </button>
        <button className="w-full text-left p-4 flex justify-between items-center text-sm hover:bg-white/10 transition">
          <span><i className="fa-solid fa-bell w-6 text-center text-white/50"></i> 提醒設定</span>
          <i className="fa-solid fa-chevron-right text-white/30"></i>
        </button>
        <button onClick={handleReset} className="w-full text-left p-4 flex justify-between items-center text-sm hover:bg-white/10 transition text-red-400">
          <span><i className="fa-solid fa-rotate-right w-6 text-center"></i> 重置測試資料</span>
        </button>
      </div>

      {/* Admin Backend Panel (Only for ADMIN) */}
      {sessionUser?.role === "ADMIN" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl overflow-hidden mt-4">
        <div className="p-4 text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-lock"></i> 後台管理系統
        </div>

        {/* Central Bank Settings */}
        <div className="p-4 border-b border-red-500/10 bg-black/20">
          <h3 className="text-sm font-bold text-white mb-3">
            <i className="fa-solid fa-building-columns text-brand-yellow mr-2"></i>花園央行匯率控制台
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">🔴 1 朵紅花可換：</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1" 
                  value={rates.redRate} 
                  onChange={(e) => setRates({...rates, redRate: parseInt(e.target.value) || 1})}
                  className="w-16 bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm"
                />
                <span className="text-sm text-brand-yellow">朵橘花</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">🟣 1 朵紫花可換：</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1" 
                  value={rates.purpleRate} 
                  onChange={(e) => setRates({...rates, purpleRate: parseInt(e.target.value) || 1})}
                  className="w-16 bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm"
                />
                <span className="text-sm text-brand-yellow">朵橘花</span>
              </div>
            </div>
            <button 
              onClick={handleSaveRates}
              disabled={savingRates}
              className="mt-2 w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold text-sm transition"
            >
              {savingRates ? "儲存中..." : "儲存新匯率"}
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-3 text-xs font-bold transition ${activeTab === "dashboard" ? "bg-white/10 text-white" : "text-white/40"}`}
          >
            <i className="fa-solid fa-chart-line mr-1"></i> 數據儀表板
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 text-xs font-bold transition ${activeTab === "users" ? "bg-white/10 text-white" : "text-white/40"}`}
          >
            <i className="fa-solid fa-users mr-1"></i> 會員管理
          </button>
        </div>

        {/* Dashboard Stats */}
        {activeTab === "dashboard" && (
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center text-white/40 text-sm py-4">載入中...</div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "總會員數", value: stats.totalUsers, icon: "fa-users", color: "text-blue-400" },
                  { label: "進行中專案", value: stats.activeQuests, icon: "fa-pen-nib", color: "text-brand-purple" },
                  { label: "總打卡紀錄", value: stats.totalLogs, icon: "fa-calendar-check", color: "text-brand-yellow" },
                  { label: "花朵流通次數", value: stats.totalFlowers, icon: "fa-seedling", color: "text-brand-red" },
                  { label: "達成許願池", value: stats.completedWishes, icon: "fa-wand-magic-sparkles", color: "text-brand-purple" },
                  { label: "總專案數", value: stats.totalQuests, icon: "fa-list-check", color: "text-green-400" },
                ].map(item => (
                  <div key={item.label} className="bg-black/30 rounded-2xl p-4 text-center">
                    <i className={`fa-solid ${item.icon} text-2xl ${item.color} mb-2`}></i>
                    <div className="font-bold text-2xl">{item.value}</div>
                    <div className="text-[10px] text-white/50">{item.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/40 text-sm py-4">
                <p>尚未連接資料庫</p>
                <p className="text-[10px] mt-1">請先設定 .env.local 並完成資料庫遷移</p>
              </div>
            )}
          </div>
        )}

        {/* User List */}
        {activeTab === "users" && (
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto scrollbar-hide">
            {users.length === 0 ? (
              <div className="text-center text-white/40 text-sm py-8">
                <p>尚未連接資料庫</p>
                <p className="text-[10px] mt-1">請設定環境變數後重啟</p>
              </div>
            ) : (
              users.map(user => (
                <div key={user.id} className={`p-4 flex flex-col gap-3 transition ${!user.isActive ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-sm font-bold shrink-0 relative">
                      {(user.name || user.email || "?").substring(0, 1).toUpperCase()}
                      {!user.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0f172a] flex items-center justify-center text-[8px]">
                          <i className="fa-solid fa-ban text-white"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center gap-2">
                        {user.name || "匿名"}
                        {!user.isActive && <span className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded-md">已停用</span>}
                      </div>
                      <div className="text-[10px] text-white/50 truncate">{user.email}</div>
                      <div className="flex gap-2 mt-1 text-[10px]">
                        <span className="text-brand-yellow">🟠 {user.yellowFlowers}</span>
                        <span className="text-brand-red">🔴 {user.redFlowers}</span>
                        <span className="text-brand-purple">🟣 {user.purpleFlowers}</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-white/40">
                      <div>{user._count.quests} 專案</div>
                      <div>{user._count.logsAuthored} 打卡</div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    {user.isActive ? (
                      <button 
                        onClick={() => handleUserAction(user.id, "DISABLE")}
                        className="px-3 py-1 bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/40 text-[10px] rounded-lg transition"
                      >
                        停用
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUserAction(user.id, "ENABLE")}
                        className="px-3 py-1 bg-white/5 hover:bg-green-500/20 hover:text-green-400 text-white/40 text-[10px] rounded-lg transition"
                      >
                        啟用
                      </button>
                    )}
                    <button 
                      onClick={() => handleUserAction(user.id, "DELETE")}
                      className="px-3 py-1 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 text-[10px] rounded-lg transition"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      )}

      {/* Logout */}
      <button 
        onClick={async () => { 
          localStorage.removeItem("dailyQuestApp_v2"); 
          await signOut({ callbackUrl: "/auth/signin" });
        }} 
        className="w-full mt-6 py-4 bg-white/5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition font-bold"
      >
        登出帳號
      </button>

    </div>
  );
}
