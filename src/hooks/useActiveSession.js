import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';

export function useActiveSession(
  session,
  timer,
  isLocked,
  setIsLocked,
  project,
  setProject,
  instructions,
  setInstructions,
  selectedGoal,
  setSelectedGoal,
  selectedCategory,
  setSelectedCategory,
  taskManager
) {
  const DEVICE_ID = useRef(Math.random().toString(36).substring(2, 10));
  const isLockedRef = useRef(isLocked);
  const [remoteSession, setRemoteSession] = useState(null);

  // Keep ref in sync
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // INITIAL LOAD
  useEffect(() => {
    if (!session) return;

    const loadRemoteSession = async () => {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (!error && data) {
         setRemoteSession(data);
         // IMPORTANT: We do NOT restore from localStorage if a remote session is detected,
         // to allow the user to see the "JOIN" banner.
      } else {
        // Fallback to localstorage only if no active remote session
        const savedState = JSON.parse(localStorage.getItem('dezzSession'));
        if (savedState) {
          setProject(savedState.project);
          setInstructions(savedState.instructions || []);
          setSelectedGoal(savedState.selectedGoal || 0);
          setSelectedCategory(savedState.selectedCategory || '');
          taskManager.setCurrentTaskId(savedState.currentTaskId);
          timer.restore(savedState.startTime);
          setIsLocked(true);
        }
      }
    };
    
    loadRemoteSession();
  }, [session]);

  // REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('public:active_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_sessions',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          // If deleted remotely (e.g. clocked out from another device)
          if (payload.eventType === 'DELETE') {
            setIsLocked(false);
            setProject('');
            setInstructions([]);
            setSelectedGoal(0);
            setSelectedCategory('');
            taskManager.setCurrentTaskId(null);
            timer.reset();
            localStorage.removeItem('dezzSession');
            return;
          }

          // If inserted or updated remotely by *another* device
          const newRow = payload.new;
          if (newRow && newRow.last_device_id !== DEVICE_ID.current) {
            // Instead of auto-locking, we show the banner
            setRemoteSession(newRow);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, timer, taskManager, setIsLocked, setProject, setInstructions, setSelectedGoal, setSelectedCategory]);

  // ACTION METHODS TO PUSH STATE
  const pushState = useCallback(async (actionType = 'update', overrideTimerState = null) => {
    if (!session || !isLockedRef.current) return;

    const currentState = overrideTimerState || timer.getSyncState();
    
    await supabase.from('active_sessions').upsert({
      user_id: session.user.id,
      project,
      current_task_id: taskManager.currentTaskId,
      instructions,
      selected_goal: selectedGoal,
      selected_category: selectedCategory,
      state: currentState.isPaused ? 'paused' : 'focusing',
      timer_state: currentState,
      last_device_id: DEVICE_ID.current,
      updated_at: new Date().toISOString()
    });
  }, [session, project, taskManager.currentTaskId, instructions, selectedGoal, selectedCategory, timer]);

  const syncRemote = useCallback((data) => {
    if (!data) return;
    setProject(data.project);
    if (data.current_task_id) taskManager.setCurrentTaskId(data.current_task_id);
    setInstructions(data.instructions || []);
    setSelectedGoal(data.selected_goal || 0);
    setSelectedCategory(data.selected_category || '');
    timer.syncState(data.timer_state);
    setIsLocked(true);
    setRemoteSession(null);
  }, [setProject, setInstructions, setSelectedGoal, setSelectedCategory, setIsLocked, timer, taskManager]);

  const ignoreRemote = useCallback(async () => {
    if (!session || !remoteSession) return;
    
    // Save the remote session data before deleting it
    const st = remoteSession.timer_state;
    if (st && st.startTime) {
      const now = Date.now();
      const totalElapsedMs = now - st.startTime;
      const currentPauseMs = st.isPaused && st.pauseStartTime ? now - st.pauseStartTime : 0;
      const breakMs = (st.totalPausedMs || 0) + currentPauseMs;
      const focusMs = totalElapsedMs - breakMs;
      
      const focusSeconds = Math.max(0, Math.floor(focusMs / 1000));
      const breakSeconds = Math.max(0, Math.floor(breakMs / 1000));
      const totalSeconds = Math.max(0, Math.floor(totalElapsedMs / 1000));

      await supabase.from('sessions').insert({
        user_id: session.user.id,
        task_id: remoteSession.current_task_id,
        log_notes: `[AUTO-SAVED FROM REMOTE] ${remoteSession.project}`,
        start_time: new Date(st.startTime).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: totalSeconds,
        focus_seconds: focusSeconds,
        break_seconds: breakSeconds,
        break_count: st.breakCount || 0,
        goal_minutes: remoteSession.selected_goal || 0,
        goal_reached: focusSeconds >= (remoteSession.selected_goal * 60)
      });
    }

    await supabase.from('active_sessions').delete().eq('user_id', session.user.id);
    setRemoteSession(null);
  }, [session, remoteSession]);

  const removeSession = useCallback(async () => {
    if (!session) return;
    await supabase.from('active_sessions').delete().eq('user_id', session.user.id);
  }, [session]);

  return { pushState, removeSession, remoteSession, syncRemote, ignoreRemote };
}
