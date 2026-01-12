import { supabase } from '../lib/supabase';

export default function Navbar({ setView, view, session, dark, setDark, onAuthClick }) {
  const displayName = session?.user?.email?.split('@')[0];
  const userRole = session?.user?.user_metadata?.role; 

  return (
    <nav className={`fixed top-0 left-0 w-full p-10 flex justify-between items-center z-[500] font-black italic transition-all ${dark ? 'text-white' : 'text-black'}`}>
      <div className="logo-font text-[16px] font-bold tracking-[0.8em] uppercase cursor-pointer" onClick={() => setView('landing')}>DetailPlan</div>
      
      <div className="hidden md:flex gap-12 text-[9px] uppercase tracking-[0.4em] items-center">
        <button onClick={() => setView('landing')} className={view === 'landing' ? 'text-[#00f2ff] underline underline-offset-8' : ''}>Accueil</button>
        <button onClick={() => setView('explorer')} className={view === 'explorer' ? 'text-[#00f2ff] underline underline-offset-8' : ''}>Explorer</button>
        
        {/* SI PRO : BOUTON ATELIER */}
        {session && userRole === 'pro' && (
          <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'text-[#bc13fe] underline underline-offset-8' : ''}>Mon_Atelier</button>
        )}

        {/* SI CLIENT : BOUTON MES MISSIONS (L'ESPACE DONT TU PARLES) */}
        {session && userRole === 'client' && (
          <button onClick={() => setView('mes-reservations')} className={view === 'mes-reservations' ? 'text-[#00f2ff] underline underline-offset-8' : ''}>Mes_Missions</button>
        )}
        
        <button onClick={() => setDark(!dark)} className="w-10 h-10 rounded-full border border-current/10 flex items-center justify-center">
          {dark ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
        </button>
      </div>

      <div className="flex items-center gap-6">
        {!session ? (
          <button onClick={onAuthClick} className="text-[9px] font-black opacity-40 hover:opacity-100 border-b border-current">Connexion</button>
        ) : (
          <div className="flex items-center gap-4 animate-in fade-in">
            <span className="text-[9px] text-[#00f2ff]">{displayName}</span>
            <button onClick={() => supabase.auth.signOut()} className="w-8 h-8 rounded-lg border border-current/10 flex items-center justify-center text-[10px] hover:text-red-500">
              <i className="fas fa-power-off"></i>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}