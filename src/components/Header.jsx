import { TrendingUp, Power, LogOut, Flame, Zap, Trophy, Brain, Crown, Sprout, Calendar } from 'lucide-react';

const STREAK_ICONS = { Sprout, Flame, Zap, TrendingUp, Trophy, Brain, Crown };

export default function Header({ 
  session, profile, lang, setLang, streak, tier, 
  onStats, onProfile, onStandup, onSignOut 
}) {
  return (
    <header className="w-full max-w-4xl p-6 flex justify-between items-center z-10">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-dezz-accent rounded-full animate-pulse shadow-[0_0_10px_#00ff9b]"></div>
        <h1 className="font-space font-bold text-2xl tracking-tighter">
          dezz<span className="text-dezz-accent">Lock</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 text-sm font-bold text-dezz-accent/50 cursor-pointer select-none">
        {/* STREAK BADGE */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 pr-2 md:pr-4 border-r border-dezz-accent/20 group" title={tier.label}>
            {(() => {
              const Icon = STREAK_ICONS[tier.icon] || Flame;
              return <Icon size={16} className="text-yellow-400 group-hover:scale-125 transition-transform" />;
            })()}
            <span className="hidden sm:block font-mono text-[10px] text-yellow-400 uppercase tracking-widest font-bold">
              {streak}d
            </span>
          </div>
        )}

        {/* IDENTITY MODULE */}
        <div className="flex items-center gap-2 pr-2 md:pr-4 border-r border-dezz-accent/20">
          <button
            onClick={onProfile}
            className="flex items-center gap-2 hover:text-dezz-accent transition group"
            title="VIEW OR EDIT PROFILE"
          >
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-6 h-6 rounded-full object-cover border border-dezz-accent shadow-[0_0_8px_#00ff9b33] transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-dezz-accent/20 border border-dezz-accent/40 flex items-center justify-center text-[10px] font-bold text-dezz-accent transition-transform group-hover:scale-110">
                {session.user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden sm:block font-mono text-[10px] text-gray-400 uppercase tracking-widest hover:text-white transition">
              {profile?.display_name || session.user.email.split('@')[0]}
            </span>
          </button>
        </div>

        {/* STAND-UP BUTTON */}
        <button onClick={onStandup} className="mr-2 text-xs font-mono text-gray-500 hover:text-white transition uppercase tracking-widest flex items-center gap-1.5" title="GENERATE DAILY STAND-UP">
          <Calendar size={14} className="text-dezz-accent" />
          <span className="hidden sm:inline">STAND-UP</span>
        </button>

        {/* STATS BUTTON */}
        <button onClick={onStats} className="mr-2 text-xs font-mono text-gray-500 hover:text-dezz-accent transition uppercase tracking-widest flex items-center gap-1.5" title="VIEW STATS">
          <TrendingUp size={14} />
          <span className="hidden sm:inline">STATS</span>
        </button>

        {/* LOGOUT BUTTON */}
        <button
          onClick={onSignOut}
          className="hover:text-red-500 text-xs font-mono mr-2 transition-colors uppercase tracking-widest"
          title="LOGOUT"
        >
          <Power size={14} />
        </button>

        {/* LANGUAGE */}
        <div className="flex gap-1 text-[10px] md:text-xs">
          <span onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-dezz-accent' : 'hover:text-white transition'}`}>EN</span>
          <span className="text-dezz-surface">|</span>
          <span onClick={() => setLang('es')} className={`${lang === 'es' ? 'text-dezz-accent' : 'hover:text-white transition'}`}>ES</span>
        </div>
      </div>
    </header>
  );
}
