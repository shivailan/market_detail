import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar({ setView, view, session, dark, setDark, onAuthClick, selectedPro, onBackToExplorer, setSession }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    } finally {
      if (setSession) setSession(null);
      setView('landing');
      setIsOpen(false);
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const userRole = session?.user?.user_metadata?.role || session?.user?.role;
  const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];

  // Couleurs adaptatives
  const glassClass = dark ? 'bg-black/80 border-white/10' : 'bg-white/90 border-black/5 shadow-sm';
  const linkClass = `relative py-1 transition-all duration-300 hover:text-[#bc13fe] tracking-widest font-black uppercase text-[11px] ${dark ? 'text-white' : 'text-slate-600'}`;
  const activeLine = "absolute -bottom-1 left-0 w-full h-[3px] bg-[#bc13fe] animate-in slide-in-from-left-2 duration-500";

  return (
    <nav className={`fixed top-0 left-0 w-full z-[2000] px-6 py-4 md:px-10 md:py-6 flex justify-between items-center italic transition-all duration-500 backdrop-blur-2xl border-b ${glassClass} ${dark ? 'text-white' : 'text-slate-900'}`}>
      
      {selectedPro ? (
        <div className="flex items-center justify-between w-full animate-in fade-in duration-500">
          <div className="logo-font text-[14px] md:text-[20px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase opacity-40 truncate pr-4">
            DetailPlan
          </div>

          <div className="flex items-center gap-4">
            {/* SWITCH MODE DANS LE PROFIL PRO */}
            <button 
              onClick={() => setDark(!dark)}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${dark ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-black/5 border-black/10 text-indigo-600'}`}
            >
              <i className={`fas ${dark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            <button 
              onClick={onBackToExplorer}
              className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-3 rounded-full border-2 border-[#bc13fe] text-[#bc13fe] text-[10px] md:text-[11px] tracking-widest uppercase font-black hover:bg-[#bc13fe] hover:text-white transition-all shadow-lg shrink-0"
            >
              <i className="fas fa-arrow-left text-[10px]"></i>
              <span className="hidden md:inline">Retour_Explorer</span>
              <span className="md:hidden">RETOUR</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* LOGO */}
          <div 
            className="logo-font text-[18px] md:text-[22px] font-black tracking-[0.4em] uppercase cursor-pointer hover:scale-105 transition-transform z-[2100]" 
            onClick={() => { setView('landing'); setIsOpen(false); }}
          >
            Detail<span className="text-[#bc13fe]">Plan</span>
          </div>
          
          {/* NAVIGATION DESKTOP */}
          <div className="hidden lg:flex gap-14 items-center">
            <button onClick={() => setView('landing')} className={linkClass}>
              Accueil
              {view === 'landing' && <div className={activeLine}></div>}
            </button>
            <button onClick={() => setView('explorer')} className={linkClass}>
              TROUVER MON EXPERT
              {view === 'explorer' && <div className={activeLine}></div>}
            </button>
            <button 
              onClick={() => setView('pricing')} 
              className={`${linkClass} ${view === 'pricing' ? 'text-[#00f2ff]' : 'opacity-60'}`}
            >
              VOUS ÊTES PRO ?
              {view === 'pricing' && <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#00f2ff]"></div>}
            </button>

            {session && (
              <button 
                onClick={() => setView(userRole === 'pro' ? 'dashboard' : 'mes-reservations')} 
                className={`ml-4 px-8 py-3 border-2 rounded-2xl transition-all font-black text-[10px] tracking-widest
                  ${view === 'dashboard' || view === 'mes-reservations' 
                    ? 'bg-[#bc13fe] border-[#bc13fe] text-white shadow-lg' 
                    : 'border-[#bc13fe] text-[#bc13fe] hover:bg-[#bc13fe] hover:text-white'}
                `}
              >
                {userRole === 'pro' ? 'MON_ATELIER' : 'MES_MISSIONS'}
              </button>
            )}
          </div>

          {/* ACTIONS DROITE */}
          <div className="flex items-center gap-3 md:gap-6">
            
            {/* SWITCH MODE GLOBAL */}
            <button 
              onClick={() => setDark(!dark)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${dark ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-black/5 border-black/10 text-indigo-600 hover:bg-black/10'}`}
            >
              <i className={`fas ${dark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            <div className="hidden lg:flex items-center gap-6">
              {session ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setView('profil')}
                    className={`flex items-center gap-5 px-6 py-3 rounded-2xl border-2 transition-all hover:border-[#00f2ff] group ${dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}
                  >
                    <span className="text-[11px] font-black tracking-widest uppercase">{displayName}</span>
                    <div className="h-8 w-8 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
                      <i className="fas fa-user-gear text-[12px]"></i>
                    </div>
                  </button>
                  <button onClick={handleSignOut} className="w-12 h-12 flex items-center justify-center rounded-2xl opacity-30 hover:opacity-100 text-red-500 transition-all border border-transparent hover:border-red-500/20">
                    <i className="fas fa-power-off text-lg"></i>
                  </button>
                </div>
              ) : (
                <button onClick={onAuthClick} className={`px-10 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all shadow-xl hover:scale-105 active:scale-95 ${dark ? 'bg-white text-black hover:bg-[#00f2ff]' : 'bg-black text-white hover:bg-[#bc13fe]'}`}>
                  CONNEXION
                </button>
              )}
            </div>

            {/* BURGER MOBILE */}
            <button onClick={() => setIsOpen(!isOpen)} className={`flex lg:hidden flex-col gap-1.5 z-[2100] relative p-4 rounded-2xl transition-all ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <span className={`w-6 h-[2px] bg-current transition-all ${isOpen ? 'rotate-45 translate-y-2 text-[#00f2ff]' : ''}`}></span>
              <span className={`w-4 h-[2px] bg-current transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-6 h-[2px] bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-2 text-[#00f2ff]' : ''}`}></span>
            </button>
          </div>

          {/* MENU MOBILE OVERLAY */}
          <div className={`fixed inset-0 h-screen w-screen transition-all duration-500 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} ${dark ? 'bg-[#050505]' : 'bg-slate-50'}`}>
            <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 ${dark ? 'bg-[#bc13fe]/10' : 'bg-[#bc13fe]/5'} blur-[120px] rounded-full pointer-events-none`}></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-10 text-center px-6">
              <button onClick={() => { setView('landing'); setIsOpen(false); }} className={`text-4xl font-black italic tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>ACCUEIL</button>
              <button onClick={() => { setView('explorer'); setIsOpen(false); }} className={`text-4xl font-black italic tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>EXPLORER</button>
              <button onClick={() => { setView('pricing'); setIsOpen(false); }} className="text-4xl font-black italic tracking-tighter text-[#00f2ff]">TARIFS</button>
              
              {session && (
                 <button onClick={() => { setView(userRole === 'pro' ? 'dashboard' : 'mes-reservations'); setIsOpen(false); }} className="text-4xl font-black italic tracking-tighter text-[#bc13fe]">
                   {userRole === 'pro' ? 'ATELIER' : 'MISSIONS'}
                 </button>
              )}

              <div className="w-full h-[1px] bg-current opacity-10 my-4"></div>

              {session ? (
                <>
                  <button onClick={() => { setView('profil'); setIsOpen(false); }} className={`text-sm font-black italic tracking-widest ${dark ? 'text-white/40' : 'text-slate-400'}`}>MON_PROFIL</button>
                  <button onClick={handleSignOut} className="w-full py-6 rounded-2xl border border-red-500/30 text-red-500 font-black italic tracking-[0.2em]">DÉCONNEXION</button>
                </>
              ) : (
                <button onClick={() => { onAuthClick(); setIsOpen(false); }} className="w-full py-6 bg-[#bc13fe] text-white rounded-2xl font-black italic tracking-[0.2em] shadow-xl">ACCÈS_PLATEFORME</button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}