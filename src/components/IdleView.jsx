import React, { useState } from 'react';
import { Plus, X, Lock, Database, CheckCircle, Code, Palette, Music, BookOpen, Briefcase, Folder } from 'lucide-react';
import { CATEGORIES, GOAL_PRESETS } from '../i18n/translations';

const ICON_MAP = { Code, Palette, Music, BookOpen, Briefcase, Folder };

export default function IdleView({ 
  project, setProject, instructions, setInstructions, 
  tasks, currentTaskId, onLockIn, onOpenBrain, onOpenProtocols,
  profile, selectedGoal, setSelectedGoal,
  selectedCategory, setSelectedCategory, t 
}) {
  const [currentInstruction, setCurrentInstruction] = useState('');

  const addInstruction = () => {
    if (!currentInstruction.trim()) return;
    setInstructions([...instructions, currentInstruction]);
    setCurrentInstruction('');
  };

  const deleteInstruction = (index) => {
    const newIns = [...instructions];
    newIns.splice(index, 1);
    setInstructions(newIns);
  };

  const CatIcon = ({ name, size = 12 }) => {
    const Icon = ICON_MAP[name];
    return Icon ? <Icon size={size} /> : null;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="text-center mb-4">
        <h2 className="font-space text-4xl font-bold text-white mb-2 uppercase">{t.startBtn}</h2>
        <p className="text-gray-500 text-sm tracking-widest uppercase border-b border-dezz-accent/20 pb-4 inline-block px-10">
          {t.subtitle}
        </p>
      </div>

      {/* SMART PROJECT INPUT */}
      <div className="bg-dezz-surface border border-dezz-surface p-6 rounded-sm shadow-xl focus-within:border-dezz-accent/50 transition duration-300 relative group">
        <label className="block text-dezz-accent text-xs font-bold mb-3 tracking-widest flex justify-between items-center">
          <span>{t.projLabel}</span>
          <div className="flex gap-4">
            <button
              onClick={onOpenProtocols}
              className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1.5 transition"
              title="MANAGE PROTOCOLS"
            >
              <Database size={12} /> PROTOCOLS
            </button>
            <button
              onClick={onOpenBrain}
              className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1.5 transition"
              title="OPEN TASK ARCHIVE"
            >
              <Folder size={12} /> ARCHIVE
            </button>
          </div>
        </label>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder={t.placeholderProj}
            className="w-full bg-transparent text-xl text-white outline-none placeholder-gray-700 font-space font-bold"
            list="brain-suggestions"
          />
          {tasks.some(t => t.title === project) && (
            <CheckCircle size={18} className="text-dezz-accent" />
          )}
        </div>

        <datalist id="brain-suggestions">
          {tasks.map(t => <option key={t.id} value={t.title} />)}
        </datalist>
      </div>

      {/* CATEGORY & GOAL ROW */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category Selector */}
        <div className="bg-dezz-surface border border-dezz-surface p-4 rounded-sm shadow-xl">
          <label className="block text-dezz-accent text-[10px] font-bold mb-2 tracking-widest uppercase">{t.category}</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border transition flex items-center gap-1 ${
                  selectedCategory === key
                    ? 'border-current bg-opacity-20'
                    : 'border-dezz-dim text-gray-600 hover:text-white'
                }`}
                style={selectedCategory === key ? { color: cat.color, backgroundColor: cat.color + '15', borderColor: cat.color + '60' } : {}}
              >
                <CatIcon name={cat.icon} size={10} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goal Selector */}
        <div className="bg-dezz-surface border border-dezz-surface p-4 rounded-sm shadow-xl">
          <label className="block text-dezz-accent text-[10px] font-bold mb-2 tracking-widest uppercase">{t.goalLabel}</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedGoal(0)}
              className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border transition ${
                selectedGoal === 0 ? 'border-dezz-accent text-dezz-accent bg-dezz-accent/10' : 'border-dezz-dim text-gray-600 hover:text-white'
              }`}
            >
              {t.noGoal}
            </button>
            {GOAL_PRESETS.map(min => (
              <button
                key={min}
                onClick={() => setSelectedGoal(min)}
                className={`px-2.5 py-1 text-[10px] font-mono tracking-wider rounded-sm border transition ${
                  selectedGoal === min ? 'border-dezz-accent text-dezz-accent bg-dezz-accent/10' : 'border-dezz-dim text-gray-600 hover:text-white'
                }`}
              >
                {profile?.time_unit === 'hours' ? `${(min / 60).toFixed(1)}h` : `${min}m`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions Input */}
      <div className="bg-dezz-surface border border-dezz-surface p-6 rounded-sm shadow-xl">
        <label className="block text-dezz-accent text-xs font-bold mb-3 tracking-widest uppercase flex justify-between">
          <span>{t.descLabel}</span>
          <span className="text-xs text-gray-600">{instructions.length} IN STACK</span>
        </label>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={currentInstruction}
            onChange={(e) => setCurrentInstruction(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addInstruction(); }}
            placeholder={t.placeholderInst}
            className="w-full bg-dezz-bg/50 text-white p-3 rounded-sm border border-transparent focus:border-dezz-accent/30 outline-none text-sm transition"
          />
          <button
            onClick={addInstruction}
            className="bg-dezz-accent text-dezz-bg font-bold px-4 rounded-sm hover:bg-white hover:scale-105 transition duration-200 flex items-center"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {instructions.map((inst, idx) => (
            <div key={idx} className="group flex justify-between items-center bg-dezz-bg p-3 border-l-2 border-dezz-accent/20 hover:border-dezz-accent transition-all">
              <span className="text-sm text-gray-300 font-medium font-mono">
                <span className="text-dezz-accent mr-2">{'>'}</span> {inst}
              </span>
              <button onClick={() => deleteInstruction(idx)} className="text-red-500 opacity-0 group-hover:opacity-100 hover:text-white transition">
                <X size={14} />
              </button>
            </div>
          ))}
          {instructions.length === 0 && (
            <div className="text-gray-700 text-xs italic text-center py-2 opacity-50">Empty Buffer</div>
          )}
        </div>
      </div>

      {/* BIG TRIGGER BUTTON */}
      <button
        onClick={onLockIn}
        className="mt-2 bg-white text-black font-space font-black text-xl py-5 hover:bg-dezz-accent hover:shadow-[0_0_20px_#00ff9b66] transition-all transform active:scale-95 tracking-widest uppercase flex items-center justify-center gap-3"
      >
        <Lock size={20} /> {t.startBtn}
      </button>
    </div>
  );
}
