import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

// === TEXTOS & TRADUCCIONES ===
const dict = {
  en: {
    subtitle: "POLYMATH FOCUS SYSTEM",
    projLabel: "PROJECT / MISSION",
    descLabel: "SYSTEM INSTRUCTIONS (KNOWLEDGE)",
    addInst: "Add instruction (+)",
    placeholderInst: "e.g., Don't touch CSS, focus on Logic...",
    startBtn: "INITIATE LOCK_IN",
    workingOn: "CURRENTLY EXECUTING:",
    timeElapsed: "SESSION TIME",
    finishBtn: "CLOCK OUT / COMPLETE",
    placeholderProj: "Select or type project...",
    emptyError: "SYSTEM ERROR: DEFINE PARAMETERS FIRST",
    logLabel: "SESSION LOG / SUMMARY",
    logPlaceholder: "What did you accomplish? (Commits, fixes...)",
    statsTitle: "PERFORMANCE ANALYTICS",
    confirmEnd: "TERMINATE & SAVE SESSION",
    totalTime: "TOTAL FOCUS TIME",
    cancel: "CANCEL",
    save: "SAVE",
    
  },
  es: {
    subtitle: "SISTEMA DE ENFOQUE POLÍMATA",
    projLabel: "PROYECTO / MISIÓN",
    descLabel: "INSTRUCCIONES DEL SISTEMA (KNOWLEDGE)",
    addInst: "Agregar instrucción (+)",
    placeholderInst: "ej. No tocar CSS, solo Lógica...",
    startBtn: "INICIAR LOCK_IN",
    workingOn: "EJECUTANDO ACTUALMENTE:",
    timeElapsed: "TIEMPO DE SESIÓN",
    finishBtn: "FINALIZAR / CLOCK OUT",
    placeholderProj: "Selecciona o escribe proyecto...",
    emptyError: "ERROR DE SISTEMA: DEFINE PARÁMETROS",
    logLabel: "RESUMEN DE SESIÓN",
    logPlaceholder: "¿Qué lograste? (Commits, cambios...)",
    statsTitle: "ANALÍTICA DE RENDIMIENTO",
    confirmEnd: "TERMINAR Y GUARDAR",
    totalTime: "TIEMPO TOTAL DE ENFOQUE",
    cancel: "CANCELAR",
    save: "GUARDAR",
  
  }
};

