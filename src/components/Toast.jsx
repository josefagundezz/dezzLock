import React, { useEffect } from 'react';
import { AlertTriangle, CheckSquare, Flame } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => onClose(), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <div className={`fixed top-6 right-6 z-[60] transition-all duration-500 transform ${
      toast.show 
        ? 'translate-y-0 opacity-100 scale-100' 
        : '-translate-y-10 opacity-0 scale-95 pointer-events-none'
    }`}>
      <div className={`flex items-center gap-3 px-6 py-4 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] border-l-4 font-mono text-xs uppercase tracking-widest font-bold backdrop-blur-sm
        ${toast.type === 'warn' 
          ? 'bg-[#2a0000]/90 border-red-500 text-red-500' 
          : toast.type === 'streak'
            ? 'bg-[#1a1000]/90 border-yellow-500 text-yellow-400'
            : 'bg-dezz-surface/90 border-dezz-accent text-dezz-accent'
        }`}
      >
        {toast.type === 'warn' 
          ? <AlertTriangle size={14} /> 
          : toast.type === 'streak' 
            ? <Flame size={14} />
            : <CheckSquare size={14} />
        }
        {toast.msg}
      </div>
    </div>
  );
}
