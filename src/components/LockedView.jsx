import React, { useState, useEffect } from 'react';
import { Pause, Play, Power, CheckCircle, Target, Code, Palette, Music, BookOpen, Briefcase, Folder, Activity } from 'lucide-react';
import { CATEGORIES } from '../i18n/translations';

const ICON_MAP = { Code, Palette, Music, BookOpen, Briefcase, Folder };

export default function LockedView({
  project, instructions, timer, profile, selectedGoal, selectedCategory, 
  onClockOut, onPause, onResume, goalReached, t
}) {
  const [showGoalNotif, setShowGoalNotif] = useState(false);
  
  const goalProgress = selectedGoal > 0 
    ? Math.min(1, timer.focusSeconds / (selectedGoal * 60)) 
    : 0;

  useEffect(() => {
    if (goalReached) {
      setShowGoalNotif(true);
      const timeout = setTimeout(() => setShowGoalNotif(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [goalReached]);

  const catColor = selectedCategory && CATEGORIES[selectedCategory]
    ? CATEGORIES[selectedCategory].color
    : '#00ff9b';

  const CatIcon = ({ name, size = 12 }) => {
    const Icon = ICON_MAP[name];
    return Icon ? <Icon size={size} /> : null;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-700">
      {/* Goal Reached Celebration */}
      {showGoalNotif && (
        <div className="absolute top-20 z-20 bg-dezz-accent/10 border border-dezz-accent px-6 py-3 rounded-sm animate-bounce flex items-center gap-2">
          <Target size={16} className="text-dezz-accent" />
          <span className="text-dezz-accent font-space font-bold text-sm tracking-widest">
            {t.goalReached} — KEEP GOING!
          </span>
        </div>
      )}

      {/* Pulse Check Alert */}
      {timer.isPulseChecking && (
        <div className="absolute inset-x-0 top-1/4 z-30 flex justify-center animate-in zoom-in duration-300">
          <div className="bg-red-900/90 border-2 border-red-500 shadow-[0_0_30px_#ef4444] px-8 py-6 rounded-sm flex flex-col items-center gap-4 text-center transform scale-110">
            <div className="flex items-center gap-3">
              <Activity size={24} className="text-white animate-pulse" />
              <h3 className="font-space font-black text-2xl text-white tracking-widest uppercase">
                STILL FOCUSED?
              </h3>
            </div>
            <p className="text-red-200 font-mono text-[10px] tracking-widest uppercase">
              Acknowledge to continue session
            </p>
            <button
              onClick={timer.acknowledgePulse}
              className="mt-2 bg-white text-red-900 font-space font-bold w-full py-3 hover:bg-red-100 transition shadow-lg tracking-widest uppercase"
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      {/* Project Indicator */}
      <div className="mb-8 text-center">
        {selectedCategory && CATEGORIES[selectedCategory] && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-mono px-3 py-1 rounded-sm border mb-3"
            style={{
              color: catColor,
              borderColor: catColor + '40',
              backgroundColor: catColor + '10'
            }}
          >
            <CatIcon name={CATEGORIES[selectedCategory].icon} size={10} />
            {CATEGORIES[selectedCategory].label}
          </span>
        )}
        <h3 className="text-dezz-accent text-xs tracking-[0.3em] font-bold uppercase mb-2">{t.workingOn}</h3>
        <h2 className="text-white text-5xl font-space font-bold uppercase tracking-tight relative inline-block">
          {project}
          <div className="absolute -right-6 -top-2">
            <div className={`w-3 h-3 rounded-full animate-ping ${timer.isPaused ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          </div>
        </h2>
      </div>

      {/* THE CLOCK */}
      <div className="mb-4">
        <div className={`font-mono text-7xl md:text-9xl font-thin tabular-nums tracking-tighter select-none transition-colors duration-500 ${
          timer.isPaused ? 'text-yellow-400/60' : 'text-white opacity-90'
        }`}>
          {timer.focusFormatted}
        </div>
      </div>

      {/* Goal Progress Bar */}
      {selectedGoal > 0 && (
        <div className="w-full max-w-sm mb-10 px-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase">{t.goalLabel}</span>
              <span className="text-[10px] font-mono text-dezz-accent">
                {Math.round(goalProgress * 100)}% / {profile?.time_unit === 'hours' ? `${(selectedGoal / 60).toFixed(1)}h` : `${selectedGoal}m`}
              </span>
            </div>
           <div className="w-full h-1 bg-dezz-dim rounded-full overflow-hidden">
             <div 
               className="h-full bg-dezz-accent transition-all duration-1000"
               style={{ 
                 width: `${Math.min(100, goalProgress * 100)}%`,
                 backgroundColor: goalProgress >= 1 ? '#00ff9b' : catColor,
                 boxShadow: goalProgress >= 1 ? '0 0 10px #00ff9b' : 'none'
               }}
             />
           </div>
        </div>
      )}

      {/* Paused State Indicator */}
      {timer.isPaused && (
        <div className="mb-8 text-center animate-pulse">
          <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-6 py-3 rounded-sm">
            <Pause size={16} className="text-yellow-400" />
            <span className="text-yellow-400 font-space font-bold text-sm tracking-widest uppercase">
              {t.onBreak}
            </span>
            <span className="text-yellow-400/60 font-mono text-xs">
              {timer.breakFormatted}
            </span>
          </div>
        </div>
      )}

      {/* Goal & Stats Mini Display */}
      {timer.breakCount > 0 && (
        <div className="flex items-center gap-6 mb-8">
          <div className="text-center">
            <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">{t.breaks}</p>
            <p className="text-sm font-mono text-yellow-400">{timer.breakCount} ({timer.breakFormatted})</p>
          </div>
        </div>
      )}

      {/* Active Instructions List */}
      <div className="w-full max-w-lg mb-8">
        {instructions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {instructions.map((inst, idx) => (
              <div key={idx} className="bg-dezz-surface/50 border border-dezz-dim p-4 flex items-start gap-3 rounded-sm">
                <CheckCircle size={16} className="text-dezz-accent mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 font-mono text-sm line-clamp-2 leading-relaxed">
                  {inst}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600 text-center uppercase tracking-widest text-xs">Pure Focus - No extra instructions</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 mt-8">
        {/* PAUSE / RESUME */}
        <button
          onClick={timer.isPaused ? onResume : onPause}
          className={`group flex flex-col items-center transition duration-300 cursor-pointer ${
            timer.isPaused 
              ? 'text-dezz-accent hover:text-white' 
              : 'text-gray-600 hover:text-yellow-400'
          }`}
        >
          {timer.isPaused ? <Play size={24} className="mb-2" /> : <Pause size={24} className="mb-2" />}
          <span className="text-[10px] tracking-widest uppercase font-mono">
            {timer.isPaused ? t.resumeBtn : t.pauseBtn}
          </span>
        </button>

        {/* DIVIDER */}
        <div className="w-px h-12 bg-dezz-dim"></div>

        {/* CLOCK OUT */}
        <button
          onClick={onClockOut}
          className="group flex flex-col items-center text-gray-500 hover:text-white transition duration-500 cursor-pointer"
        >
          <Power size={24} className="mb-2 group-hover:text-red-500 transition duration-300" />
          <span className="text-[10px] tracking-widest uppercase font-mono group-hover:tracking-[0.2em] transition-all">
            CLICK TO {t.finishBtn}
          </span>
        </button>
      </div>
    </div>
  );
}
