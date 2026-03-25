import React, { useState, useEffect } from 'react';
import { X, Clipboard, Check, Calendar, Briefcase, Clock } from 'lucide-react';
import { supabase } from '../supabase';

export default function StandupModal({ session, onClose, t }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTodaySessions();
  }, []);

  const loadTodaySessions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`*, tasks ( title )`)
      .eq('user_id', session.user.id)
      .gte('end_time', today.toISOString())
      .order('end_time', { ascending: true });

    if (sessions) {
      // Group by project
      const grouped = sessions.reduce((acc, s) => {
        const title = s.tasks?.title || 'Unknown Project';
        if (!acc[title]) {
          acc[title] = {
            title,
            totalSeconds: 0,
            notes: []
          };
        }
        acc[title].totalSeconds += s.duration_seconds || 0;
        if (s.log_notes) acc[title].notes.push(s.log_notes);
        return acc;
      }, {});

      setData(Object.values(grouped));
    }
    setLoading(false);
  };

  const generateRawText = () => {
    let text = `🚀 DAILY STAND-UP - ${new Date().toLocaleDateString()}\n\n`;
    data.forEach(p => {
      const h = Math.floor(p.totalSeconds / 3600);
      const m = Math.floor((p.totalSeconds % 3600) / 60);
      text += `📦 ${p.title.toUpperCase()} (${h > 0 ? `${h}h ` : ''}${m}m)\n`;
      p.notes.forEach(n => {
        text += `  - ${n}\n`;
      });
      text += `\n`;
    });
    return text.trim();
  };

  const copyToClipboard = () => {
    const text = generateRawText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSecs = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300">
      <div className="w-full max-w-2xl bg-dezz-bg border border-dezz-dim rounded-sm flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-dezz-dim flex justify-between items-center bg-dezz-surface/50">
          <div className="flex items-center gap-3">
            <Calendar className="text-dezz-accent" size={24} />
            <div>
              <h3 className="font-space font-bold text-xl text-white tracking-tight uppercase">DAILY STAND-UP REPORT</h3>
              <p className="text-[10px] text-dezz-accent font-mono uppercase tracking-widest">Automatic sync from sector 01</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-white font-mono">
          {loading ? (
            <div className="h-40 flex items-center justify-center animate-pulse">RECONSTRUCTING DATA...</div>
          ) : data.length > 0 ? (
            <div className="space-y-6">
              {data.map((proj, i) => (
                <div key={i} className="border-l-2 border-dezz-accent/30 pl-4 py-1">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-space font-bold text-lg text-dezz-accent uppercase">{proj.title}</h4>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} /> {formatSecs(proj.totalSeconds)}
                    </span>
                  </div>
                  {proj.notes.length > 0 ? (
                    <ul className="space-y-2">
                      {proj.notes.map((note, j) => (
                        <li key={j} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-dezz-accent">{'>'}</span> {note}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-600 italic">No detailed logs provided.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-600 uppercase tracking-[0.2em] text-sm text-center">
              No sessions recorded today.<br/>
              <span className="text-[10px] mt-2">Initialize focus protocol to generate data.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dezz-dim bg-dezz-surface/30 flex justify-end gap-3">
          <button 
            onClick={copyToClipboard}
            disabled={data.length === 0}
            className={`px-6 py-3 font-space font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition duration-300 ${
              data.length === 0 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-dezz-accent active:scale-95'
            }`}
          >
            {copied ? <Check size={16} /> : <Clipboard size={16} />}
            {copied ? 'COPIED TO CLIPBOARD' : 'COPY RAW STAND-UP'}
          </button>
        </div>
      </div>
    </div>
  );
}
