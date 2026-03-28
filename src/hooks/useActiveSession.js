import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

  // Keep refs in sync for the realtime callback closure and pushState
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  const timerRef = useRef(timer);
  const taskManagerRef = useRef(taskManager);
  const sessionRef = useRef(session);
  const stateRefs = useRef({ project, instructions, selectedGoal, selectedCategory });

  useEffect(() => { timerRef.current = timer; }, [timer]);
  useEffect(() => { taskManagerRef.current = taskManager; }, [taskManager]);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => {
    stateRefs.current = { project, instructions, selectedGoal, selectedCategory };
  }, [project, instructions, selectedGoal, selectedCategory]);

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
      } else {
        const savedState = JSON.parse(localStorage.getItem('dezzSession'));
        if (savedState) {
          setProject(savedState.project);
          setInstructions(savedState.instructions || []);
          setSelectedGoal(savedState.selectedGoal || 0);
          setSelectedCategory(savedState.selectedCategory || '');
          taskManagerRef.current.setCurrentTaskId(savedState.currentTaskId);
          timerRef.current.restore(savedState.startTime);
          setIsLocked(true);
        }
      }
    };
    
    loadRemoteSession();
  }, [session, setIsLocked, setProject, setInstructions, setSelectedGoal, setSelectedCategory]);

  // REALTIME SUBSCRIPTION - Optimized to avoid frequent reconnects
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
          if (payload.eventType === 'DELETE') {
            setIsLocked(false);
            setProject('');
            setInstructions([]);
            setSelectedGoal(0);
            setSelectedCategory('');
            taskManagerRef.current.setCurrentTaskId(null);
            timerRef.current.reset();
            localStorage.removeItem('dezzSession');
            setRemoteSession(null);
            return;
          }

          const newRow = payload.new;
          if (!newRow) return;

          if (newRow.last_device_id === DEVICE_ID.current) return;

          if (isLockedRef.current) {
            setProject(newRow.project);
            if (newRow.current_task_id) taskManagerRef.current.setCurrentTaskId(newRow.current_task_id);
            setInstructions(newRow.instructions || []);
            setSelectedGoal(newRow.selected_goal || 0);
            setSelectedCategory(newRow.selected_category || '');
            
            timerRef.current.syncState(newRow.timer_state);
            setRemoteSession(null); 
          } else {
            setRemoteSession(newRow);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Removed timer/taskManager/setters from dependencies to keep subscription stable
  }, [session, setIsLocked, setProject, setInstructions, setSelectedGoal, setSelectedCategory]);

  // ACTION METHODS TO PUSH STATE
  const pushState = useCallback(async (actionType = 'update', overrideTimerState = null) => {
    const s = sessionRef.current;
    // Allow push if we're locked OR if we're transitioning (overrideTimerState provided)
    if (!s || (!isLockedRef.current && !overrideTimerState)) return;

    const currentState = overrideTimerState || timerRef.current.getSyncState();
    const { project: p, instructions: inst, selectedGoal: sg, selectedCategory: sc } = stateRefs.current;
    
    await supabase.from('active_sessions').upsert({
      user_id: s.user.id,
      project: p,
      current_task_id: taskManagerRef.current.currentTaskId,
      instructions: inst,
      selected_goal: sg,
      selected_category: sc,
      state: currentState.isPaused ? 'paused' : 'focusing',
      timer_state: currentState,
      last_device_id: DEVICE_ID.current,
      updated_at: new Date().toISOString()
    });
  }, []);

  const syncRemote = useCallback((data) => {
    if (!data) return;
    setProject(data.project);
    if (data.current_task_id) taskManagerRef.current.setCurrentTaskId(data.current_task_id);
    setInstructions(data.instructions || []);
    setSelectedGoal(data.selected_goal || 0);
    setSelectedCategory(data.selected_category || '');
    timerRef.current.syncState(data.timer_state);
    setIsLocked(true);
    setRemoteSession(null);
  }, [setProject, setInstructions, setSelectedGoal, setSelectedCategory, setIsLocked]);

  const ignoreRemote = useCallback(async () => {
    const s = sessionRef.current;
    if (!s || !remoteSession) return;
    
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
        user_id: s.user.id,
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

    await supabase.from('active_sessions').delete().eq('user_id', s.user.id);
    setRemoteSession(null);
  }, [remoteSession]);

  const removeSession = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return;
    await supabase.from('active_sessions').delete().eq('user_id', s.user.id);
  }, []);

  return useMemo(() => ({
    pushState,
    removeSession,
    remoteSession,
    syncRemote,
    ignoreRemote
  }), [pushState, removeSession, remoteSession, syncRemote, ignoreRemote]);
}
