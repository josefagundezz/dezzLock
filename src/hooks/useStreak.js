import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { STREAK_TIERS } from '../i18n/translations';

export function useStreak(session) {
  const [streak, setStreak] = useState(0);
  const [tier, setTier] = useState(STREAK_TIERS[0]);

  useEffect(() => {
    if (session) calculateStreak();
  }, [session]);

  const calculateStreak = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('end_time')
      .eq('user_id', session.user.id)
      .order('end_time', { ascending: false });

    if (!data || data.length === 0) {
      setStreak(0);
      setTier(STREAK_TIERS[0]);
      return;
    }

    // Group sessions by date (local timezone)
    const sessionDates = new Set();
    data.forEach(s => {
      const date = new Date(s.end_time).toLocaleDateString();
      sessionDates.add(date);
    });

    // Convert to sorted array of dates
    const sortedDates = Array.from(sessionDates)
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    // Count consecutive days from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if there's a session today or yesterday (to maintain streak)
    const mostRecentDate = sortedDates[0];
    mostRecentDate.setHours(0, 0, 0, 0);

    if (mostRecentDate < yesterday) {
      // Streak broken - no session today or yesterday
      setStreak(0);
      setTier(STREAK_TIERS[0]);
      return;
    }

    let consecutiveDays = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = sortedDates[i - 1];
      const previous = sortedDates[i];
      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);

      const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    setStreak(consecutiveDays);

    // Find appropriate tier
    const currentTier = [...STREAK_TIERS]
      .reverse()
      .find(t => consecutiveDays >= t.min) || STREAK_TIERS[0];
    setTier(currentTier);
  };

  const refresh = () => {
    if (session) calculateStreak();
  };

  return { streak, tier, refresh };
}
