import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';

export function useTasks(session) {
  const [tasks, setTasks] = useState([]);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
  }, [session]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const saveToBrain = useCallback(async (title) => {
    if (!session) return null;
    const existing = tasks.find(t => t.title.toLowerCase() === title.toLowerCase());
    if (existing) return existing.id;

    if (title !== 'NEW_FLOW') {
      const { data, error } = await supabase.from('tasks').insert({
        user_id: session.user.id,
        title: title,
        status: 'pending'
      }).select();

      if (!error && data) {
        setTasks(prev => [data[0], ...prev]);
        return data[0].id;
      }
    }
    return null;
  }, [session, tasks]);

  const deleteTask = useCallback(async (id, showToast) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id));
      if (showToast) showToast('KNOWLEDGE NODE DELETED', 'warn');
    }
  }, []);

  const markTaskDone = useCallback(async (id) => {
    await supabase.from('tasks')
      .update({ status: 'done' })
      .eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
  }, []);

  const updateTaskCategory = useCallback(async (id, category) => {
    await supabase.from('tasks')
      .update({ category })
      .eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, category } : t));
  }, []);

  return useMemo(() => ({
    tasks,
    setTasks,
    currentTaskId,
    setCurrentTaskId,
    fetchTasks,
    saveToBrain,
    deleteTask,
    markTaskDone,
    updateTaskCategory,
  }), [
    tasks,
    currentTaskId,
    fetchTasks,
    saveToBrain,
    deleteTask,
    markTaskDone,
    updateTaskCategory
  ]);
}
