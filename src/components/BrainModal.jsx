import React, { useState } from 'react';
import { X, Trash2, Code, Palette, Music, BookOpen, Briefcase, Folder } from 'lucide-react';
import { CATEGORIES } from '../i18n/translations';

// Map category icon names to Lucide components
const ICON_MAP = { Code, Palette, Music, BookOpen, Briefcase, Folder };

export default function BrainModal({ tasks, onSelect, onDelete, onClose, onCategoryChange, t }) {
  const [filterCat, setFilterCat] = useState('ALL');

  const filtered = filterCat === 'ALL' 
    ? tasks 
    : tasks.filter(task => task.category === filterCat);

  const CatIcon = ({ name, size = 10 }) => {
    const Icon = ICON_MAP[name];
    return Icon ? <Icon size={size} /> : null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-dezz-bg border border-dezz-dim w-full max-w-lg shadow-2xl rounded-sm flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-dezz-dim flex justify-between items-center bg-dezz-surface">
          <h3 className="font-space font-bold text-white text-lg tracking-tight">
            KNOWLEDGE BASE <span className="text-dezz-accent">ARCHIVE</span>
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-3 border-b border-dezz-dim/50 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterCat('ALL')}
            className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border transition whitespace-nowrap ${
              filterCat === 'ALL' 
                ? 'border-dezz-accent text-dezz-accent bg-dezz-accent/10' 
                : 'border-dezz-dim text-gray-500 hover:text-white'
            }`}
          >
            {t.allCategories}
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setFilterCat(key)}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border transition whitespace-nowrap flex items-center gap-1 ${
                filterCat === key 
                  ? `border-current bg-opacity-10` 
                  : 'border-dezz-dim text-gray-500 hover:text-white'
              }`}
              style={filterCat === key ? { color: cat.color, backgroundColor: cat.color + '15' } : {}}
            >
              <CatIcon name={cat.icon} size={10} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Body List */}
        <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
          {filtered.length > 0 ? (
            filtered.map(task => (
              <div key={task.id} className="group flex justify-between items-center p-4 border-b border-dezz-dim/30 hover:bg-dezz-surface/50 transition">
                <div
                  onClick={() => onSelect(task)}
                  className="cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {task.category && CATEGORIES[task.category] && (
                      <span
                        className="text-[9px] font-mono px-2 py-0.5 rounded-sm border flex items-center gap-1"
                        style={{
                          color: CATEGORIES[task.category].color,
                          borderColor: CATEGORIES[task.category].color + '40',
                          backgroundColor: CATEGORIES[task.category].color + '10'
                        }}
                      >
                        <CatIcon name={CATEGORIES[task.category].icon} size={9} />
                        {task.category}
                      </span>
                    )}
                    <h4 className="font-bold font-space text-white group-hover:text-dezz-accent transition">{task.title}</h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {new Date(task.created_at).toLocaleDateString()} // STATUS: {task.status}
                  </p>
                </div>

                {/* Category selector */}
                <select
                  value={task.category || ''}
                  onChange={(e) => onCategoryChange(task.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-dezz-bg text-[9px] text-gray-500 font-mono border border-dezz-dim rounded-sm px-1 py-0.5 mr-2 outline-none focus:border-dezz-accent opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <option value="">---</option>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>

                <button onClick={() => onDelete(task.id)} className="text-red-900 group-hover:text-red-500 transition px-2">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-600 font-mono text-xs">NO DATA IN SECTOR 01</div>
          )}
        </div>
      </div>
    </div>
  );
}
