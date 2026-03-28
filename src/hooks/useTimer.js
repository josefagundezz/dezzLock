import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export function useTimer(profile) {
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [breakCount, setBreakCount] = useState(0);
  const [lastPulseCheckTime, setLastPulseCheckTime] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (startTime) {
      intervalRef.current = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [startTime]);

  const start = useCallback(() => {
    const time = Date.now();
    setStartTime(time);
    setNow(time);
    setTotalPausedMs(0);
    setBreakCount(0);
    setIsPaused(false);
    setPauseStartTime(null);
    setLastPulseCheckTime(time);
    return {
      startTime: time,
      now: time,
      totalPausedMs: 0,
      breakCount: 0,
      isPaused: false,
      pauseStartTime: null,
      lastPulseCheckTime: time
    };
  }, []);

  const restore = useCallback((savedStartTime) => {
    setStartTime(savedStartTime);
    setNow(Date.now());
    setIsPaused(false);
    setTotalPausedMs(0);
    setBreakCount(0);
    setLastPulseCheckTime(savedStartTime);
  }, []);

  // We use refs for state that is needed inside callbacks to avoid stale closures
  // while keeping the callback reference stable.
  const stateRef = useRef({ startTime, isPaused, totalPausedMs, pauseStartTime, breakCount, lastPulseCheckTime });
  useEffect(() => {
    stateRef.current = { startTime, isPaused, totalPausedMs, pauseStartTime, breakCount, lastPulseCheckTime };
  }, [startTime, isPaused, totalPausedMs, pauseStartTime, breakCount, lastPulseCheckTime]);

  const pause = useCallback(() => {
    const time = Date.now();
    const { startTime: st, totalPausedMs: tp, breakCount: bc, lastPulseCheckTime: lp } = stateRef.current;
    
    setIsPaused(true);
    setPauseStartTime(time);
    setBreakCount(prev => prev + 1);
    
    return {
      startTime: st,
      isPaused: true,
      totalPausedMs: tp,
      pauseStartTime: time,
      breakCount: bc + 1,
      lastPulseCheckTime: lp
    };
  }, []);

  const resume = useCallback(() => {
    const time = Date.now();
    const { startTime: st, totalPausedMs: tp, pauseStartTime: ps, breakCount: bc } = stateRef.current;
    
    let newTotalPaused = tp;
    if (ps) {
      newTotalPaused += (time - ps);
      setTotalPausedMs(newTotalPaused);
    }
    setPauseStartTime(null);
    setIsPaused(false);
    setNow(time);
    setLastPulseCheckTime(time);
    return {
      startTime: st,
      isPaused: false,
      totalPausedMs: newTotalPaused,
      pauseStartTime: null,
      breakCount: bc,
      lastPulseCheckTime: time
    };
  }, []);

  const acknowledgePulse = useCallback(() => {
    setLastPulseCheckTime(Date.now());
  }, []);

  const reset = useCallback(() => {
    setStartTime(null);
    setNow(null);
    setIsPaused(false);
    setTotalPausedMs(0);
    setPauseStartTime(null);
    setBreakCount(0);
    setLastPulseCheckTime(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const syncState = useCallback((stateObj) => {
    if (!stateObj || !stateObj.startTime) return;
    setStartTime(stateObj.startTime);
    setIsPaused(stateObj.isPaused || false);
    setTotalPausedMs(stateObj.totalPausedMs || 0);
    setPauseStartTime(stateObj.pauseStartTime || null);
    setBreakCount(stateObj.breakCount || 0);
    setLastPulseCheckTime(stateObj.lastPulseCheckTime || null);
    setNow(Date.now());
  }, []);

  const getSyncState = useCallback(() => ({
    startTime: stateRef.current.startTime,
    isPaused: stateRef.current.isPaused,
    totalPausedMs: stateRef.current.totalPausedMs,
    pauseStartTime: stateRef.current.pauseStartTime,
    breakCount: stateRef.current.breakCount,
    lastPulseCheckTime: stateRef.current.lastPulseCheckTime
  }), []);

  // Total elapsed since start (including paused time)
  const effectiveNow = now || Date.now();
  const totalElapsedMs = startTime ? effectiveNow - startTime : 0;

  // Current pause duration (if currently paused)
  const currentPauseMs = isPaused && pauseStartTime ? effectiveNow - pauseStartTime : 0;

  // Actual focus time (excluding all breaks)
  const focusMs = totalElapsedMs - totalPausedMs - currentPauseMs;
  const focusSeconds = Math.max(0, Math.floor(focusMs / 1000));

  // Total break time
  const breakMs = totalPausedMs + currentPauseMs;
  const breakSeconds = Math.max(0, Math.floor(breakMs / 1000));

  // Total session time
  const totalSeconds = Math.max(0, Math.floor(totalElapsedMs / 1000));

  // PULSE CHECK LOGIC
  let isPulseChecking = false;
  let shouldAutoPause = false;

  if (!isPaused && profile?.pulse_enabled && profile?.pulse_frequency > 0 && lastPulseCheckTime) {
    const timeSinceLastPulse = effectiveNow - lastPulseCheckTime;
    const pulseThresholdMs = profile.pulse_frequency * 60 * 1000;
    const autoPauseThresholdMs = pulseThresholdMs + (5 * 60 * 1000); // 5 minutes after prompt

    if (timeSinceLastPulse >= pulseThresholdMs) {
      isPulseChecking = true;
      if (timeSinceLastPulse >= autoPauseThresholdMs) {
        shouldAutoPause = true;
      }
    }
  }

  useEffect(() => {
    if (shouldAutoPause) {
      pause();
    }
  }, [shouldAutoPause, pause]);

  const formatTime = useCallback((seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, []);

  return useMemo(() => ({
    startTime,
    isPaused,
    breakCount,
    focusSeconds,
    breakSeconds,
    totalSeconds,
    focusFormatted: formatTime(focusSeconds),
    breakFormatted: formatTime(breakSeconds),
    totalFormatted: formatTime(totalSeconds),
    isPulseChecking,
    acknowledgePulse,
    formatTime,
    start,
    restore,
    pause,
    resume,
    reset,
    syncState,
    getSyncState,
  }), [
    startTime,
    isPaused,
    breakCount,
    focusSeconds,
    breakSeconds,
    totalSeconds,
    isPulseChecking,
    acknowledgePulse,
    formatTime,
    start,
    restore,
    pause,
    resume,
    reset,
    syncState,
    getSyncState
  ]);
}
