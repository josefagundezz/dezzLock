import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e, showToast) => {
    if (e) e.preventDefault();
    setLoading(true);

    const emailRef = document.getElementById('email');
    const passRef = document.getElementById('pass');

    if (!emailRef || (authView !== 'recovery' && !passRef)) {
      showToast("SYSTEM ERROR: INPUTS NOT FOUND", 'warn');
      setLoading(false);
      return;
    }

    const email = emailRef.value;
    const password = passRef ? passRef.value : null;
    let result = {};

    try {
      if (authView === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else if (authView === 'register') {
        result = await supabase.auth.signUp({ email, password });
        if (!result.error) showToast("WELCOME TO DEZZLOCK", 'success');
      } else if (authView === 'recovery') {
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://lock.dezz.cloud'
        });
        if (!result.error) {
          showToast("RECOVERY EMAIL SENT", 'success');
          setAuthView('login');
        }
      } else if (authView === 'update_password') {
        result = await supabase.auth.updateUser({ password });
        if (!result.error) {
          showToast("PASSWORD UPDATED", 'success');
          setAuthView('login');
        }
      }

      if (result.error) throw result.error;
    } catch (error) {
      console.error(error);
      showToast(error.message.toUpperCase(), 'warn');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return {
    session,
    authView,
    setAuthView,
    loading,
    initialLoading,
    showPassword,
    setShowPassword,
    handleAuth,
    signOut,
  };
}
