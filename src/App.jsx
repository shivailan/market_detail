import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// --- IMPORTS DES COMPOSANTS ET PAGES ---
import AccountSettings from './components/AccountSettings'; // Vérifie bien le chemin
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Explorer from './pages/Explorer';
import Landing from './pages/Landing';
import MentionsLegales from './pages/MentionsLegales';
import MesReservations from './pages/MesReservations';
import Privacy from './pages/Privacy';
import ProDashboard from './pages/ProDashboard';
import ProPublicProfile from './pages/ProPublicProfile';
import Terms from './pages/Terms';

export default function App() {
  // États Globaux
  const [session, setSession] = useState(null);
  const [view, setView] = useState('landing'); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [publicDetailers, setPublicDetailers] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // États Authentification
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [filters, setFilters] = useState({ expertise: '', ville: '' });

  // Initialisation et Écouteurs
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('update_password');
        setShowAuth(true);
      }
      if (!s && event === 'SIGNED_OUT') setView('landing'); 
    });

    const fetchDetailers = async () => {
      const { data } = await supabase.from('profiles_pro').select('*').eq('is_visible', true);
      if (data) setPublicDetailers(data);
    };
    fetchDetailers();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // --- LOGIQUE TARIFS ---
  const pricingPlans = [
    {
      name: "Starter_Unit",
      price: "0",
      features: ["Visibilité basique", "5 Réservations / mois", "Commission 15%", "Support Mail"],
      color: "border-white/10",
      btn: "Déployer_Gratuit"
    },
    {
      name: "Professional_Pro",
      price: "29",
      features: ["Top_Ranking Explorer", "Réservations illimitées", "0% Commission", "Dashboard Avancé", "Gestion Planning"],
      color: "border-[#bc13fe] shadow-[0_0_30px_rgba(188,19,254,0.2)]",
      btn: "Activer_PRO",
      popular: true
    },
    {
      name: "Agency_Network",
      price: "79",
      features: ["Multi-comptes staff", "Statistiques Expert", "API Accès", "Support Prioritaire 24/7", "Badge Vérifié"],
      color: "border-[#00f2ff] shadow-[0_0_30px_rgba(0,242,255,0.2)]",
      btn: "Contact_Sales"
    }
  ];

  // Fonctions Auth
  const handleAuth = async (role = 'client') => {
    const { error } = authMode === 'signup' 
      ? await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { role: role } } 
        }) 
      : await supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert("Erreur: " + error.message);
    else {
      setShowAuth(false);
      if (authMode === 'signup') alert("PROTOCOLE_ENVOYÉ : Vérifiez vos emails.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Veuillez saisir votre EMAIL_ID.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) alert("ERREUR : " + error.message);
    else { alert("LIEN ENVOYÉ !"); setAuthMode('login'); }
  };

  const handleUpdatePassword = async () => {
    if (password.length < 6) return alert("6 caractères minimum.");
    const { error } = await supabase.auth.updateUser({ password: password });
    if (error) alert("ERREUR : " + error.message);
    else { alert("MIS À JOUR !"); setShowAuth(false); setAuthMode('login'); setShowPassword(false); }
  };

  const handleSearch = (newFilters) => {
  // On fusionne les anciens filtres avec le nouveau (ex: expertise: "Lavage Manuel")
  setFilters(prev => ({
    ...prev,
    ...newFilters
  }));
  setView('explorer');
};

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden font-['Outfit'] italic uppercase text-left ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      <Navbar 
        setView={setView} 
        view={view} 
        session={session} 
        dark={isDarkMode} 
        setDark={setIsDarkMode} 
        onAuthClick={() => { setAuthMode('login'); setShowAuth(true); }} 
        selectedPro={selectedPro} // <--- AJOUTE CECI
        onBackToExplorer={() => setSelectedPro(null)} // <--- AJOUTE CECI AUSSI
      />

      <main className="relative z-10 min-h-[80vh]">
        {view === 'landing' && <Landing dark={isDarkMode} setView={setView} handleSearch={() => setView('explorer')} />}
        {view === 'explorer' && <Explorer detailers={publicDetailers} onSelectPro={setSelectedPro} dark={isDarkMode} />}
        {view === 'mes-reservations' && <MesReservations session={session} dark={isDarkMode} />}
        {view === 'dashboard' && <ProDashboard session={session} dark={isDarkMode} />}
        {view === 'explorer' && (
  <Explorer 
    filters={filters} 
    setFilters={setFilters} 
    /* ... autres props */ 
  />
)}
        
        {/* VUE TARIFS (PRICING) */}
        {view === 'pricing' && (
          <section className="py-32 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20" data-aos="fade-down">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
                  Scale_Your_Business<span className="text-[#bc13fe]">.</span>
                </h2>
                <p className="opacity-40 font-bold text-xs tracking-[0.3em]">CHOISISSEZ VOTRE NIVEAU D'INTÉGRATION</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {pricingPlans.map((plan, idx) => (
                  <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} className={`relative border-2 p-10 rounded-[45px] flex flex-col ${plan.color} ${isDarkMode ? 'bg-white/5 backdrop-blur-md' : 'bg-white shadow-xl'}`}>
                    {plan.popular && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#bc13fe] text-white text-[9px] font-black px-5 py-2 rounded-full tracking-widest">RECOMMANDÉ</span>
                    )}
                    <h3 className="text-xl font-black italic mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-10">
                      <span className="text-6xl font-black italic">{plan.price}€</span>
                      <span className="text-[10px] opacity-30 ml-2">/ MOIS</span>
                    </div>
                    <ul className="space-y-5 mb-12 flex-grow">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center text-[10px] font-bold tracking-wide">
                          <span className={`mr-3 h-1.5 w-1.5 rounded-full ${plan.popular ? 'bg-[#bc13fe]' : 'bg-white/30'}`}></span>
                          {f.toUpperCase()}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => { setAuthMode('signup'); setShowAuth(true); }} className={`w-full py-6 rounded-3xl font-black italic uppercase text-[10px] tracking-widest transition-all ${plan.popular ? 'bg-[#bc13fe] text-white hover:scale-105 shadow-lg shadow-[#bc13fe]/20' : 'border border-white/10 hover:bg-white hover:text-black'}`}>
                      {plan.btn}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {view === 'mentions' && <MentionsLegales dark={isDarkMode} />}
        {view === 'privacy' && <Privacy dark={isDarkMode} />}
        {view === 'terms' && <Terms dark={isDarkMode} />}
        {view === 'profil' && (
  <AccountSettings 
    session={session} 
    dark={isDarkMode} 
    setView={setView} 
  />
)}
      </main>

      <Footer dark={isDarkMode} setView={setView} />
      <ScrollToTop dark={isDarkMode} />

      {/* --- MODALS --- */}
      {selectedPro && <ProPublicProfile pro={selectedPro} onClose={() => setSelectedPro(null)} onBookingClick={() => setIsBookingOpen(true)} dark={isDarkMode} />}
      {isBookingOpen && selectedPro && <BookingModal pro={selectedPro} session={session} onClose={() => setIsBookingOpen(false)} dark={isDarkMode} setView={setView} />}

      {showAuth && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
            <div className={`w-full max-w-sm border p-12 rounded-[60px] shadow-2xl relative ${isDarkMode?'bg-white/5 border-white/10':'bg-white border-black/5'}`}>
                <button onClick={() => setShowAuth(false)} className="absolute top-8 right-8 opacity-20 hover:opacity-100 font-black text-xl">✕</button>
                <h3 className="text-2xl mb-10 text-center underline decoration-[#bc13fe] tracking-tighter italic font-black uppercase">
                  {authMode === 'login' && 'Accès_Session'}
                  {authMode === 'signup' && 'Nouveau_Membre'}
                  {authMode === 'forgot_password' && 'Récupération_Accès'}
                  {authMode === 'update_password' && 'Nouveau_Mot_De_Passe'}
                </h3>
                <div className="space-y-4">
                    {authMode !== 'update_password' && (
                      <input type="email" placeholder="EMAIL_ID" autoCapitalize="none" spellCheck="false" className={`w-full border p-6 text-[10px] rounded-3xl font-black italic normal-case ${isDarkMode?'bg-black text-white border-white/10':'bg-slate-50 text-black border-black/10'}`} onChange={e => setEmail(e.target.value)} />
                    )}
                    {authMode !== 'forgot_password' && (
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder={authMode === 'update_password' ? "NOUVEAU_PASSWORD" : "SECURE_HASH"} className={`w-full border p-6 text-[10px] rounded-3xl font-black italic normal-case ${isDarkMode?'bg-black text-white border-white/10':'bg-slate-50 text-black border-black/10'}`} onChange={e => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i></button>
                      </div>
                    )}
                    {authMode === 'login' && (
                      <button onClick={() => setAuthMode('forgot_password')} className="text-[9px] opacity-40 hover:opacity-100 mt-2 text-right block w-full italic">MOT_DE_PASSE_OUBLIÉ_?</button>
                    )}
                    
                    {authMode === 'update_password' ? (
                        <button onClick={handleUpdatePassword} className="w-full bg-[#00f2ff] text-black py-6 rounded-3xl uppercase text-[10px] font-black italic shadow-xl">CONFIRMER_NOUVEL_ACCÈS</button>
                    ) : authMode === 'forgot_password' ? (
                        <button onClick={handleForgotPassword} className="w-full bg-[#bc13fe] text-white py-6 rounded-3xl uppercase text-[10px] font-black italic shadow-xl">RÉINITIALISER_ACCÈS</button>
                    ) : authMode === 'login' ? (
                        <button onClick={() => handleAuth()} className="w-full bg-white text-black py-6 rounded-3xl uppercase text-[10px] font-black italic hover:bg-[#bc13fe] hover:text-white transition-all shadow-xl">Connecter_Unité</button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleAuth('pro')} className="border border-[#bc13fe] text-[#bc13fe] py-5 rounded-2xl text-[9px] font-black hover:bg-[#bc13fe] hover:text-white transition-all uppercase italic">Expert_Pro</button>
                            <button onClick={() => handleAuth('client')} className="border border-white/20 py-5 rounded-2xl text-[9px] font-black opacity-40 hover:opacity-100 uppercase italic">Client_User</button>
                        </div>
                    )}
                    <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setShowPassword(false); }} className="w-full text-[8px] opacity-30 mt-6 underline text-center font-bold tracking-widest italic">
                      {authMode === 'update_password' || authMode === 'forgot_password' ? "RETOUR_CONNEXION" : (authMode === 'login' ? "CRÉER UN COMPTE" : "DÉJÀ INSCRIT ?")}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}