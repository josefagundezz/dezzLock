import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useProtocols(session) {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      loadProtocols();
    }
  }, [session]);

  const loadProtocols = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('protocols')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProtocols(data);
    }
    setLoading(false);
  };

  const addProtocol = async (protocolData) => {
    const { data, error } = await supabase
      .from('protocols')
      .insert({
        user_id: session.user.id,
        ...protocolData
      })
      .select()
      .single();

    if (!error && data) {
      setProtocols([data, ...protocols]);
      return data;
    }
    console.error(error);
    return null;
  };

  const deleteProtocol = async (id) => {
    const { error } = await supabase
      .from('protocols')
      .delete()
      .eq('id', id);

    if (!error) {
      setProtocols(protocols.filter(p => p.id !== id));
    }
  };

  return { protocols, loading, addProtocol, deleteProtocol, refreshProtocols: loadProtocols };
}
