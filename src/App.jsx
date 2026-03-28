import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { dict } from './i18n/translations';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useTimer } from './hooks/useTimer';
import { useTasks } from './hooks/useTasks';
import { useStreak } from './hooks/useStreak';
import { useNotifications } from './hooks/useNotifications';
import { useProfile } from './hooks/useProfile';
import { useProtocols } from './hooks/useProtocols';
import { useActiveSession } from './hooks/useActiveSession';

// Components
import AuthView from './components/AuthView';
import Header from './components/Header';
import IdleView from './components/IdleView';
import LockedView from './components/LockedView';
import Toast from './components/Toast';
import BrainModal from './components/BrainModal';
import ClockOutModal from './components/ClockOutModal';
import StatsModal from './components/StatsModal';
import ProfileView from './components/ProfileView';
import ProtocolsModal from './components/ProtocolsModal';
import StandupModal from './components/StandupModal';
import { Crosshair, Play, Hourglass, Smartphone, Trash2 } from 'lucide-react';

function App() {
  // === HOOKS ===
  const auth = useAuth();
  const timer = useTimer();
  const taskManager = useTasks(auth.session);
  const streakManager = useStreak(auth.session);
  const notifications = useNotifications();
  const { profile, updateProfile } = useProfile(auth.session);
  const protocolManager = useProtocols(auth.session);

  // === LOCAL STATE ===
  const [lang, setLang] = useState('en');
  const [isLocked, setIsLocked] = useState(false);
  const [project, setProject] = useState('');
  const [instructions, setInstructions] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(0); // minutes, 0 = no goal
  const [selectedCategory, setSelectedCategory] = useState('');
  const [goalReached, setGoalReached] = useState(false);

  // Modal states
  const [showBrain, setShowBrain] = useState(false);
  const [showProtocols, setShowProtocols] = useState(false);
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStandup, setShowStandup] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });

  // Protocol Prompt State
  const [pendingProtocol, setPendingProtocol] = useState(null);
  const promptedProtocolsRef = useRef(new Set());

  // Session report data
  const [sessionLog, setSessionLog] = useState('');
  const [markAsDone, setMarkAsDone] = useState(false);

  // Goal reached ref to prevent multiple notifications
  const goalNotifiedRef = useRef(false);

  const t = dict[lang];

  // === TOAST ===
  const showToast = (msg, type = 'info') => {
    setToast({ show: true, msg, type });
  };

  // === RESTORE SESSION AND REALTIME SYNC ===
  const { pushState, removeSession, remoteSession, syncRemote, ignoreRemote } = useActiveSession(
    auth.session,
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
  );

  // === GOAL TRACKING ===
  useEffect(() => {
    if (isLocked && selectedGoal > 0 && !goalNotifiedRef.current) {
      const goalSeconds = selectedGoal * 60;
      if (timer.focusSeconds >= goalSeconds) {
        setGoalReached(true);
        goalNotifiedRef.current = true;
        showToast(`🎯 ${t.goalReached}`, 'success');
        
        // Slight delay for system notification to bypass Focus Assist quirks
        setTimeout(() => {
          notifications.send('dezzLock', `🎯 ${t.goalReached} — ${selectedGoal} minutes of focus completed!`);
        }, 1500);
      }
    }
  }, [timer.focusSeconds, isLocked, selectedGoal]);

  // === PROTOCOL DAEMON ===
  useEffect(() => {
    if (!auth.session || isLocked || protocolManager.loading || protocolManager.protocols.length === 0) return;

    const interval = setInterval(() => {
      if (pendingProtocol) return;

      const now = new Date();
      const currentDay = now.getDay();
      
      // Look 5 minutes into the future
      const targetTime = new Date(now.getTime() + 5 * 60000);
      const targetHours = targetTime.getHours().toString().padStart(2, '0');
      const targetMins = targetTime.getMinutes().toString().padStart(2, '0');
      const targetTimeStr = `${targetHours}:${targetMins}`;
      const dateKey = now.toLocaleDateString();

      const imminent = protocolManager.protocols.find(p => {
        const promptKey = `${p.id}-${dateKey}`;
        if (promptedProtocolsRef.current.has(promptKey)) return false;
        
        return p.days.includes(currentDay) && p.start_time === targetTimeStr;
      });

      if (imminent) {
        setPendingProtocol({ ...imminent, autoStart: false });
        notifications.send('dezzLock Protocol', `[INITIATE PROTOCOL] ${imminent.name} comienza en 5 min.`);
        // Mark as prompted
        promptedProtocolsRef.current.add(`${imminent.id}-${dateKey}`);
      }
    }, 20000); // Check every 20s

    return () => clearInterval(interval);
  }, [auth.session, isLocked, protocolManager.protocols, pendingProtocol]);

  // Protocol Auto-Start Monitor
  useEffect(() => {
    if (pendingProtocol?.autoStart) {
      const timer = setTimeout(() => {
        handleInitiateProtocol();
      }, 5 * 60000); // 5 minutes
      return () => clearTimeout(timer);
    }
  }, [pendingProtocol]);

  // === SELECT FROM BRAIN ===
  const selectTaskFromBrain = (task) => {
    setProject(task.title);
    taskManager.setCurrentTaskId(task.id);
    setInstructions(task.description ? [task.description] : []);
    setSelectedCategory(task.category || '');
    setShowBrain(false);
  };

  // === LOCK IN ===
  const handleLockIn = async () => {
    if (!project.trim() || project === 'NEW_FLOW') {
      showToast(t.emptyError, 'warn');
      return;
    }

    let finalTaskId = taskManager.currentTaskId;
    if (!finalTaskId) {
      finalTaskId = await taskManager.saveToBrain(project);
      taskManager.setCurrentTaskId(finalTaskId);
    }

    // Update task category if set
    if (selectedCategory && finalTaskId) {
      taskManager.updateTaskCategory(finalTaskId, selectedCategory);
    }

    const newState = timer.start();
    setIsLocked(true);
    setGoalReached(false);
    goalNotifiedRef.current = false;

    localStorage.setItem('dezzSession', JSON.stringify({
      project,
      currentTaskId: finalTaskId,
      instructions,
      startTime: Date.now(),
      selectedGoal,
      selectedCategory,
    }));
    
    // Push state immediately with the new timer data
    pushState('update', newState);
  };

  const handleInitiateProtocol = () => {
    if (!pendingProtocol) return;
    setProject(pendingProtocol.project_title || pendingProtocol.name);
    setInstructions([]);
    setSelectedGoal(pendingProtocol.duration_minutes);
    setSelectedCategory(pendingProtocol.category || '');
    // Wait for state to sync, then lock in. 
    // Since handleLockIn uses state, we can quickly set it and call lockIn.
    // However, React batches state updates. A better approach is to pass args if needed, 
    // but the simplest reliable way is to just do this and use a small timeout:
    setTimeout(() => {
      // In a real app we might want to refactor handleLockIn to accept arguments.
      // For now, this approach works due to the simplicity of the components.
    }, 0);
    // Actually, let's refactor the lock in trigger to securely use the chosen settings
    timer.start();
    setIsLocked(true);
    setGoalReached(false);
    goalNotifiedRef.current = false;
    
    // Attempt to set category for the record
    taskManager.setCurrentTaskId(null); // Assuming protocol is a fresh session without brain task unless auto-matched
    setPendingProtocol(null);
  };

  // === PAUSE / RESUME ===
  const handlePause = () => {
    const newState = timer.pause();
    showToast(t.onBreak, 'streak');
    pushState('update', newState);
  };

  const handleResume = () => {
    const newState = timer.resume();
    notifications.send('dezzLock', 'Break over — back to focus! 🔒');
    pushState('update', newState);
  };

  // === CLOCK OUT ===
  const confirmEndSession = async () => {
    const { error } = await supabase.from('sessions').insert({
      user_id: auth.session.user.id,
      task_id: taskManager.currentTaskId,
      log_notes: sessionLog,
      start_time: new Date(timer.startTime).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: timer.totalSeconds,
      focus_seconds: timer.focusSeconds,
      break_seconds: timer.breakSeconds,
      break_count: timer.breakCount,
      goal_minutes: selectedGoal,
      goal_reached: goalReached,
    });

    if (markAsDone && taskManager.currentTaskId) {
      await taskManager.markTaskDone(taskManager.currentTaskId);
    }

    if (error) {
      console.error(error);
      showToast("SAVE FAILED", "warn");
    } else {
      showToast("SESSION SAVED", "success");
      streakManager.refresh();
    }

    // Reset everything
    setIsLocked(false);
    setShowClockOutModal(false);
    setInstructions([]);
    setProject('');
    setSelectedGoal(0);
    setSelectedCategory('');
    setGoalReached(false);
    goalNotifiedRef.current = false;
    taskManager.setCurrentTaskId(null);
    setSessionLog('');
    setMarkAsDone(false);
    timer.reset();
    localStorage.removeItem('dezzSession');
    removeSession();
  };

  // === RENDER: SPLASH SCREEN (PREVENT FLICKER) ===
  if (auth.initialLoading) {
    return (
      <div className="h-screen bg-dezz-bg flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-dezz-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-[10px] text-dezz-accent tracking-[0.3em] uppercase">VERIFYING_IDENTITY...</p>
        </div>
      </div>
    );
  }

  // === RENDER: AUTH GATE ===
  if (!auth.session) {
    return (
      <>
        <AuthView
          authView={auth.authView}
          setAuthView={auth.setAuthView}
          loading={auth.loading}
          showPassword={auth.showPassword}
          setShowPassword={auth.setShowPassword}
          handleAuth={auth.handleAuth}
          showToast={showToast}
        />
        <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />
      </>
    );
  }

  // === RENDER: MAIN APP ===
  return (
    <div className="w-screen h-screen bg-dezz-bg text-gray-200 font-mono flex flex-col items-center justify-between overflow-hidden relative">
      
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      </div>

      {/* HEADER */}
      <Header
        session={auth.session}
        profile={profile}
        lang={lang}
        setLang={setLang}
        streak={streakManager.streak}
        tier={streakManager.tier}
        onStats={() => setShowStats(true)}
        onProfile={() => setShowProfile(true)}
        onStandup={() => setShowStandup(true)}
        onSignOut={auth.signOut}
      />

      {/* MAIN CONTAINER */}
      <main className="z-10 w-full max-w-2xl flex-grow flex flex-col justify-center p-6">
        {!isLocked ? (
          <div className="flex flex-col gap-6">
            {/* REMOTE SESSION BANNER */}
            {remoteSession && (
              <div className="bg-dezz-accent/5 border border-dezz-accent/30 p-4 rounded-sm flex items-center justify-between animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-dezz-accent/10 rounded-full flex items-center justify-center">
                    <Smartphone size={20} className="text-dezz-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-dezz-accent font-bold uppercase tracking-widest">REMOTE SESSION DETECTED</p>
                    <p className="text-white font-space font-bold uppercase">{remoteSession.project}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => syncRemote(remoteSession)}
                    className="bg-dezz-accent text-dezz-bg px-4 py-2 font-mono font-bold text-[10px] uppercase hover:bg-white transition"
                  >
                    JOIN SESSION
                  </button>
                  <button 
                    onClick={async () => {
                      await ignoreRemote();
                      showToast("REMOTE SESSION SAVED & CLOSED", "success");
                    }}
                    className="border border-red-900/50 text-red-500 p-2 hover:bg-red-500 hover:text-white transition"
                    title="SAVE & DISCARD REMOTE SESSION"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
            
            <IdleView
              project={project}
              setProject={setProject}
              instructions={instructions}
              setInstructions={setInstructions}
              tasks={taskManager.tasks}
              currentTaskId={taskManager.currentTaskId}
              profile={profile}
              selectedGoal={selectedGoal}
              setSelectedGoal={setSelectedGoal}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onLockIn={handleLockIn}
              onOpenBrain={() => setShowBrain(true)}
              onOpenProtocols={() => setShowProtocols(true)}
              t={t}
            />
          </div>
        ) : (
          <LockedView
            project={project}
            instructions={instructions}
            timer={timer}
            profile={profile}
            selectedGoal={selectedGoal}
            selectedCategory={selectedCategory}
            goalReached={goalReached}
            onClockOut={() => setShowClockOutModal(true)}
            onPause={handlePause}
            onResume={handleResume}
            t={t}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="z-10 w-full p-4 text-center text-[10px] text-gray-700 font-mono uppercase tracking-widest">
        SYSTEM ID: DEZZ_LOCK_V1.1 // <span className="text-dezz-accent">DEVELOPED BY <a href="https://dezz.cloud" target="_blank" rel="noopener noreferrer">dezzHub</a></span>
      </footer>

      {/* === MODALS === */}
      <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />

      {/* PROTOCOL PENDING PROMPT */}
      {pendingProtocol && !pendingProtocol.autoStart && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-500">
          <div className="bg-dezz-bg border-4 border-dezz-accent w-full max-w-lg shadow-[0_0_50px_#00ff9b33] p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-dezz-accent/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Crosshair size={32} className="text-dezz-accent" />
            </div>
            <h3 className="font-space font-black text-3xl text-white tracking-widest uppercase mb-2">
              PROTOCOL <span className="text-dezz-accent">IMMINENT</span>
            </h3>
            <p className="font-mono text-gray-400 text-sm tracking-widest uppercase mb-8">
              [{pendingProtocol.name}] COMENZARÁ EN <span className="text-white">T-MINUS 5 MIN</span>
            </p>
            
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={() => {
                  setPendingProtocol({...pendingProtocol, autoStart: true});
                  showToast("PROTOCOL QUEUED FOR AUTO-START", "success");
                }} 
                className="w-full py-5 bg-white text-black font-space font-black tracking-widest text-lg uppercase hover:bg-dezz-accent hover:shadow-[0_0_20px_#00ff9b] transition flex items-center justify-center gap-3 group"
              >
                <Hourglass size={20} className="group-hover:rotate-180 transition-transform duration-700" /> INICIAR EN 5 MIN
              </button>

              <div className="flex gap-3">
                <button 
                  onClick={handleInitiateProtocol} 
                  className="flex-1 py-4 border border-dezz-accent/50 text-dezz-accent hover:bg-dezz-accent hover:text-black transition font-mono tracking-widest text-xs uppercase flex items-center justify-center gap-2"
                >
                  <Play size={14} /> INICIAR YA
                </button>
                <button 
                  onClick={() => setPendingProtocol(null)} 
                  className="flex-1 py-4 border border-dezz-dim text-gray-600 hover:text-white transition font-mono tracking-widest text-xs uppercase"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTO-START INDICATOR */}
      {pendingProtocol?.autoStart && !isLocked && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[50] animate-in slide-in-from-top duration-500">
          <div className="bg-dezz-accent text-black px-6 py-2 font-mono font-bold text-xs tracking-widest flex items-center gap-3 rounded-full shadow-[0_0_20px_#00ff9b]">
            <Hourglass size={14} className="animate-spin duration-[3s]" />
            PROTOCOL AUTO-START QUEUED: {pendingProtocol.name} // 5:00
          </div>
        </div>
      )}

      {showBrain && (
        <BrainModal
          tasks={taskManager.tasks}
          onSelect={selectTaskFromBrain}
          onDelete={(id) => taskManager.deleteTask(id, showToast)}
          onClose={() => setShowBrain(false)}
          onCategoryChange={taskManager.updateTaskCategory}
          t={t}
        />
      )}

      {showClockOutModal && (
        <ClockOutModal
          sessionLog={sessionLog}
          setSessionLog={setSessionLog}
          markAsDone={markAsDone}
          setMarkAsDone={setMarkAsDone}
          onConfirm={confirmEndSession}
          onCancel={() => setShowClockOutModal(false)}
          focusFormatted={timer.focusFormatted}
          breakFormatted={timer.breakFormatted}
          breakCount={timer.breakCount}
          t={t}
        />
      )}

      {showStats && (
        <StatsModal
          session={auth.session}
          profile={profile}
          onClose={() => setShowStats(false)}
          t={t}
        />
      )}

      {showProtocols && (
        <ProtocolsModal
          protocols={protocolManager.protocols}
          onAdd={(p) => protocolManager.addProtocol(p)}
          onDelete={(id) => protocolManager.deleteProtocol(id)}
          onClose={() => setShowProtocols(false)}
          t={t}
        />
      )}

      {showProfile && (
        <ProfileView
          session={auth.session}
          profile={profile}
          updateProfile={updateProfile}
          onClose={() => setShowProfile(false)}
          t={t}
          showToast={showToast}
        />
      )}

      {showStandup && (
        <StandupModal
          session={auth.session}
          onClose={() => setShowStandup(false)}
          t={t}
        />
      )}
    </div>
  );
}

export default App;
