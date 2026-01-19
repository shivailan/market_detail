import { supabase } from '../lib/supabase';

export default function Navbar({ setView, view, session, dark, setDark, onAuthClick }) {
  const userRole = session?.user?.user_metadata?.role || session?.user?.role;
  
  // On extrait le nom proprement
  const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];

  return (
    <nav className={`fixed top-0 left-0 w-full p-8 md:p-10 flex justify-between items-center z-[500] font-black italic transition-all backdrop-blur-md ${dark ? 'text-white bg-black/20' : 'text-black bg-white/20'}`}>
      
      {/* LOGO */}
      <div 
        className="logo-font text-[16px] font-bold tracking-[0.8em] uppercase cursor-pointer hover:scale-105 transition-transform" 
        onClick={() => setView('landing')}
      >
        DetailPlan
      </div>
      
      {/* NAVIGATION CENTRALE */}
      <div className="hidden lg:flex gap-10 text-[9px] uppercase tracking-[0.4em] items-center">
        <button 
          onClick={() => setView('landing')} 
          className={`hover:text-[#bc13fe] transition-colors ${view === 'landing' ? 'text-[#bc13fe]' : ''}`}
        >
          Accueil
        </button>
        
        <button 
          onClick={() => setView('explorer')} 
          className={`hover:text-[#bc13fe] transition-colors ${view === 'explorer' ? 'text-[#bc13fe]' : ''}`}
        >
          Explorer
        </button>
        
        {session && (
          <>
            {userRole === 'pro' ? (
              <button 
                onClick={() => setView('dashboard')} 
                className={`px-4 py-1 border border-[#bc13fe]/30 rounded-full text-[#bc13fe] hover:bg-[#bc13fe] hover:text-white transition-all ${view === 'dashboard' ? 'bg-[#bc13fe] text-white' : ''}`}
              >
                Mon_Atelier
              </button>
            ) : (
              <button 
                onClick={() => setView('mes-reservations')} 
                className={`transition-all hover:text-[#00f2ff] ${view === 'mes-reservations' ? 'text-[#00f2ff] border-b-2 border-[#00f2ff]' : ''}`}
              >
                Mes Réservations
              </button>
            )}
          </>
        )}
      </div>

      {/* BLOC UTILISATEUR & AUTH */}
      <div className="flex items-center gap-6">
        {session ? (
          <div className="flex items-center gap-6">
            {/* BADGE UTILISATEUR */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-[9px] font-black tracking-[0.2em] opacity-80">
                {displayName}
              </span>
            </div>

            {/* LOGOUT */}
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="text-[9px] opacity-30 hover:opacity-100 hover:text-red-500 transition-all uppercase tracking-widest"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button 
            onClick={onAuthClick} 
            className={`px-8 py-3 rounded-full text-[9px] font-black tracking-[0.3em] uppercase transition-all ${dark ? 'bg-white text-black hover:bg-[#00f2ff]' : 'bg-black text-white hover:bg-[#bc13fe]'}`}
          >
            Connexion
          </button>
        )}
      </div>
    </nav>
  );
}