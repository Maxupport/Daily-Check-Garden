"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function SetupPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Pre-fill name if available
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致，請重新確認");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("密碼長度必須至少 6 個字元");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "設定失敗，請再試一次");
        setLoading(false);
        return;
      }

      // Update session to reflect completeness and new name
      await update({ isComplete: true, name });
      
      router.push("/");
    } catch (err) {
      setError("發生錯誤，請稍後再試");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 shadow-2xl border border-white/10 text-slate-100">
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            <i className="fa-solid fa-seedling text-brand-yellow drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]"></i>
          </div>
          <h1 className="text-2xl font-bold">歡迎加入花圃</h1>
          <p className="text-white/50 text-sm mt-2">請設定您的專屬暱稱與密碼<br/>讓您的帳號更完整安全</p>
        </div>

        <form onSubmit={handleSetup} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm text-white/50 mb-2 pl-1">您想在花圃使用的暱稱</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="你的暱稱"
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-purple/50 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-2 pl-1">設定未來登入用的密碼</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="設定密碼（至少 6 字元）"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-12 text-sm focus:outline-none focus:border-brand-purple/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="再次確認密碼"
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-12 text-sm focus:outline-none focus:border-brand-purple/50 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
            >
              <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-yellow to-orange-400 text-slate-900 font-bold py-4 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "設定中..." : "完成設定 🚀"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={async () => await signOut({ callbackUrl: "/auth/signin" })}
            className="text-white/40 hover:text-white/80 text-sm transition"
          >
            登出 / 改用其他帳號
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          設定完成後，未來您仍可繼續使用 Google 快速登入
        </p>
      </div>
    </div>
  );
}