function App() {
  // AUTH SYSTEM
  const handleAuth = async (e) => {
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

  // === STATE MANAGEMENT ===
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([]) 
  const [authView, setAuthView] = useState('login');
  const [showBrain, setShowBrain] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });
  const [currentTaskId, setCurrentTaskId] = useState(null); 
  const [sessionLog, setSessionLog] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [history, setHistory] = useState([]);
  const [markAsDone, setMarkAsDone] = useState(false);

  const showToast = (msg, type = 'info') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const killTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id));
      showToast('KNOWLEDGE NODE DELETED', 'warn');
    }
  };

  const selectTaskFromBrain = (task) => {
    setProject(task.title);
    setCurrentTaskId(task.id);
    setInstructions(task.description ? [task.description] : []); 
    setShowBrain(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTasks();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      }
      setSession(session);
      if (session) fetchTasks();
    });

    const savedState = JSON.parse(localStorage.getItem('dezzSession'));
    if (savedState) {
      setProject(savedState.project);
      setInstructions(savedState.instructions);
      setStartTime(savedState.startTime);
      setIsLocked(true); 
    }

    return () => subscription.unsubscribe();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (data) setTasks(data)
  }

  
  const [lang, setLang] = useState('en'); // 'en' | 'es'
  const [isLocked, setIsLocked] = useState(false);
  
  const [project, setProject] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [instructions, setInstructions] = useState([]); 
  
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(null);

  const t = dict[lang];

  useEffect(() => {
    let interval = null;
    if (isLocked) {
      interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLocked]);

  const addInstruction = () => {
    if (!currentInstruction.trim()) return;
    setInstructions([...instructions, currentInstruction]);
    setCurrentInstruction('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addInstruction();
  };

  const deleteInstruction = (index) => {
    const newIns = [...instructions];
    newIns.splice(index, 1);
    setInstructions(newIns);
  };

  const handleLockIn = async () => {
    if (!project.trim() || project === 'NEW_FLOW') {
      showToast(t.emptyError, 'warn');
      return;
    }

    let finalTaskId = currentTaskId;
    if (!finalTaskId) {
      finalTaskId = await saveToBrain(project);
      setCurrentTaskId(finalTaskId);
    }

    const start = Date.now();
    setStartTime(start);
    setNow(start);
    setIsLocked(true);
    
    localStorage.setItem('dezzSession', JSON.stringify({
      project,
      currentTaskId: finalTaskId,
      instructions,
      startTime: start
    }));
  };

  const handleClockOut = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const confirmed = window.confirm(lang === 'en' ? "Terminate Session & Save?" : "¿Terminar y Guardar?");
    
    if (confirmed) {
      const { error } = await supabase.from('sessions').insert({
        user_id: session.user.id,
        log_notes: `Project: ${project} // Duration: ${duration}s`, 
        start_time: new Date(startTime).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: duration
      });

      if (error) console.error('Error saving session:', error);

      setIsLocked(false);
      setInstructions([]);
      setProject('');
      localStorage.removeItem('dezzSession'); 
    }
  };

  const loadStats = async () => {
    setShowStats(true);
    const { data } = await supabase
      .from('sessions')
      .select(`
        *,
        tasks ( title )
      `)
      .order('end_time', { ascending: false })
      .limit(20);
    
    if (data) setHistory(data);
  };

  const formatTime = (start, current) => {
    if (!start || !current) return "00:00:00";
    const diff = Math.floor((current - start) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const confirmEndSession = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    const { error } = await supabase.from('sessions').insert({
      user_id: session.user.id,
      task_id: currentTaskId, 
      log_notes: sessionLog,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: duration
    });

    if (markAsDone && currentTaskId) {
       await supabase.from('tasks')
         .update({ status: 'done' })
         .eq('id', currentTaskId);
       
       setTasks(tasks.map(t => t.id === currentTaskId ? { ...t, status: 'done' } : t));
    }

    if (error) {
      console.error(error);
      showToast("SAVE FAILED", "warn");
    } else {
      showToast("SESSION SAVED", "success");
    }

    setIsLocked(false);
    setShowClockOutModal(false);
    setInstructions([]);
    setProject('');
    setCurrentTaskId(null);
    setSessionLog('');
    setMarkAsDone(false); 
    localStorage.removeItem('dezzSession');
  };

  // === VISTA DE ACCESO ===
  if (!session) {
    return (
      <div className="min-h-screen bg-dezz-bg flex items-center justify-center p-4 relative overflow-hidden select-none">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

        {/* FORM */}
        <form 
           onSubmit={handleAuth}
           className="z-10 w-full max-w-sm flex flex-col items-center bg-dezz-surface border border-dezz-accent/20 p-8 shadow-2xl animate-fade-in-up"
        >
          <h2 className="font-space text-2xl mb-1 text-white tracking-tight">
            DEZZ<span className="text-dezz-accent">LOCK</span> ACCESS
          </h2>
          <p className="font-mono text-[10px] text-gray-500 mb-6 uppercase tracking-[0.2em]">
            {authView === 'login' && 'IDENTIFY YOURSELF'}
            {authView === 'register' && 'INIT NEW USER'}
            {authView === 'recovery' && 'RECOVERY MODE'}
            {authView === 'update_password' && 'SECURE NEW PASSWORD'}
          </p>
          
          {authView !== 'update_password' && (
             <input id="email" type="email" placeholder="EMAIL ADDRESS" required className="w-full bg-dezz-bg p-3 border border-dezz-dim text-white outline-none focus:border-dezz-accent font-mono text-xs mb-3"/>
          )}
          
          {authView !== 'recovery' && (
             <div className="relative w-full mb-3 group">
               <input 
                 id="pass" 
                 type={showPassword ? "text" : "password"} 
                 placeholder={authView === 'update_password' ? "NEW PASSWORD" : "PASSPHRASE"} 
                 required 
                 className="w-full bg-dezz-bg p-3 border border-dezz-dim text-white outline-none focus:border-dezz-accent font-mono text-xs pr-10 transition-colors"
               />
               
               <button
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-dezz-accent transition focus:outline-none"
                 tabIndex="-1" 
               >
                 <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
               </button>
             </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-black font-bold py-3 transition text-xs tracking-[0.2em] mb-4 uppercase flex justify-center items-center gap-2 ${loading ? 'bg-gray-600 cursor-not-allowed text-white' : 'bg-dezz-accent hover:bg-white'}`}
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (
                <>
                    {authView === 'login' && 'LOGIN'}
                    {authView === 'register' && 'CREATE ACCOUNT'}
                    {authView === 'recovery' && 'SEND LINK'}
                    {authView === 'update_password' && 'SAVE'}
                </>
            )}
          </button>

          <div className="flex justify-between w-full text-[10px] font-mono text-gray-500 uppercase tracking-widest cursor-pointer">
             {authView === 'login' ? (
                <>
                  <span onClick={() => setAuthView('register')} className="hover:text-dezz-accent">CREATE ID</span>
                  <span onClick={() => setAuthView('recovery')} className="hover:text-white">LOST PASS?</span>
                </>
             ) : (
                <span onClick={() => setAuthView('login')} className="hover:text-dezz-accent w-full text-center">BACK TO LOGIN</span>
             )}
          </div>
        </form>
      </div>
    );
  }

  // === VISTA PRINCIPAL (UI) ===
  return (

    <div className="w-screen h-screen bg-dezz-bg text-gray-200 font-mono flex flex-col items-center justify-between overflow-hidden relative">
      
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
          style={{backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      </div>

      {/* HEADER */}
      <header className="w-full max-w-4xl p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-dezz-accent rounded-full animate-pulse shadow-[0_0_10px_#00ff9b]"></div>
            <h1 className="font-space font-bold text-2xl tracking-tighter">
              dezz<span className="text-dezz-accent">Lock</span>
            </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 text-sm font-bold text-dezz-accent/50 cursor-pointer select-none">
          {/* IDENTITY MODULE */}
          <div className="flex items-center gap-2 pr-2 md:pr-4 border-r border-dezz-accent/20">
            <i className="fa-solid fa-id-badge text-dezz-dim"></i>
            <span className="hidden sm:block font-mono text-[10px] text-gray-400 uppercase tracking-widest hover:text-white transition">
               {session.user.email.split('@')[0]}
            </span>
          </div>

          {/* STATS BUTTON */}
          <button onClick={loadStats} className="mr-2 text-xs font-mono text-gray-500 hover:text-dezz-accent transition uppercase tracking-widest" title="VIEW STATS">
            <span className="hidden sm:inline">[ VIEW_STATS ]</span>
            <span className="sm:hidden"><i className="fa-solid fa-chart-line"></i></span>
          </button>

          {/* LOGOUT BUTTON */}
          <button 
            onClick={async () => { await supabase.auth.signOut(); setSession(null); }}
            className="hover:text-red-500 text-xs font-mono mr-2 transition-colors uppercase tracking-widest"
            title="LOGOUT"
          >
             <i className="fa-solid fa-power-off"></i>
          </button>

          {/* LANGUAGE */}
          <div className="flex gap-1 text-[10px] md:text-xs">
            <span onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-dezz-accent' : 'hover:text-white transition'}`}>EN</span>
            <span className="text-dezz-surface">|</span>
            <span onClick={() => setLang('es')} className={`${lang === 'es' ? 'text-dezz-accent' : 'hover:text-white transition'}`}>ES</span>
          </div>
        </div>

      </header>

      {/* MAIN CONTAINER */}
      <main className="z-10 w-full max-w-2xl flex-grow flex flex-col justify-center p-6">
        
        {/* === VISTA: CONFIGURACIÓN (IDLE) === */}
        {!isLocked && (
          <div className="flex flex-col gap-8 animate-fade-in-up">
            <div className="text-center mb-6">
              <h2 className="font-space text-4xl font-bold text-white mb-2 uppercase">{t.startBtn}</h2>
              <p className="text-gray-500 text-sm tracking-widest uppercase border-b border-dezz-accent/20 pb-4 inline-block px-10">
                {t.subtitle}
              </p>
            </div>

            {/* SMART PROJECT INPUT */}
            <div className="bg-dezz-surface border border-dezz-surface p-6 rounded-sm shadow-xl focus-within:border-dezz-accent/50 transition duration-300 relative group">
              <label className="block text-dezz-accent text-xs font-bold mb-3 tracking-widest flex justify-between items-center">
                <span>{t.projLabel}</span>
                <button 
                  onClick={() => setShowBrain(true)} 
                  className="text-[10px] text-gray-500 hover:text-white flex items-center gap-2 transition"
                  title="OPEN TASK ARCHIVE"
                >
                  <i className="fa-solid fa-database"></i> ACCESS ARCHIVE
                </button>
              </label>
              
              <div className="flex gap-2 items-center">
                 <input 
                  type="text" 
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder={t.placeholderProj}
                  className="w-full bg-transparent text-xl text-white outline-none placeholder-gray-700 font-space font-bold"
                  list="brain-suggestions"
                />
                {tasks.some(t => t.title === project) && (
                   <i className="fa-solid fa-check-circle text-dezz-accent text-lg" title="KNOWN ENTITY"></i>
                )}
              </div>

              {/* Datalist for autocomplete */}
              <datalist id="brain-suggestions">
                {tasks.map(t => <option key={t.id} value={t.title} />)}
              </datalist>
            </div>

            {/* Instructions Input */}
            <div className="bg-dezz-surface border border-dezz-surface p-6 rounded-sm shadow-xl">
              <label className="block text-dezz-accent text-xs font-bold mb-3 tracking-widest uppercase flex justify-between">
                <span>{t.descLabel}</span>
                <span className="text-xs text-gray-600">{instructions.length} IN STACK</span>
              </label>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={currentInstruction}
                  onChange={(e) => setCurrentInstruction(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t.placeholderInst}
                  className="w-full bg-dezz-bg/50 text-white p-3 rounded-sm border border-transparent focus:border-dezz-accent/30 outline-none text-sm transition"
                />
                <button 
                  onClick={addInstruction}
                  className="bg-dezz-accent text-dezz-bg font-bold px-4 rounded-sm hover:bg-white hover:scale-105 transition duration-200"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>

              {/* Instruction Tags Display */}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {instructions.map((inst, idx) => (
                  <div key={idx} className="group flex justify-between items-center bg-dezz-bg p-3 border-l-2 border-dezz-accent/20 hover:border-dezz-accent transition-all">
                    <span className="text-sm text-gray-300 font-medium font-mono">
                      <span className="text-dezz-accent mr-2">{'>'}</span> {inst}
                    </span>
                    <button onClick={() => deleteInstruction(idx)} className="text-red-500 opacity-0 group-hover:opacity-100 hover:text-white transition">
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                ))}
                {instructions.length === 0 && (
                   <div className="text-gray-700 text-xs italic text-center py-2 opacity-50">Empty Buffer</div>
                )}
              </div>
            </div>

            {/* BIG TRIGGER BUTTON */}
            <button 
              onClick={handleLockIn}
              className="mt-4 bg-white text-black font-space font-black text-xl py-5 hover:bg-dezz-accent hover:shadow-[0_0_20px_#00ff9b66] transition-all transform active:scale-95 tracking-widest uppercase"
            >
              <i className="fa-solid fa-lock mr-3"></i> {t.startBtn}
            </button>
          </div>
        )}

        {/* === VISTA: LOCKED IN === */}
        {isLocked && (
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-700">
            
            {/* Project Indicator */}
            <div className="mb-10 text-center">
              <h3 className="text-dezz-accent text-xs tracking-[0.3em] font-bold uppercase mb-2">{t.workingOn}</h3>
              <h2 className="text-white text-5xl font-space font-bold uppercase tracking-tight relative inline-block">
                {project}
                <div className="absolute -right-6 -top-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </div>
              </h2>
            </div>

            {/* THE CLOCK */}
            <div className="mb-12 font-mono text-7xl md:text-9xl font-thin text-white tabular-nums tracking-tighter opacity-90 select-none">
              {formatTime(startTime, now)}
            </div>

            {/* Active Instructions List */}
            <div className="w-full max-w-lg mb-12">
               {instructions.length > 0 ? (
                 <div className="flex flex-col gap-3">
                   {instructions.map((inst, idx) => (
                      <div key={idx} className="bg-dezz-surface/50 border border-dezz-dim p-4 flex items-start gap-3 rounded-sm">
                        <i className="fa-solid fa-check-circle text-dezz-accent mt-1"></i>
                        <span className="text-gray-300 font-mono text-sm line-clamp-2 leading-relaxed">
                          {inst}
                        </span>
                      </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-gray-600 text-center uppercase tracking-widest text-xs">Pure Focus - No extra instructions</div>
               )}
            </div>

            {/* UNLOCK */}
            <button 
              onDoubleClick={() => setShowClockOutModal(true)}
              className="group flex flex-col items-center text-gray-500 hover:text-white transition duration-500 cursor-pointer mt-16"
            >
              <i className="fa-solid fa-power-off text-3xl mb-2 group-hover:text-red-500 transition duration-300"></i>
              <span className="text-[10px] tracking-widest uppercase group-hover:tracking-[0.2em] transition-all">
                Double Click to {t.finishBtn}
              </span>
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="z-10 w-full p-4 text-center text-[10px] text-gray-700 font-mono uppercase tracking-widest">
        SYSTEM ID: DEZZ_LOCK_V1.0 // <span className="text-dezz-accent">DEVELOPED BY <a href="https://dezz.cloud" target="_blank" rel="noopener noreferrer">dezzHub</a></span>
      </footer>

      {/* === COMPONENTE VISUAL: NOTIFICACIONES === */}
      <div className={`fixed top-6 right-6 z-[60] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-6 py-4 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] border-l-4 font-mono text-xs uppercase tracking-widest font-bold
          ${toast.type === 'warn' ? 'bg-[#2a0000] border-red-500 text-red-500' : 'bg-dezz-surface border-dezz-accent text-dezz-accent'}`}>
          <i className={`fa-solid ${toast.type === 'warn' ? 'fa-triangle-exclamation' : 'fa-check-square'}`}></i>
          {toast.msg}
        </div>
      </div>

      {/* === COMPONENTE VISUAL: BRAIN MANAGER MODAL === */}
      {showBrain && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-dezz-bg border border-dezz-dim w-full max-w-lg shadow-2xl rounded-sm flex flex-col max-h-[80vh]">
            {/* Header Modal */}
            <div className="p-4 border-b border-dezz-dim flex justify-between items-center bg-dezz-surface">
              <h3 className="font-space font-bold text-white text-lg tracking-tight">KNOWLEDGE BASE <span className="text-dezz-accent">ARCHIVE</span></h3>
              <button onClick={() => setShowBrain(false)} className="text-gray-500 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
            </div>
            
            {/* Body List */}
            <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <div key={task.id} className="group flex justify-between items-center p-4 border-b border-dezz-dim/30 hover:bg-dezz-surface/50 transition">
                    <div 
                      onClick={() => selectTaskFromBrain(task.title)}
                      className="cursor-pointer flex-1"
                    >
                      <h4 className="font-bold font-space text-white group-hover:text-dezz-accent transition">{task.title}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">{new Date(task.created_at).toLocaleDateString()} // STATUS: {task.status}</p>
                    </div>
                    <button onClick={() => killTask(task.id)} className="text-red-900 group-hover:text-red-500 transition px-2"><i className="fa-solid fa-trash"></i></button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-600 font-mono text-xs">NO DATA IN SECTOR 01</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === MODAL: CLOCK OUT CONFIRMATION === */}
      {showClockOutModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-dezz-surface border border-dezz-accent w-full max-w-md p-6 shadow-[0_0_50px_rgba(0,255,155,0.1)] rounded-sm">
            <h3 className="font-space font-bold text-2xl text-white mb-6 uppercase tracking-tight">
              SESSION <span className="text-dezz-accent">REPORT</span>
            </h3>
            
            <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">{t.logLabel}</label>
            <textarea 
              value={sessionLog}
              onChange={(e) => setSessionLog(e.target.value)}
              placeholder={t.logPlaceholder}
              className="w-full h-32 bg-dezz-bg text-white p-4 text-sm font-mono border border-dezz-dim focus:border-dezz-accent outline-none mb-6 resize-none"
              autoFocus
            />

            {/* CHECKBOX */}
            <div className="mb-6 flex items-center gap-3 bg-dezz-bg p-3 border border-dezz-dim hover:border-dezz-accent/50 cursor-pointer" onClick={() => setMarkAsDone(!markAsDone)}>
               <div className={`w-4 h-4 border ${markAsDone ? 'bg-dezz-accent border-dezz-accent' : 'border-gray-500'} flex items-center justify-center`}>
                  {markAsDone && <i className="fa-solid fa-check text-black text-[10px]"></i>}
               </div>
               <span className="text-xs text-gray-300 font-mono uppercase tracking-wide">
                 MARK PROJECT AS <span className={markAsDone ? "text-dezz-accent" : ""}>COMPLETED</span>
               </span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowClockOutModal(false)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition border border-transparent hover:border-gray-600">
                {t.cancel}
              </button>
              <button onClick={confirmEndSession} className="flex-1 py-4 bg-dezz-accent text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition shadow-lg shadow-dezz-accent/20">
                {t.confirmEnd}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL: STATS DASHBOARD === */}
      {showStats && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-3xl h-[80vh] bg-dezz-bg border border-dezz-dim rounded-sm flex flex-col shadow-2xl">
            <div className="p-6 border-b border-dezz-dim flex justify-between items-center bg-dezz-surface/50">
              <div>
                <h3 className="font-space font-bold text-xl text-white tracking-tight uppercase">{t.statsTitle}</h3>
                <p className="text-[10px] text-dezz-accent font-mono uppercase tracking-widest">LAST 20 SESSIONS</p>
              </div>
              <button onClick={() => setShowStats(false)} className="text-gray-500 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {history.map(sess => (
                   <div key={sess.id} className="bg-dezz-surface border border-dezz-dim p-4 hover:border-dezz-accent/50 transition group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-dezz-accent text-xs font-bold font-mono">
                          {Math.floor(sess.duration_seconds / 60)} MINS
                        </span>
                        <span className="text-[10px] text-gray-600 font-mono">
                          {new Date(sess.end_time).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white font-space leading-tight mb-2 truncate">
                        {sess.tasks?.title || "Unknown Task"}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono line-clamp-2 h-8">
                        {sess.log_notes || "No logs..."}
                      </p>
                   </div>
                 ))}
              </div>
              {history.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm uppercase">No Data Recorded Yet</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
