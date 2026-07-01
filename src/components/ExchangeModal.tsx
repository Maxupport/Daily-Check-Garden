"use client";

import { useState, useEffect } from "react";

export default function ExchangeModal({ 
  onClose, 
  onExchangeSuccess,
  currentRed,
  currentPurple 
}: { 
  onClose: () => void;
  onExchangeSuccess: (yellowEarned: number, type: "RED" | "PURPLE", amount: number) => void;
  currentRed: number;
  currentPurple: number;
}) {
  const [rates, setRates] = useState({ redRate: 2, purpleRate: 5 });
  const [type, setType] = useState<"RED" | "PURPLE">("RED");
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(true);

  useEffect(() => {
    // Fetch real rates from backend
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.redRate && data.purpleRate) {
          setRates(data);
        }
        setFetchingRates(false);
      })
      .catch(() => setFetchingRates(false));
  }, []);

  const currentRate = type === "RED" ? rates.redRate : rates.purpleRate;
  const yellowToGet = amount * currentRate;
  const maxAmount = type === "RED" ? currentRed : currentPurple;

  const handleExchange = async () => {
    if (amount > maxAmount || amount <= 0) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/flowers/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount }),
      });
      
      if (res.ok) {
        const data = await res.json();
        onExchangeSuccess(data.yellowEarned, type, amount);
      } else {
        const err = await res.json();
        alert(`兌換失敗: ${err.error || "未知錯誤"}`);
      }
    } catch (e) {
      alert("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-md flex flex-col p-6 animate-fade-in pt-20 justify-center items-center">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/20 bg-white/10 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 active:scale-90 transition">
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold shadow-lg mb-3">
            <i className="fa-solid fa-building-columns text-white"></i>
          </div>
          <h2 className="text-xl font-bold mb-1">花園央行兌換所</h2>
          <p className="text-sm text-white/70">將獲得的支持轉換為新的種子</p>
        </div>

        {fetchingRates ? (
          <div className="text-center text-white/50 text-sm py-4">讀取匯率中...</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider font-bold">目前匯率</label>
              <div className="flex justify-between text-sm">
                <span>🔴 1 紅花 = <span className="text-brand-yellow font-bold">{rates.redRate} 橘花</span></span>
                <span>🟣 1 紫花 = <span className="text-brand-yellow font-bold">{rates.purpleRate} 橘花</span></span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider font-bold">選擇兌換項目</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setType("RED"); setAmount(1); }}
                  className={`flex-1 py-3 rounded-xl border ${type === "RED" ? "bg-red-500/20 border-red-500 text-white" : "bg-black/20 border-white/5 text-white/50"} transition`}
                >
                  🔴 紅花
                </button>
                <button 
                  onClick={() => { setType("PURPLE"); setAmount(1); }}
                  className={`flex-1 py-3 rounded-xl border ${type === "PURPLE" ? "bg-purple-500/20 border-purple-500 text-white" : "bg-black/20 border-white/5 text-white/50"} transition`}
                >
                  🟣 紫花
                </button>
              </div>
              <div className="text-right text-xs text-white/40 mt-1">
                目前擁有: {maxAmount} 朵
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider font-bold">兌換數量</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="1" 
                  max={Math.max(1, maxAmount)} 
                  value={amount} 
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  disabled={maxAmount === 0}
                  className="flex-1 accent-brand-yellow"
                />
                <span className="font-bold text-xl min-w-[2rem] text-center">{amount}</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 flex justify-between items-center mt-2">
              <span className="text-sm text-white/70">預計獲得</span>
              <div className="text-2xl font-bold text-brand-yellow">
                <i className="fa-solid fa-seedling mr-2 text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"></i>
                {yellowToGet}
              </div>
            </div>

            <button 
              onClick={handleExchange}
              disabled={maxAmount === 0 || loading || amount > maxAmount}
              className="w-full mt-4 bg-gradient-to-r from-brand-yellow to-orange-500 text-black font-bold py-3 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? "處理中..." : maxAmount === 0 ? "餘額不足" : "確認兌換"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
