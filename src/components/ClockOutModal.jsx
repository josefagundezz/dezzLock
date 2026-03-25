import React from 'react';
import { Check } from 'lucide-react';

export default function ClockOutModal({ 
  sessionLog, setSessionLog, markAsDone, setMarkAsDone, 
  onConfirm, onCancel, focusFormatted, breakFormatted, breakCount, t 
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-dezz-surface border border-dezz-accent w-full max-w-md p-6 shadow-[0_0_50px_rgba(0,255,155,0.1)] rounded-sm">
        <h3 className="font-space font-bold text-2xl text-white mb-4 uppercase tracking-tight">
          SESSION <span className="text-dezz-accent">REPORT</span>
        </h3>

        {/* Session Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-dezz-bg p-3 border border-dezz-dim text-center">
            <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">{t.focusTime}</p>
            <p className="text-dezz-accent font-mono text-sm font-bold">{focusFormatted}</p>
          </div>
          <div className="bg-dezz-bg p-3 border border-dezz-dim text-center">
            <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">{t.breakTime}</p>
            <p className="text-yellow-400 font-mono text-sm font-bold">{breakFormatted}</p>
          </div>
          <div className="bg-dezz-bg p-3 border border-dezz-dim text-center">
            <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">{t.breaks}</p>
            <p className="text-white font-mono text-sm font-bold">{breakCount}</p>
          </div>
        </div>

        <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">{t.logLabel}</label>
        <textarea
          value={sessionLog}
          onChange={(e) => setSessionLog(e.target.value)}
          placeholder={t.logPlaceholder}
          className="w-full h-28 bg-dezz-bg text-white p-4 text-sm font-mono border border-dezz-dim focus:border-dezz-accent outline-none mb-5 resize-none"
          autoFocus
        />

        {/* Mark as Done Checkbox */}
        <div 
          className="mb-5 flex items-center gap-3 bg-dezz-bg p-3 border border-dezz-dim hover:border-dezz-accent/50 cursor-pointer transition"
          onClick={() => setMarkAsDone(!markAsDone)}
        >
          <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${markAsDone ? 'bg-dezz-accent border-dezz-accent' : 'border-gray-500'}`}>
            {markAsDone && <Check size={10} className="text-black" />}
          </div>
          <span className="text-xs text-gray-300 font-mono uppercase tracking-wide">
            MARK PROJECT AS <span className={markAsDone ? "text-dezz-accent" : ""}>COMPLETED</span>
          </span>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition border border-transparent hover:border-gray-600">
            {t.cancel}
          </button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-dezz-accent text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition shadow-lg shadow-dezz-accent/20">
            {t.confirmEnd}
          </button>
        </div>
      </div>
    </div>
  );
}
