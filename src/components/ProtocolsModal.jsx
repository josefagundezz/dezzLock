import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Crosshair } from 'lucide-react';
import { CATEGORIES } from '../i18n/translations';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function ProtocolsModal({ protocols, onAdd, onDelete, onClose, t }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProtocol, setNewProtocol] = useState({
    name: '',
    project_title: '',
    category: '',
    duration_minutes: 60,
    start_time: '09:00',
    days: []
  });

  const handleDayToggle = (dayIndex) => {
    setNewProtocol(prev => ({
      ...prev,
      days: prev.days.includes(dayIndex) 
        ? prev.days.filter(d => d !== dayIndex)
        : [...prev.days, dayIndex].sort()
    }));
  };

  const handleSave = () => {
    if (!newProtocol.name || !newProtocol.project_title || newProtocol.days.length === 0) return;
    onAdd(newProtocol);
    setIsAdding(false);
    setNewProtocol({
      name: '',
      project_title: '',
      category: '',
      duration_minutes: 60,
      start_time: '09:00',
      days: []
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-dezz-bg border border-dezz-dim w-full max-w-lg shadow-2xl rounded-sm flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-dezz-dim flex justify-between items-center bg-dezz-surface">
          <h3 className="font-space font-bold text-white text-lg tracking-tight flex items-center gap-2">
            <Calendar size={18} className="text-dezz-accent" /> FOCUS <span className="text-dezz-accent">PROTOCOLS</span>
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Add Protocol Form */}
          {isAdding ? (
            <div className="bg-dezz-surface border border-dezz-accent/50 p-4 mb-4 rounded-sm animate-in slide-in-from-top-2">
              <h4 className="text-[10px] text-dezz-accent font-mono tracking-widest uppercase mb-4">NEW PROTOCOL</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] text-gray-500 font-mono tracking-widest uppercase mb-1">Protocol Name</label>
                  <input
                    type="text"
                    value={newProtocol.name}
                    onChange={(e) => setNewProtocol({...newProtocol, name: e.target.value})}
                    placeholder="e.g. Deep Morning Code"
                    className="w-full bg-dezz-bg text-white p-2 text-sm font-mono border border-dezz-dim focus:border-dezz-accent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-500 font-mono tracking-widest uppercase mb-1">Project</label>
                    <input
                      type="text"
                      value={newProtocol.project_title}
                      onChange={(e) => setNewProtocol({...newProtocol, project_title: e.target.value})}
                      placeholder="e.g. dezzHub"
                      className="w-full bg-dezz-bg text-white p-2 text-sm font-mono border border-dezz-dim focus:border-dezz-accent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 font-mono tracking-widest uppercase mb-1">Category</label>
                    <select
                      value={newProtocol.category}
                      onChange={(e) => setNewProtocol({...newProtocol, category: e.target.value})}
                      className="w-full bg-dezz-bg text-white p-2 text-sm font-mono border border-dezz-dim focus:border-dezz-accent outline-none"
                    >
                      <option value="">None</option>
                      {Object.keys(CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>{CATEGORIES[cat].label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-500 font-mono tracking-widest uppercase mb-1">Start Time (Local)</label>
                    <input
                      type="time"
                      value={newProtocol.start_time}
                      onChange={(e) => setNewProtocol({...newProtocol, start_time: e.target.value})}
                      className="w-full bg-dezz-bg text-white p-2 text-sm font-mono border border-dezz-dim focus:border-dezz-accent outline-none custom-time-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 font-mono tracking-widest uppercase mb-1">Duration</label>
                    <select
                      value={newProtocol.duration_minutes}
                      onChange={(e) => setNewProtocol({...newProtocol, duration_minutes: Number(e.target.value)})}
                      className="w-full bg-dezz-bg text-white p-2 text-sm font-mono border border-dezz-dim focus:border-dezz-accent outline-none"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={60}>1 Hour</option>
                      <option value={120}>2 Hours</option>
                      <option value={240}>4 Hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-gray-500 font-mono tracking-widest uppercase mb-1">Active Days</label>
                  <div className="flex gap-1">
                    {DAYS.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDayToggle(idx)}
                        className={`flex-1 py-1.5 text-xs font-mono border transition ${
                          newProtocol.days.includes(idx) ? 'bg-dezz-accent/20 border-dezz-accent text-dezz-accent' : 'border-dezz-dim text-gray-500 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-xs font-mono uppercase tracking-widest border border-dezz-dim text-gray-400 hover:text-white transition">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-2 text-xs font-mono uppercase tracking-widest bg-dezz-accent text-black hover:bg-white transition flex justify-center items-center gap-2">
                    <Plus size={14} /> CREATE
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full mb-4 py-3 border border-dezz-accent/40 bg-dezz-accent/5 hover:bg-dezz-accent/10 border-dashed text-dezz-accent font-mono text-xs tracking-widest uppercase transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> ADD NEW PROTOCOL
            </button>
          )}

          {/* List of Protocols */}
          <div className="space-y-3">
            {protocols.map(p => (
              <div key={p.id} className="group bg-dezz-surface border border-dezz-dim p-4 relative overflow-hidden flex flex-col gap-2">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-dezz-accent/50 group-hover:bg-dezz-accent transition"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-space font-bold tracking-widest text-white uppercase text-sm mb-1">{p.name}</h4>
                    <p className="font-mono text-[10px] text-gray-500 flex items-center gap-2">
                      <Crosshair size={10} className="text-dezz-accent" /> {p.project_title} 
                      {p.category && <span className="text-gray-700">|</span>}
                      {p.category && <span style={{color: CATEGORIES[p.category]?.color || '#aaa'}}>{p.category}</span>}
                    </p>
                  </div>
                  <button onClick={() => onDelete(p.id)} className="text-gray-600 hover:text-red-500 transition px-2">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-dezz-dim/50">
                  <div className="flex gap-1 text-[10px] font-mono font-bold">
                    {DAYS.map((d, i) => (
                      <span key={i} className={p.days.includes(i) ? 'text-white' : 'text-gray-700'}>{d}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-dezz-accent">
                    <Clock size={10} /> {p.start_time} — {p.duration_minutes}m
                  </div>
                </div>
              </div>
            ))}
            {!isAdding && protocols.length === 0 && (
              <div className="py-10 text-center text-[10px] font-mono uppercase tracking-widest text-gray-600">
                NO ACTIVE PROTOCOLS
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
