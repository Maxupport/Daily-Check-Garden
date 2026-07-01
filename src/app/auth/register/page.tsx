"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致，請重新確認");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "註冊失敗，請再試一次");
      setLoading(false);
      return;
    }

    // Auto-login after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("帳號建立成功！請前往登入頁面。");
      router.push("/auth/signin");
    } else {
      router.push("/");
    }
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 shadow-2xl border border-white/10 text-slate-100">
        
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            <i className="fa-solid fa-seedling text-brand-yellow drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]"></i>
          </div>
          <h1 className="text-2xl font-bold">加入日更の花圃</h1>
          <p className="text-white/50 text-sm mt-1">開始你的第一個日更專案</p>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-3 mb-6 rounded-2xl border border-white/20 flex items-center justify-center gap-3 font-semibold hover:bg-white/10 transition active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 快速註冊
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/40 text-xs">或填寫資料註冊</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}
          
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="你的暱稱"
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-purple/50 transition"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-purple/50 transition"
          />
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
            className="w-full bg-gradient-to-r from-brand-yellow to-orange-400 text-slate-900 font-bold py-4 rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "建立帳號中..." : "立即加入 🌱"}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          已有帳號？{" "}
          <Link href="/auth/signin" className="text-brand-purple hover:underline font-semibold">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
