import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar({ setView, view, session, dark, setDark, onAuthClick, selectedPro, onBackToExplorer, setSession }) {
  const [isOpen, setIsOpen] = useState(false);

  // --- NOUVELLE FONCTION DE DÉCONNEXION SÉCURISÉE ---
  const handleSignOut = async () => {
    try {
      // On tente la déconnexion Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    } finally {
      // QUOI QU'IL ARRIVE : On nettoie l'interface
      if (setSession) setSession(null);
      setView('landing');
      setIsOpen(false);
      
      // Nettoyage radical pour éviter les erreurs de token (403)
      localStorage.clear();
      
      // On force le rafraîchissement vers l'accueil pour réinitialiser l'état propre
      window.location.href = "/";
    }
  };

  const userRole = session?.user?.user_metadata?.role || session?.user?.role;
  const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];

  const glassClass = dark ? 'bg-black/80 border-white/10' : 'bg-white/90 border-black/10 shadow-sm';
  const linkClass = "relative py-1 transition-all duration-300 hover:text-[#bc13fe] tracking-widest font-black uppercase text-[12px]";
  const activeLine = "absolute -bottom-1 left-0 w-full h-[3px] bg-[#bc13fe] animate-in slide-in-from-left-2 duration-500";

  return (
    <nav className={`fixed top-0 left-0 w-full z-[2000] px-6 py-4 md:px-10 md:py-6 flex justify-between items-center italic transition-all duration-500 backdrop-blur-2xl border-b ${glassClass} ${dark ? 'text-white' : 'text-black'}`}>
      
      {selectedPro ? (
        <div className="flex items-center justify-between w-full animate-in fade-in duration-500">
          <div className="logo-font text-[16px] md:text-[20px] font-black tracking-[0.4em] uppercase opacity-30">
            DetailPlan
          </div>
          <button 
            onClick={onBackToExplorer}
            className="flex items-center gap-3 px-8 py-3 rounded-full border-2 border-[#bc13fe] text-[#bc13fe] text-[11px] tracking-widest uppercase font-black hover:bg-[#bc13fe] hover:text-white transition-all shadow-[0_0_20px_rgba(188,19,254,0.2)]"
          >
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Retour_Explorer</span>
          </button>
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
              className={`${linkClass} hover:text-[#00f2ff] ${view === 'pricing' ? 'text-[#00f2ff]' : 'opacity-60'}`}
            >
              VOUS ÊTES PRO ?
              {view === 'pricing' && <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#00f2ff]"></div>}
            </button>

            {session && (
              <button 
                onClick={() => setView(userRole === 'pro' ? 'dashboard' : 'mes-reservations')} 
                className={`ml-4 px-8 py-3 border-2 rounded-2xl transition-all font-black text-[11px] tracking-widest
                  ${view === 'dashboard' || view === 'mes-reservations' 
                    ? 'bg-[#bc13fe] border-[#bc13fe] text-white shadow-[0_10px_20px_rgba(188,19,254,0.3)]' 
                    : 'border-[#bc13fe] text-[#bc13fe] hover:bg-[#bc13fe] hover:text-white'}
                `}
              >
                {userRole === 'pro' ? 'MON_ATELIER' : 'MES_MISSIONS'}
              </button>
            )}
          </div>

          {/* ACTIONS DROITE */}
          <div className="hidden lg:flex items-center gap-6">
            {session ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setView('profil')}
                  className={`flex items-center gap-5 px-6 py-3 rounded-2xl border-2 transition-all hover:border-[#00f2ff] group ${dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}
                >
                  <span className="text-[11px] font-black tracking-widest group-hover:text-[#00f2ff] transition-colors">{displayName.toUpperCase()}</span>
                  <div className="h-8 w-8 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20 group-hover:rotate-12 transition-transform">
                    <i className="fas fa-user-gear text-[12px]"></i>
                  </div>
                </button>

                <button 
                  onClick={handleSignOut} 
                  className="w-12 h-12 flex items-center justify-center rounded-2xl opacity-30 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all border-2 border-transparent hover:border-red-500/20"
                >
                  <i className="fas fa-power-off text-lg"></i>
                </button>
              </div>
            ) : (
              <button onClick={onAuthClick} className={`px-12 py-4 rounded-2xl text-[12px] font-black tracking-widest uppercase transition-all shadow-xl hover:scale-105 active:scale-95 ${dark ? 'bg-white text-black hover:bg-[#00f2ff]' : 'bg-black text-white hover:bg-[#bc13fe]'}`}>
                CONNEXION
              </button>
            )}
          </div>

          {/* BURGER MOBILE */}
          <button onClick={() => setIsOpen(!isOpen)} className="flex lg:hidden flex-col gap-1.5 z-[2100] relative p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className={`w-8 h-[3px] bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2 text-[#00f2ff]' : ''}`}></span>
            <span className={`w-5 h-[3px] bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-8 h-[3px] bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2 text-[#00f2ff]' : ''}`}></span>
          </button>


          {/* MENU OVERLAY MOBILE */}
          <div className={`fixed inset-0 h-screen w-screen bg-[#050505] z-[2050] flex flex-col items-center justify-between py-24 transition-all duration-500 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#bc13fe]/10 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-10 text-center">
              <button onClick={() => { setView('landing'); setIsOpen(false); }} className="text-5xl font-black italic tracking-tighter text-white active:text-[#00f2ff]">ACCUEIL</button>
              <button onClick={() => { setView('explorer'); setIsOpen(false); }} className="text-5xl font-black italic tracking-tighter text-white active:text-[#00f2ff]">EXPLORER</button>
              <button onClick={() => { setView('pricing'); setIsOpen(false); }} className="text-5xl font-black italic tracking-tighter text-[#00f2ff]">TARIFS</button>
              {session && (
                 <button onClick={() => { setView(userRole === 'pro' ? 'dashboard' : 'mes-reservations'); setIsOpen(false); }} className="text-5xl font-black italic tracking-tighter text-[#bc13fe]">
                   {userRole === 'pro' ? 'ATELIER' : 'MISSIONS'}
                 </button>
              )}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 w-full px-12">
               {session && (
                  <button onClick={() => { setView('profil'); setIsOpen(false); }} className="text-white/40 text-[10px] tracking-[0.5em] mb-4 uppercase underline underline-offset-8">Réglages_Profil</button>
               )}
              {session ? (
                <button onClick={handleSignOut} className="text-[11px] text-red-500 font-black tracking-[0.3em] uppercase py-5 w-full border border-red-500/30 rounded-2xl bg-red-500/5">DÉCONNEXION</button>
              ) : (
                <button onClick={() => { onAuthClick(); setIsOpen(false); }} className="px-10 py-6 bg-[#bc13fe] text-white rounded-2xl text-[11px] font-black tracking-[0.3em] shadow-2xl w-full">ACCÈS_PLATEFORME</button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}