import { useEffect, useCallback, useRef } from 'react';
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

  // INITIAL LOAD
  useEffect(() => {
    if (!session) return;

    const loadRemoteSession = async () => {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (!error && data) {
         // Inherit session logic from DB
         setProject(data.project);
         if (data.current_task_id) taskManager.setCurrentTaskId(data.current_task_id);
         setInstructions(data.instructions || []);
         setSelectedGoal(data.selected_goal || 0);
         setSelectedCategory(data.selected_category || '');

         // sync timer math
         timer.syncState(data.timer_state);
         setIsLocked(true);
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
          if (newRow) {
            // Apply strictly if we are missing state or if it's an update
            setProject(newRow.project);
            if (newRow.current_task_id) taskManager.setCurrentTaskId(newRow.current_task_id);
            setInstructions(newRow.instructions || []);
            setSelectedGoal(newRow.selected_goal || 0);
            setSelectedCategory(newRow.selected_category || '');
            
            // Sync the timer engine with the incoming state
            timer.syncState(newRow.timer_state);
            setIsLocked(true);
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
    if (!session || !isLocked) return;

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
      updated_at: new Date().toISOString()
    });
  }, [session, isLocked, project, taskManager.currentTaskId, instructions, selectedGoal, selectedCategory, timer]);

  const removeSession = useCallback(async () => {
    if (!session) return;
    await supabase.from('active_sessions').delete().eq('user_id', session.user.id);
  }, [session]);

  return { pushState, removeSession };
}
