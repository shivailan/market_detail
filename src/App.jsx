import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// --- IMPORTS DES COMPOSANTS ET PAGES ---
import BookingModal from './components/BookingModal';
import Navbar from './components/Navbar';
import Explorer from './pages/Explorer';
import Landing from './pages/Landing';
import MesReservations from './pages/MesReservations';
import ProDashboard from './pages/ProDashboard';
import ProPublicProfile from './pages/ProPublicProfile';

export default function App() {
  // États Globaux
  const [session, setSession] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'explorer', 'dashboard', 'mes-reservations'
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [publicDetailers, setPublicDetailers] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // États Authentification
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Initialisation et Écoute de la session Supabase
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
    
    // 1. Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Écouter les changements d'état (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) setView('landing'); 
    });

    // 3. Charger les professionnels pour l'explorateur
    const fetchDetailers = async () => {
      const { data } = await supabase.from('profiles_pro').select('*').eq('is_visible', true);
      if (data) setPublicDetailers(data);
    };
    fetchDetailers();

    return () => subscription.unsubscribe();
  }, []);

  // Gestion de l'authentification (Login / SignUP)
  const handleAuth = async (role = 'client') => {
    const { error } = authMode === 'signup' 
      ? await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { role: role } } // 'pro' ou 'client'
        }) 
      : await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert("Erreur: " + error.message);
    } else {
      setShowAuth(false);
      if (authMode === 'signup') alert("Compte créé ! Vérifiez vos emails.");
    }
  };

  // Déterminer le rôle de l'utilisateur connecté
  const userRole = session?.user?.user_metadata?.role;

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden font-['Outfit'] italic uppercase text-left ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      {/* NAVBAR : Gère le menu et les accès selon le rôle */}
      <Navbar 
        setView={setView} 
        view={view} 
        session={session} 
        dark={isDarkMode} 
        setDark={setIsDarkMode} 
        onAuthClick={() => { setAuthMode('login'); setShowAuth(true); }} 
      />

      {/* SYSTÈME DE ROUTAGE : Affichage conditionnel des pages */}
      <main className="relative z-10">
        {view === 'landing' && (
          <Landing dark={isDarkMode} setView={setView} handleSearch={() => setView('explorer')} />
        )}

        {view === 'explorer' && (
          <Explorer detailers={publicDetailers} onSelectPro={setSelectedPro} dark={isDarkMode} />
        )}

        {/* ACCÈS PRO : Dashboard de l'Atelier */}
        {view === 'dashboard' && session && userRole === 'pro' && (
          <ProDashboard session={session} dark={isDarkMode} />
        )}

        {/* ACCÈS CLIENT : Mes Missions (Style Planity) */}
        {view === 'mes-reservations' && session && userRole === 'client' && (
          <MesReservations session={session} dark={isDarkMode} />
        )}
      </main>

      {/* --- MODALS & OVERLAYS --- */}

      {/* Profil Public du Pro (quand on clique sur "Consulter Profil") */}
      {selectedPro && (
        <ProPublicProfile 
          pro={selectedPro} 
          onClose={() => setSelectedPro(null)} 
          onBookingClick={() => setIsBookingOpen(true)} 
          dark={isDarkMode} 
        />
      )}

      {/* Modal de Réservation (Style Planity en étapes) */}
      {isBookingOpen && selectedPro && (
        <BookingModal 
          pro={selectedPro} 
          session={session} 
          onClose={() => setIsBookingOpen(false)} 
          dark={isDarkMode} 
        />
      )}

      {/* Modal d'Authentification (Login/Register) */}
      {showAuth && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
            <div className={`w-full max-w-sm border p-12 rounded-[60px] shadow-2xl relative ${isDarkMode?'bg-white/5 border-white/10':'bg-white border-black/5'}`}>
                <button onClick={() => setShowAuth(false)} className="absolute top-8 right-8 opacity-20 hover:opacity-100 font-black text-xl">✕</button>
                <h3 className="text-2xl mb-10 text-center underline decoration-[#bc13fe] tracking-tighter italic font-black uppercase">
                  {authMode === 'login' ? 'Accès_Session' : 'Nouveau_Membre'}
                </h3>
                
                <div className="space-y-4">
                    <input 
                      type="email" 
                      placeholder="EMAIL_ID" 
                      className={`w-full border p-6 text-[10px] rounded-3xl font-black italic uppercase ${isDarkMode?'bg-black text-white border-white/10':'bg-slate-50 text-black border-black/10'}`} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                    <input 
                      type="password" 
                      placeholder="SECURE_HASH" 
                      className={`w-full border p-6 text-[10px] rounded-3xl font-black italic uppercase ${isDarkMode?'bg-black text-white border-white/10':'bg-slate-50 text-black border-black/10'}`} 
                      onChange={e => setPassword(e.target.value)} 
                    />
                    
                    {authMode === 'login' ? (
                        <button onClick={() => handleAuth()} className="w-full bg-white text-black py-6 rounded-3xl uppercase text-[10px] font-black italic hover:bg-[#bc13fe] hover:text-white transition-all shadow-xl">Connecter_Unité</button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleAuth('pro')} className="border border-[#bc13fe] text-[#bc13fe] py-5 rounded-2xl text-[9px] font-black hover:bg-[#bc13fe] hover:text-white transition-all uppercase italic">Expert_Pro</button>
                            <button onClick={() => handleAuth('client')} className="border border-white/20 py-5 rounded-2xl text-[9px] font-black opacity-40 hover:opacity-100 uppercase italic">Client_User</button>
                        </div>
                    )}
                    
                    <button 
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
                      className="w-full text-[8px] opacity-30 mt-6 underline text-center font-bold tracking-widest italic"
                    >
                      {authMode === 'login' ? "CRÉER UN COMPTE" : "DÉJÀ INSCRIT ?"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}