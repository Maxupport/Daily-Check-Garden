"use client";

export type UserProfile = {
  name: string;
  bio: string;
  yellow: number;
  red: number;
  purple: number;
};

export default function UserProfileModal({ user, onClose }: { user: UserProfile, onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-brand-dark/95 backdrop-blur-md flex flex-col p-6 animate-fade-in pt-20 justify-center items-center">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/20 bg-white/10 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 active:scale-90 transition">
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <div className="text-center mb-6 mt-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-3xl font-bold shadow-lg mb-3">
            {user.name.substring(0, 1)}
          </div>
          <h2 className="text-xl font-bold mb-1">{user.name}</h2>
          <p className="text-sm text-white/70 italic">{user.bio}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/30 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-2xl text-brand-yellow drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] mb-1"><i className="fa-solid fa-seedling"></i></div>
            <div className="font-bold text-lg">{user.yellow}</div>
            <div className="text-[10px] text-white/50">橘花 (今日)</div>
          </div>
          <div className="bg-black/30 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-2xl text-brand-red drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] mb-1"><i className="fa-solid fa-heart"></i></div>
            <div className="font-bold text-lg">{user.red}</div>
            <div className="text-[10px] text-white/50">紅花</div>
          </div>
          <div className="bg-black/30 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-2xl text-brand-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] mb-1"><i className="fa-solid fa-star"></i></div>
            <div className="font-bold text-lg">{user.purple}</div>
            <div className="text-[10px] text-white/50">紫花</div>
          </div>
        </div>
      </div>
    </div>
  );
}
