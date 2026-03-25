import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useTasks(session) {
  const [tasks, setTasks] = useState([]);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  useEffect(() => {
    if (session) fetchTasks();
  }, [session]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
  };

  const saveToBrain = async (title) => {
    const existing = tasks.find(t => t.title.toLowerCase() === title.toLowerCase());
    if (existing) return existing.id;

    if (title !== 'NEW_FLOW') {
      const { data, error } = await supabase.from('tasks').insert({
        user_id: session.user.id,
        title: title,
        status: 'pending'
      }).select();

      if (!error && data) {
        setTasks([data[0], ...tasks]);
        return data[0].id;
      }
    }
    return null;
  };

  const deleteTask = async (id, showToast) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id));
      if (showToast) showToast('KNOWLEDGE NODE DELETED', 'warn');
    }
  };

  const markTaskDone = async (id) => {
    await supabase.from('tasks')
      .update({ status: 'done' })
      .eq('id', id);
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'done' } : t));
  };

  const updateTaskCategory = async (id, category) => {
    await supabase.from('tasks')
      .update({ category })
      .eq('id', id);
    setTasks(tasks.map(t => t.id === id ? { ...t, category } : t));
  };

  return {
    tasks,
    setTasks,
    currentTaskId,
    setCurrentTaskId,
    fetchTasks,
    saveToBrain,
    deleteTask,
    markTaskDone,
    updateTaskCategory,
  };
}
