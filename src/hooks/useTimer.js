import { useState, useEffect, useRef } from 'react';

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

  const start = () => {
    const time = Date.now();
    setStartTime(time);
    setNow(time);
    setTotalPausedMs(0);
    setBreakCount(0);
    setIsPaused(false);
    setPauseStartTime(null);
    setLastPulseCheckTime(time);
  };

  const restore = (savedStartTime) => {
    setStartTime(savedStartTime);
    setNow(Date.now());
    setIsPaused(false);
    setTotalPausedMs(0);
    setBreakCount(0);
    setLastPulseCheckTime(savedStartTime);
  };

  const pause = () => {
    setIsPaused(true);
    setPauseStartTime(Date.now());
    setBreakCount(prev => prev + 1);
  };

  const resume = () => {
    if (pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      setTotalPausedMs(prev => prev + pauseDuration);
    }
    setPauseStartTime(null);
    setIsPaused(false);
    const currentTime = Date.now();
    setNow(currentTime);
    setLastPulseCheckTime(currentTime);
  };

  const acknowledgePulse = () => {
    setLastPulseCheckTime(Date.now());
  };

  const reset = () => {
    setStartTime(null);
    setNow(null);
    setIsPaused(false);
    setTotalPausedMs(0);
    setPauseStartTime(null);
    setBreakCount(0);
    setLastPulseCheckTime(null);
    clearInterval(intervalRef.current);
  };

  // Total elapsed since start (including paused time)
  const totalElapsedMs = startTime && now ? now - startTime : 0;

  // Current pause duration (if currently paused)
  const currentPauseMs = isPaused && pauseStartTime ? Date.now() - pauseStartTime : 0;

  // Actual focus time (excluding all breaks)
  const focusMs = totalElapsedMs - totalPausedMs - currentPauseMs;
  const focusSeconds = Math.max(0, Math.floor(focusMs / 1000));

  // Total break time
  const breakMs = totalPausedMs + currentPauseMs;
  const breakSeconds = Math.max(0, Math.floor(breakMs / 1000));

  // Total session time
  const totalSeconds = Math.max(0, Math.floor(totalElapsedMs / 1000));

  // PULSE CHECK LOGIC
  const currentNow = now || Date.now();
  let isPulseChecking = false;
  let shouldAutoPause = false;

  if (!isPaused && profile?.pulse_enabled && profile?.pulse_frequency > 0 && lastPulseCheckTime) {
    const timeSinceLastPulse = currentNow - lastPulseCheckTime;
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
      // Optional: Since it auto-paused, next time it resumes, lastPulseCheckTime is reset.
    }
  }, [shouldAutoPause]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return {
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
  };
}
