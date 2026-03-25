import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { X, Download } from 'lucide-react';
import { CATEGORIES } from '../i18n/translations';

export default function StatsModal({ session, profile, onClose, t }) {
  const [history, setHistory] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    avgSession: 0,
    totalSessions: 0,
    topProjects: [],
    dailyData: [],
  });
  const [filterCat, setFilterCat] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const formatDuration = (mins) => {
    if (profile?.time_unit === 'hours') return (mins / 60).toFixed(1);
    return mins;
  };

  const getUnit = () => profile?.time_unit === 'hours' ? 'h' : 'm';

  const loadData = async () => {
    const { data } = await supabase
      .from('sessions')
      .select(`*, tasks ( title, category )`)
      .eq('user_id', session.user.id)
      .order('end_time', { ascending: false })
      .limit(100);

    if (!data) return;
    setHistory(data);

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now); monthStart.setDate(monthStart.getDate() - 30);

    let todaySec = 0, weekSec = 0, monthSec = 0, totalSec = 0;
    const projectMap = {};
    const dailyMap = {};

    data.forEach(s => {
      const dur = s.duration_seconds || 0;
      const endDate = new Date(s.end_time);
      totalSec += dur;

      if (endDate >= todayStart) todaySec += dur;
      if (endDate >= weekStart) weekSec += dur;
      if (endDate >= monthStart) monthSec += dur;

      const projName = s.tasks?.title || 'Unknown';
      if (!projectMap[projName]) projectMap[projName] = { name: projName, seconds: 0, category: s.tasks?.category };
      projectMap[projName].seconds += dur;

      if (endDate >= weekStart) {
        const dayKey = endDate.toLocaleDateString('en', { weekday: 'short' });
        if (!dailyMap[dayKey]) dailyMap[dayKey] = 0;
        dailyMap[dayKey] += dur;
      }
    });

    const topProjects = Object.values(projectMap)
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 5);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      dailyData.push({ day: dayName, minutes: Math.round((dailyMap[dayName] || 0) / 60) });
    }

    setSummaryStats({
      todayMinutes: Math.round(todaySec / 60),
      weekMinutes: Math.round(weekSec / 60),
      monthMinutes: Math.round(monthSec / 60),
      avgSession: data.length > 0 ? Math.round(totalSec / data.length / 60) : 0,
      totalSessions: data.length,
      topProjects,
      dailyData,
    });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Project', 'Category', 'Duration (min)', 'Focus Time', 'Notes'];
    
    // Create rows with proper quoting for CSV safety
    const rows = history.map(s => [
      `"${new Date(s.end_time).toLocaleDateString()}"`,
      `"${(s.tasks?.title || 'Unknown').replace(/"/g, '""')}"`,
      `"${(s.tasks?.category || '-').replace(/"/g, '""')}"`,
      `"${Math.round((s.duration_seconds || 0) / 60)}"`,
      `"${s.focus_seconds ? Math.round(s.focus_seconds / 60) : Math.round((s.duration_seconds || 0) / 60)}"`,
      `"${(s.log_notes || '').replace(/"/g, '""')}"`,
    ]);

    // Join with commas and newlines
    const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Prefix with BOM for UTF-8 Excel compatibility
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const fileName = `dezzLock_Sessions_${new Date().toISOString().slice(0, 10)}.csv`;
    
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Give the browser time to initiate the download before cleaning up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  };

  const maxDaily = Math.max(...summaryStats.dailyData.map(d => d.minutes), 1);

  const filteredHistory = filterCat === 'ALL' 
    ? history 
    : history.filter(s => s.tasks?.category === filterCat);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-3xl h-[85vh] bg-dezz-bg border border-dezz-dim rounded-sm flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-dezz-dim flex justify-between items-center bg-dezz-surface/50 flex-shrink-0">
          <div>
            <h3 className="font-space font-bold text-xl text-white tracking-tight uppercase">{t.statsTitle}</h3>
            <p className="text-[10px] text-dezz-accent font-mono uppercase tracking-widest">{summaryStats.totalSessions} {t.sessions}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV} className="text-[10px] font-mono text-gray-500 hover:text-dezz-accent transition uppercase tracking-widest border border-dezz-dim px-3 py-1.5 hover:border-dezz-accent flex items-center gap-1.5">
              <Download size={12} />
              {t.exportCsv}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-dezz-surface border border-dezz-dim p-4 text-center">
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">{t.today}</p>
              <p className="text-2xl font-space font-bold text-dezz-accent">{formatDuration(summaryStats.todayMinutes)}<span className="text-xs text-gray-500 ml-1">{getUnit()}</span></p>
            </div>
            <div className="bg-dezz-surface border border-dezz-dim p-4 text-center">
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">{t.thisWeek}</p>
              <p className="text-2xl font-space font-bold text-white">{formatDuration(summaryStats.weekMinutes)}<span className="text-xs text-gray-500 ml-1">{getUnit()}</span></p>
            </div>
            <div className="bg-dezz-surface border border-dezz-dim p-4 text-center">
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">{t.thisMonth}</p>
              <p className="text-2xl font-space font-bold text-white">{formatDuration(summaryStats.monthMinutes)}<span className="text-xs text-gray-500 ml-1">{getUnit()}</span></p>
            </div>
            <div className="bg-dezz-surface border border-dezz-dim p-4 text-center">
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">{t.avgSession}</p>
              <p className="text-2xl font-space font-bold text-white">{formatDuration(summaryStats.avgSession)}<span className="text-xs text-gray-500 ml-1">{getUnit()}</span></p>
            </div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="bg-dezz-surface border border-dezz-dim p-4 mb-6">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-4">{t.thisWeek} — DAILY BREAKDOWN</p>
            <div className="flex items-end gap-2 h-24">
              {summaryStats.dailyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-dezz-accent">{d.minutes > 0 ? `${formatDuration(d.minutes)}${getUnit()}` : ''}</span>
                  <div
                    className="w-full rounded-t-sm transition-all duration-500"
                    style={{
                      height: `${Math.max(2, (d.minutes / maxDaily) * 80)}px`,
                      backgroundColor: d.minutes > 0 ? '#00ff9b' : '#333333',
                      opacity: d.minutes > 0 ? 0.8 : 0.3,
                    }}
                  />
                  <span className="text-[9px] font-mono text-gray-600">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Projects */}
          {summaryStats.topProjects.length > 0 && (
            <div className="bg-dezz-surface border border-dezz-dim p-4 mb-6">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-3">{t.topProjects}</p>
              {summaryStats.topProjects.map((proj, i) => {
                const maxSec = summaryStats.topProjects[0].seconds;
                const catColor = proj.category && CATEGORIES[proj.category] ? CATEGORIES[proj.category].color : '#00ff9b';
                return (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-space font-bold text-white">{proj.name}</span>
                      <span className="text-[10px] font-mono text-gray-500">{formatDuration(Math.round(proj.seconds / 60))}{getUnit()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-dezz-bg rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(proj.seconds / maxSec) * 100}%`, backgroundColor: catColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Category Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterCat('ALL')}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border transition whitespace-nowrap ${
                filterCat === 'ALL' ? 'border-dezz-accent text-dezz-accent' : 'border-dezz-dim text-gray-500 hover:text-white'
              }`}
            >
              ALL
            </button>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setFilterCat(key)}
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border transition whitespace-nowrap ${
                  filterCat === key ? 'border-current' : 'border-dezz-dim text-gray-500 hover:text-white'
                }`}
                style={filterCat === key ? { color: cat.color } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Session Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredHistory.map(sess => {
              const catColor = sess.tasks?.category && CATEGORIES[sess.tasks.category] 
                ? CATEGORIES[sess.tasks.category].color : '#00ff9b';
              return (
                <div key={sess.id} className="bg-dezz-surface border border-dezz-dim p-4 hover:border-dezz-accent/50 transition group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold font-mono" style={{ color: catColor }}>
                      {formatDuration(Math.floor(sess.duration_seconds / 60))} {profile?.time_unit?.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {new Date(sess.end_time).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-white font-space leading-tight mb-2 truncate">
                    {sess.tasks?.title || "Unknown Task"}
                  </h4>
                  <p className="text-xs text-gray-400 font-mono line-clamp-2 h-8">
                    {sess.log_notes || "No logs..."}
                  </p>
                </div>
              );
            })}
          </div>

          {filteredHistory.length === 0 && (
            <div className="h-32 flex items-center justify-center text-gray-600 font-mono text-sm uppercase">No Data Recorded Yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
