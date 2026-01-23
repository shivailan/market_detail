import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar({ setView, view, session, dark, setDark, onAuthClick, selectedPro, onBackToExplorer }) {
  const [isOpen, setIsOpen] = useState(false);

  const userRole = session?.user?.user_metadata?.role || session?.user?.role;
  const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];

  const glassClass = dark ? 'bg-black/40 border-white/10' : 'bg-white/40 border-black/10';

  return (
    <nav className={`fixed top-0 left-0 w-full z-[2000] p-6 md:p-8 lg:p-10 flex justify-between items-center font-black italic transition-all duration-500 backdrop-blur-xl border-b ${glassClass} ${dark ? 'text-white' : 'text-black'}`}>
      
      {selectedPro ? (
        <div className="flex items-center justify-between w-full animate-in fade-in duration-500">
          <div className="logo-font text-[14px] md:text-[16px] font-bold tracking-[0.6em] uppercase opacity-20">
            DetailPlan
          </div>
          <button 
            onClick={onBackToExplorer}
            className="flex items-center gap-3 px-6 py-3 rounded-full border border-[#bc13fe] text-[#bc13fe] text-[10px] tracking-widest uppercase hover:bg-[#bc13fe] hover:text-white transition-all shadow-[0_0_20px_rgba(188,19,254,0.2)]"
          >
            <i className="fas fa-arrow-left text-[8px]"></i>
            <span>Retour_Explorer</span>
          </button>
        </div>
      ) : (
        <>
          <div 
            className="logo-font text-[14px] md:text-[16px] font-bold tracking-[0.6em] md:tracking-[0.8em] uppercase cursor-pointer hover:scale-105 transition-transform z-[2100]" 
            onClick={() => { setView('landing'); setIsOpen(false); }}
          >
            DetailPlan
          </div>
          
          <div className="hidden lg:flex gap-10 text-[9px] uppercase tracking-[0.4em] items-center">
            <button onClick={() => setView('landing')} className={`hover:text-[#bc13fe] transition-colors ${view === 'landing' ? 'text-[#bc13fe]' : ''}`}>Accueil</button>
            <button onClick={() => setView('explorer')} className={`hover:text-[#bc13fe] transition-colors ${view === 'explorer' ? 'text-[#bc13fe]' : ''}`}>Explorer</button>
            
            <button 
              onClick={() => setView('pricing')} 
              className={`hover:text-[#00f2ff] transition-colors ${view === 'pricing' ? 'text-[#00f2ff]' : 'opacity-60'}`}
            >
              Tarifs_Pro
            </button>

            {session && (
              <button 
                onClick={() => setView(userRole === 'pro' ? 'dashboard' : 'mes-reservations')} 
                className={`px-4 py-1 border border-current/30 rounded-full transition-all 
                  ${view === 'dashboard' || view === 'mes-reservations' 
                    ? 'bg-[#bc13fe] border-[#bc13fe] text-white' 
                    : 'hover:border-[#bc13fe] hover:text-[#bc13fe]'}
                `}
              >
                {userRole === 'pro' ? 'Mon_Atelier' : 'Mes_Missions'}
              </button>
            )}
          </div>

          {/* ACTIONS DROITE (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            {session ? (
              <div className="flex items-center gap-4">
                {/* BLOC PROFIL CLIQUABLE */}
                <button 
                  onClick={() => setView('profil')}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all hover:border-[#00f2ff] group ${dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}
                >
                  <div className="relative h-2 w-2">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  </div>
                  <span className="text-[9px] tracking-[0.2em] group-hover:text-[#00f2ff] transition-colors">{displayName}</span>
                  <i className="fas fa-cog text-[8px] opacity-30 group-hover:rotate-90 transition-all"></i>
                </button>

                <button 
                  onClick={() => supabase.auth.signOut()} 
                  className="text-[14px] opacity-30 hover:opacity-100 hover:text-red-500 transition-all p-2"
                  title="Déconnexion"
                >
                  <i className="fas fa-power-off"></i>
                </button>
              </div>
            ) : (
              <button onClick={onAuthClick} className={`px-8 py-3 rounded-full text-[9px] font-black tracking-[0.3em] uppercase transition-all ${dark ? 'bg-white text-black' : 'bg-black text-white'}`}>Connexion</button>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="flex lg:hidden flex-col gap-1.5 z-[2100] relative p-2">
            <span className={`w-6 h-[2px] bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2 text-[#00f2ff]' : ''}`}></span>
            <span className={`w-6 h-[2px] bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-[2px] bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2 text-[#00f2ff]' : ''}`}></span>
          </button>

          {/* MENU OVERLAY MOBILE */}
          <div className={`fixed inset-0 h-screen w-screen bg-[#050505] z-[2050] flex flex-col items-center justify-between py-24 transition-transform duration-500 lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#bc13fe]/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            {/* Profil Mobile */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              {session ? (
                <button 
                  onClick={() => { setView('profil'); setIsOpen(false); }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#00f2ff] group-active:scale-95 transition-all">
                    <i className="fas fa-user-gear text-xl"></i>
                  </div>
                  <span className="text-white text-xs tracking-[0.3em] font-black uppercase">{displayName}</span>
                  <span className="text-[8px] text-[#00f2ff] mt-2 opacity-60">Modifier le profil</span>
                </button>
              ) : (
                <div className="text-[10px] text-white/20 tracking-[0.5em]">GUEST_MODE</div>
              )}
            </div>

            <div className="flex flex-col gap-6 text-center relative z-10">
              <button onClick={() => { setView('landing'); setIsOpen(false); }} className="text-4xl italic font-black uppercase tracking-tighter text-white hover:text-[#00f2ff]">ACCUEIL_</button>
              <button onClick={() => { setView('explorer'); setIsOpen(false); }} className="text-4xl italic font-black uppercase tracking-tighter text-white hover:text-[#00f2ff]">EXPLORER_</button>
              <button onClick={() => { setView('pricing'); setIsOpen(false); }} className="text-4xl italic font-black uppercase tracking-tighter text-[#00f2ff]">TARIFS_PRO</button>
              {session && (
                 <button onClick={() => { setView(userRole === 'pro' ? 'dashboard' : 'mes-reservations'); setIsOpen(false); }} className="text-4xl italic font-black uppercase tracking-tighter text-[#bc13fe]">
                   {userRole === 'pro' ? 'ATELIER_' : 'MISSIONS_'}
                 </button>
              )}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 w-full px-12">
              {session ? (
                <button onClick={() => { supabase.auth.signOut(); setIsOpen(false); }} className="text-[10px] text-red-500 font-black tracking-[0.4em] uppercase py-4 w-full border border-red-500/20 rounded-2xl">DÉCONNEXION</button>
              ) : (
                <button onClick={() => { onAuthClick(); setIsOpen(false); }} className="px-10 py-5 bg-[#bc13fe] text-white rounded-full text-xs font-black tracking-widest shadow-xl w-full">CONNEXION_UNIT</button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}