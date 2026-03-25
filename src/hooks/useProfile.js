import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useProfile(session) {
  const [profile, setProfile] = useState({
    display_name: '',
    avatar_url: null,
    pulse_enabled: false,
    pulse_frequency: 0, // 0 means disabled
    time_unit: 'mins'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setProfile({
        display_name: data.display_name || '',
        avatar_url: data.avatar_url || null,
        pulse_enabled: data.pulse_enabled || false,
        pulse_frequency: data.pulse_frequency || 0,
        time_unit: data.time_unit || 'mins'
      });
    }
    setLoading(false);
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (!error) {
      setProfile((prev) => ({ ...prev, ...updates }));
    }
    return { data, error };
  };

  return { profile, loading, updateProfile, refreshProfile: loadProfile };
}
