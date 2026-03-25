import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { X, Loader2, Upload, Activity } from 'lucide-react';

export default function ProfileView({ session, profile, updateProfile, onClose, t, showToast }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [pulseEnabled, setPulseEnabled] = useState(profile?.pulse_enabled || false);
  const [pulseFreq, setPulseFreq] = useState(profile?.pulse_frequency || 30);
  const [timeUnit, setTimeUnit] = useState(profile?.time_unit || 'mins');
  
  const [loading, setLoading] = useState(false);
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const [totalStats, setTotalStats] = useState({ sessions: 0, focusMinutes: 0, projects: 0 });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStats();
    setNotifsEnabled('Notification' in window && Notification.permission === 'granted');
  }, []);

  const loadStats = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('duration_seconds')
      .eq('user_id', session.user.id);

    const { data: taskData } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', session.user.id);

    if (data) {
      setTotalStats({
        sessions: data.length,
        focusMinutes: Math.round(data.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60),
        projects: taskData ? taskData.length : 0,
      });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      if (showToast) showToast('IMAGE TOO LARGE (MAX 2MB)', 'error');
      return;
    }

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      if (showToast) showToast('AVATAR UPDATED', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('UPLOAD FAILED', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    await updateProfile({
      display_name: displayName,
      pulse_enabled: pulseEnabled,
      pulse_frequency: pulseFreq,
      time_unit: timeUnit
    });
    setLoading(false);
    if (showToast) showToast('PROFILE SAVED', 'success');
  };

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setNotifsEnabled(result === 'granted');
    }
  };

  const formatVal = (mins) => {
    if (timeUnit === 'hours') return (mins / 60).toFixed(1);
    return mins;
  };

  const unitLabel = timeUnit === 'hours' ? 'HRS' : 'MINS';

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : session.user.email.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-dezz-bg border border-dezz-dim rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-10 p-5 border-b border-dezz-dim flex justify-between items-center bg-dezz-surface/90 backdrop-blur-md">
          <h3 className="font-space font-bold text-xl text-white tracking-tight uppercase">{t.profile}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-dezz-accent transition duration-300 group-hover:brightness-50"
                  style={{ boxShadow: '0 0 20px rgba(0, 255, 155, 0.2)' }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-dezz-accent/20 border-2 border-dezz-accent flex items-center justify-center text-2xl font-bold text-dezz-accent font-space transition duration-300 group-hover:brightness-50">
                  {initials}
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <Upload size={24} className="text-white drop-shadow-md" />
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <p className="text-[10px] text-gray-500 font-mono mt-3">{session.user.email}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-dezz-surface border border-dezz-dim p-3 text-center">
              <p className="text-xl font-space font-bold text-dezz-accent">{totalStats.sessions}</p>
              <p className="text-[9px] text-gray-500 font-mono uppercase">{t.sessions}</p>
            </div>
            <div className="bg-dezz-surface border border-dezz-dim p-3 text-center">
              <p className="text-xl font-space font-bold text-white">{formatVal(totalStats.focusMinutes)}<span className="text-xs text-gray-500">{unitLabel.toLowerCase().charAt(0)}</span></p>
              <p className="text-[9px] text-gray-500 font-mono uppercase">{t.focusTime} ({unitLabel})</p>
            </div>
            <div className="bg-dezz-surface border border-dezz-dim p-3 text-center">
              <p className="text-xl font-space font-bold text-white">{totalStats.projects}</p>
              <p className="text-[9px] text-gray-500 font-mono uppercase">PROJECTS</p>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="space-y-5 mb-8">
            {/* Display Name */}
            <div>
              <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">{t.displayName}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="YOUR ALIAS..."
                className="w-full bg-dezz-surface p-3 border border-dezz-dim text-white outline-none focus:border-dezz-accent font-mono text-sm"
              />
            </div>

            {/* Notifications Toggle */}
            <div>
              <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">{t.notifications}</label>
              <div
                className="flex items-center gap-3 bg-dezz-surface p-3 border border-dezz-dim hover:border-dezz-accent/50 cursor-pointer transition select-none"
                onClick={enableNotifications}
              >
                <div className={`w-8 h-4 rounded-full transition-colors relative ${notifsEnabled ? 'bg-dezz-accent' : 'bg-dezz-dim'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${notifsEnabled ? 'left-4' : 'left-0.5'}`}></div>
                </div>
                <span className="text-xs text-gray-300 font-mono uppercase tracking-wide">
                  {notifsEnabled ? 'SYSTEM ALERTS ONLINE' : t.enableNotifs}
                </span>
              </div>
            </div>

            {/* TIME UNIT TOGGLE */}
            <div>
              <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">DISPLAY UNITS</label>
              <div className="flex gap-2">
                {['mins', 'hours'].map(u => (
                  <button
                    key={u}
                    onClick={() => setTimeUnit(u)}
                    className={`flex-1 py-2 text-xs font-mono border transition uppercase tracking-widest ${
                      timeUnit === u ? 'bg-dezz-accent/20 border-dezz-accent text-dezz-accent font-bold' : 'border-dezz-dim text-gray-600 hover:text-white'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* PULSE CHECKS CONFIG */}
            <div className="border border-dezz-accent/30 bg-dezz-surface p-4 relative overflow-hidden group">
              <div className="absolute opacity-10 -right-4 -top-4 text-dezz-accent group-hover:scale-110 transition duration-500 pointer-events-none">
                <Activity size={80} />
              </div>
              <label className="block text-[10px] text-dezz-accent font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                <Activity size={12} /> PULSE CHECKS (ANTI-IDLE)
              </label>
              
              <div className="flex items-center gap-3 mb-3 cursor-pointer select-none" onClick={() => setPulseEnabled(!pulseEnabled)}>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${pulseEnabled ? 'bg-dezz-accent' : 'bg-dezz-dim'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-black shadow transition-all ${pulseEnabled ? 'left-4' : 'left-0.5'}`}></div>
                </div>
                <span className="text-xs text-gray-300 font-mono uppercase tracking-wide">
                  {pulseEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              
              {pulseEnabled && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-2">FREQUENCY (MINUTES)</label>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60].map(freq => (
                      <button
                        key={freq}
                        onClick={() => setPulseFreq(freq)}
                        className={`flex-1 py-1.5 text-xs font-mono border transition ${
                          pulseFreq === freq ? 'bg-dezz-accent/20 border-dezz-accent text-dezz-accent' : 'border-dezz-dim text-gray-500 hover:text-white'
                        }`}
                      >
                        {freq}m
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-gray-600 font-mono mt-3 leading-relaxed uppercase">
                    SYSTEM WILL PROMPT YOU EVERY {pulseFreq} MINS. FAILURE TO ACKNOWLEDGE WITHIN 5 MINS WILL AUTO-PAUSE YOUR SESSION.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveProfile}
            disabled={loading}
            className={`w-full py-4 text-sm font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 ${
              loading ? 'bg-gray-600 text-white cursor-not-allowed' : 'bg-dezz-accent text-black hover:bg-white shadow-[0_0_15px_#00ff9b40]'
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : t.saveProfile}
          </button>
        </div>
      </div>
    </div>
  );
}
