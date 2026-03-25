import React from 'react';
import { Eye, EyeOff, Loader2, Zap, BarChart3, ShieldCheck, Database, Play, CheckCircle2, ChevronDown } from 'lucide-react';

export default function AuthView({ authView, setAuthView, loading, showPassword, setShowPassword, handleAuth, showToast }) {

  const features = [
    {
      icon: <Zap className="text-dezz-accent" size={20} />,
      title: "FOCUS PROTOCOLS",
      desc: "Automated work shifts with proactive T-minus 5m initiation."
    },
    {
      icon: <BarChart3 className="text-dezz-accent" size={20} />,
      title: "DEEP ANALYTICS",
      desc: "Daily Stand-up reports & visual productivity heatmaps."
    },
    {
      icon: <ShieldCheck className="text-dezz-accent" size={20} />,
      title: "PULSE CHECKS",
      desc: "Anti-idle system that monitors presence and auto-pauses."
    },
    {
      icon: <Database className="text-dezz-accent" size={20} />,
      title: "KNOWLEDGE BRAIN",
      desc: "Categorized archive of tasks and session-specific logic."
    }
  ];

  return (
    <div className="min-h-screen bg-dezz-bg text-white font-mono selection:bg-dezz-accent selection:text-black">

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-dezz-accent/5 to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">

        {/* LEFT SIDE: LANDING / INFO */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 py-12 lg:py-0">
          <div className="max-w-xl animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-dezz-accent/30 rounded-full mb-6 bg-dezz-accent/5">
              <span className="w-2 h-2 bg-dezz-accent rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-dezz-accent">SYSTEM v1.1.0 STABLE</span>
            </div>

            <h1 className="font-space font-black text-5xl lg:text-7xl mb-4 leading-none tracking-tighter">
              DEZZ<span className="text-dezz-accent">LOCK</span>
            </h1>
            <p className="text-xl text-gray-400 font-space mb-10 leading-relaxed max-w-md">
              The ultimate <span className="text-white border-b border-dezz-accent">Polymath Focus System</span>.
              Designed for architects of code, music, and complex logic.
            </p>

            {/* VIDEO SECTION: Styled YouTube Embed */}
            <div className="relative w-full aspect-video bg-black border border-dezz-dim rounded-sm overflow-hidden mb-12 shadow-[0_0_30px_rgba(0,255,155,0.05)] group hover:border-dezz-accent/50 transition-all duration-700">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dezz-accent/20 to-transparent"></div>
              
              <iframe 
                src="https://www.youtube.com/embed/9rUJdIjWowQ?si=UA_WeTasAVpyn4Bc&modestbranding=1&rel=0&iv_load_policy=3" 
                title="dezzLock System Overview" 
                className="w-full h-full border-none opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />

              {/* HUD corner accents for the video */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-dezz-accent/30 pointer-events-none"></div>
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-dezz-accent/30 pointer-events-none"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-dezz-accent/30 pointer-events-none"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-dezz-accent/30 pointer-events-none"></div>
            </div>

            {/* FEATURES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="shrink-0 w-10 h-10 border border-dezz-dim group-hover:border-dezz-accent/50 flex items-center justify-center bg-dezz-surface transition duration-300">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold mb-1 tracking-widest text-white">{f.title}</h4>
                    <p className="text-[10px] text-gray-500 leading-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: AUTH FORM */}
        <div className="lg:w-[450px] bg-dezz-surface/80 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-dezz-dim flex flex-col justify-center p-8 lg:p-12 relative">

          {/* Top right indicator */}
          <div className="absolute top-8 right-8 text-right hidden lg:block">
            <p className="text-[9px] text-gray-600 font-mono">CONNECTION: ENCRYPTED</p>
            <p className="text-[9px] text-gray-600 font-mono">LOCATION: GLOBAL_EDGE</p>
          </div>

          <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
            <form onSubmit={(e) => handleAuth(e, showToast)} className="flex flex-col">
              <h2 className="font-space text-3xl font-bold mb-1 text-white tracking-tight">
                {authView === 'login' ? 'WELCOME BACK' : 'INITIALIZE ID'}
              </h2>
              <p className="font-mono text-[10px] text-dezz-accent/60 mb-8 uppercase tracking-[0.2em]">
                {authView === 'login' && 'Identity verification required'}
                {authView === 'register' && 'Sector 01 enrollment'}
                {authView === 'recovery' && 'Encrypted link sequence'}
                {authView === 'update_password' && 'Override current passphrase'}
              </p>

              <div className="space-y-4">
                {authView !== 'update_password' && (
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 tracking-widest pl-1 font-bold">CORE_ADDRESS</label>
                    <input id="email" type="email" placeholder="USER@DOMAIN.COM" required
                      className="w-full bg-dezz-bg/50 p-4 border border-dezz-dim text-white outline-none focus:border-dezz-accent font-mono text-sm transition-all focus:bg-dezz-bg" />
                  </div>
                )}

                {authView !== 'recovery' && (
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 tracking-widest pl-1 font-bold">ACCESS_PHRASE</label>
                    <div className="relative group">
                      <input
                        id="pass"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        className="w-full bg-dezz-bg/50 p-4 border border-dezz-dim text-white outline-none focus:border-dezz-accent font-mono text-sm pr-12 transition-all focus:bg-dezz-bg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-dezz-accent transition focus:outline-none"
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-8 w-full font-space font-black py-5 transition text-md tracking-[0.2em] uppercase flex justify-center items-center gap-3 active:scale-[0.98] ${loading
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                    : 'bg-white text-black hover:bg-dezz-accent shadow-[0_4px_20px_#00ff9b22] hover:shadow-[0_4px_30px_#00ff9b55]'
                  }`}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    {authView === 'login' && 'ACCESS SYSTEM'}
                    {authView === 'register' && 'GENERATE ACCOUNT'}
                    {authView === 'recovery' && 'SEND RECOVERY'}
                    {authView === 'update_password' && 'UPDATE PASS'}
                  </>
                )}
              </button>

              <div className="mt-8 flex justify-between items-center w-full text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                {authView === 'login' ? (
                  <>
                    <button type="button" onClick={() => setAuthView('register')} className="hover:text-dezz-accent transition border-b border-transparent hover:border-dezz-accent pb-1">Create Account</button>
                    <button type="button" onClick={() => setAuthView('recovery')} className="hover:text-white transition">Lost Passphrase?</button>
                  </>
                ) : (
                  <button type="button" onClick={() => setAuthView('login')} className="hover:text-dezz-accent w-full text-center transition">Return to Control Center</button>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-12 pt-8 border-t border-dezz-dim/30 flex items-center justify-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-dezz-accent/40" />
                  <span className="text-[9px] tracking-tighter">SECURED BY SUPABASE CLOUD</span>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-auto pt-8 text-center lg:text-left">
            <p className="text-[10px] text-gray-700 tracking-[0.3em] font-mono">
              DEZZLOCK_PROTOCOLS // SYNC_STATUS: <span className="text-green-900">PENDING_AUTH</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
