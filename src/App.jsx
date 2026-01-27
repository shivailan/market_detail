import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';

// --- IMPORTS DES COMPOSANTS ET PAGES ---
import AccountSettings from './components/AccountSettings';
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Pricing from './components/Pricing';
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
  // --- ÉTATS GLOBAUX ---
  const [session, setSession] = useState(null);
  const [view, setView] = useState('landing'); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [publicDetailers, setPublicDetailers] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // --- ÉTATS AUTHENTIFICATION ---
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [siret, setSiret] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- ÉTATS VÉRIFICATION SIRET ---
  const [siretStatus, setSiretStatus] = useState('idle'); 
  const [companyName, setCompanyName] = useState('');

  // --- GESTION DES FILTRES ---
  const [filters, setFilters] = useState({ expertise: '', ville: '' });

  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (s && event === 'SIGNED_IN') {
        const role = s.user.user_metadata?.role;
        if (role === 'pro') setView('dashboard');
        else if(view === 'landing') setView('explorer');
      }
      if (!s && event === 'SIGNED_OUT') setView('landing'); 
    });

    const fetchDetailers = async () => {
      const { data } = await supabase.from('profiles_pro').select('*').eq('is_visible', true);
      if (data) setPublicDetailers(data);
    };
    fetchDetailers();
    
    return () => subscription.unsubscribe();
  }, [view]);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const checkSiretLive = async (val) => {
    const clean = val.replace(/\s/g, '');
    setSiret(clean);
    if (clean.length === 14) {
      setSiretStatus('loading');
      try {
        const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${clean}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const entreprise = data.results[0];
          const etat = entreprise.unite_legale?.etat_administratif || entreprise.etat_administratif;
          if (etat === 'A') {
            setSiretStatus('valid');
            setCompanyName(entreprise.nom_complet || "UNITÉ LÉGALE ENREGISTRÉE");
          } else {
            setSiretStatus('invalid');
            setCompanyName('ENTREPRISE CESSÉE');
          }
        } else {
          setSiretStatus('invalid');
          setCompanyName('SIRET INCONNU');
        }
      } catch { setSiretStatus('invalid'); }
    } else {
      setSiretStatus('idle');
      setCompanyName('');
    }
  };

  const handleSearch = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setView('explorer');
  };

  const handleAuth = async () => {
    if (authMode.includes('signup')) {
        if (!email || !password || !firstName || !lastName) return alert("REMPLISSEZ TOUT.");
        if (!acceptedTerms) return alert("ACCEPTEZ LES CGU/CGV.");
        if (authMode === 'signup_pro' && siretStatus !== 'valid') return alert("SIRET INVALIDE.");
    }
    const role = authMode === 'signup_pro' ? 'pro' : 'client';
    const { error } = (authMode.includes('signup'))
      ? await supabase.auth.signUp({ 
          email, password, 
          options: { data: { role, first_name: firstName, last_name: lastName, siret: role === 'pro' ? siret : null, status: role === 'pro' ? 'pending_verification' : 'active' } } 
        }) 
      : await supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert("ERREUR : " + error.message);
    else { setShowAuth(false); if (authMode.includes('signup')) alert("VÉRIFIEZ VOS EMAILS."); }
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden font-['Outfit'] italic uppercase text-left ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
        
        <Navbar 
          setView={setView} view={view} session={session} dark={isDarkMode} setDark={setIsDarkMode} 
          onAuthClick={() => { setAuthMode('login'); setShowAuth(true); }} 
          selectedPro={selectedPro} onBackToExplorer={() => setSelectedPro(null)}
        />

        <Routes>
          {/* ROUTE DYNAMIQUE TYPE DOCTOLIB /pro/nom-du-studio */}
          <Route path="/pro/:slug" element={<PublicProfileWrapper session={session} dark={isDarkMode} setIsBookingOpen={setIsBookingOpen} setSelectedPro={setSelectedPro} />} />

          {/* TOUTES LES AUTRES PAGES (Logique par View) */}
          <Route path="*" element={
            <main className="relative z-10 min-h-[80vh]">
              {view === 'landing' && <Landing dark={isDarkMode} setView={setView} handleSearch={handleSearch} />}
              {view === 'explorer' && <Explorer detailers={publicDetailers} onSelectPro={setSelectedPro} dark={isDarkMode} filters={filters} setFilters={setFilters} />}
              {view === 'mes-reservations' && <MesReservations session={session} dark={isDarkMode} />}
              {view === 'dashboard' && <ProDashboard session={session} dark={isDarkMode} />}
              {view === 'pricing' && <Pricing dark={isDarkMode} setShowAuth={setShowAuth} setAuthMode={setAuthMode} />}
              {view === 'mentions' && <MentionsLegales dark={isDarkMode} />}
              {view === 'privacy' && <Privacy dark={isDarkMode} />}
              {view === 'terms' && <Terms dark={isDarkMode} />}
              {view === 'profil' && <AccountSettings session={session} dark={isDarkMode} setView={setView} />}
            </main>
          } />
        </Routes>

        <Footer dark={isDarkMode} setView={setView} />
        <ScrollToTop dark={isDarkMode} />

        {/* --- MODALE D'AUTHENTIFICATION --- */}
        {showAuth && (
          <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 overflow-y-auto">
              <div className={`w-full max-w-lg border-2 p-8 md:p-12 rounded-[50px] shadow-2xl relative my-auto ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-black/5'}`}>
                  <button onClick={() => setShowAuth(false)} className="absolute top-8 right-8 opacity-20 hover:opacity-100 font-black text-xl">✕</button>
                  <h3 className="text-3xl mb-8 text-center underline decoration-[#bc13fe] tracking-tighter font-black italic">
                    {authMode === 'login' ? 'Connexion' : (authMode === 'signup_pro' ? 'REJOINDRE LE RÉSEAU' : 'INSCRIPTION')}
                  </h3>

                  <div className="space-y-4">
                      {authMode.includes('signup') && (
                          <div className="grid grid-cols-2 gap-4">
                              <input type="text" placeholder="NOM" className={`w-full border-2 p-5 text-[11px] rounded-2xl font-black italic uppercase ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} onChange={e => setLastName(e.target.value)} />
                              <input type="text" placeholder="PRÉNOM" className={`w-full border-2 p-5 text-[11px] rounded-2xl font-black italic uppercase ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} onChange={e => setFirstName(e.target.value)} />
                          </div>
                      )}

                      {authMode === 'signup_pro' && (
                          <div className="relative">
                            <input type="text" placeholder="N° SIRET" maxLength={14} className={`w-full border-2 p-5 text-[11px] rounded-2xl font-black italic uppercase ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'} ${siretStatus === 'valid' ? 'border-green-500/50' : siretStatus === 'invalid' ? 'border-red-500/50' : ''}`} onChange={e => checkSiretLive(e.target.value)} />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {siretStatus === 'loading' && <div className="w-4 h-4 border-2 border-[#bc13fe] border-t-transparent rounded-full animate-spin"></div>}
                              {siretStatus === 'valid' && <i className="fas fa-check-circle text-green-500 text-lg"></i>}
                              {siretStatus === 'invalid' && <i className="fas fa-times-circle text-red-500 text-lg"></i>}
                            </div>
                            {companyName && <p className="text-[8px] mt-2 ml-2 text-green-500 font-black italic">{companyName}</p>}
                          </div>
                      )}

                      <input type="email" placeholder="EMAIL" className={`w-full border-2 p-5 text-[11px] rounded-2xl font-black italic ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} onChange={e => setEmail(e.target.value)} />
                      
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="MOT DE PASSE" className={`w-full border-2 p-5 text-[11px] rounded-2xl font-black italic ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} onChange={e => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity">
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>

                      {authMode.includes('signup') && (
                          <label className="flex items-center gap-3 cursor-pointer group py-2">
                              <input type="checkbox" className="w-4 h-4 rounded accent-[#bc13fe]" onChange={e => setAcceptedTerms(e.target.checked)} />
                              <span className="text-[9px] font-black opacity-40 uppercase italic">J'ACCEPTE LES <button onClick={() => {setView('terms'); setShowAuth(false);}} className="underline">CGU / CGV</button></span>
                          </label>
                      )}

                      <button onClick={handleAuth} disabled={authMode === 'signup_pro' && siretStatus !== 'valid'} className={`w-full py-6 rounded-[25px] uppercase text-[12px] font-black italic transition-all ${isDarkMode ? 'bg-white text-black hover:bg-[#bc13fe] hover:text-white' : 'bg-black text-white'} ${(authMode === 'signup_pro' && siretStatus !== 'valid') ? 'opacity-20 cursor-not-allowed' : ''}`}>
                        {authMode === 'login' ? 'SE CONNECTER' : 'CONFIRMER INSCRIPTION'}
                      </button>

                      <div className="mt-10 space-y-3 pt-6 border-t border-white/5">
                          {authMode === 'login' ? (
                              <div className="flex flex-col gap-3">
                                  <button onClick={() => setAuthMode('signup_client')} className={`w-full py-4 rounded-xl text-[10px] font-black italic transition-all border ${isDarkMode ? 'border-white/10 hover:bg-white/5 text-white/50 hover:text-white' : 'border-black/10 hover:bg-black/5 text-black/50 hover:text-black'}`}>
                                    PAS ENCORE DE COMPTE ? <span className="underline ml-1 text-[#bc13fe]">S'INSCRIRE</span>
                                  </button>
                                  <button onClick={() => setAuthMode('signup_pro')} className="w-full py-4 rounded-xl text-[10px] font-black italic transition-all border-2 border-[#bc13fe]/30 hover:border-[#bc13fe] bg-[#bc13fe]/5 text-[#bc13fe]">
                                    VOUS ÊTES UN PROFESSIONNEL ? <span className="underline ml-1">REJOINDRE LE RÉSEAU</span>
                                  </button>
                              </div>
                          ) : (
                              <div className="flex flex-col gap-3">
                                  <button onClick={() => setAuthMode('login')} className="w-full text-center py-2 text-[10px] font-black italic opacity-40 hover:opacity-100 transition-opacity">
                                      DÉJÀ INSCRIT ? <span className="underline ml-1">SE CONNECTER</span>
                                  </button>
                                  {authMode === 'signup_client' && (
                                      <button onClick={() => setAuthMode('signup_pro')} className="w-full py-3 rounded-xl text-[9px] font-black italic transition-all border border-[#bc13fe]/20 hover:border-[#bc13fe] text-[#bc13fe]/60 hover:text-[#bc13fe]">
                                          VOUS ÊTES UN PROFESSIONNEL ? <span className="underline ml-1 uppercase">S'inscrire comme pro</span>
                                      </button>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* --- MODALES DE PROFIL ET BOOKING --- */}
        {selectedPro && <ProPublicProfile pro={selectedPro} session={session} onClose={() => setSelectedPro(null)} onBookingClick={() => setIsBookingOpen(true)} dark={isDarkMode} />}
        {isBookingOpen && selectedPro && <BookingModal pro={selectedPro} session={session} onClose={() => setIsBookingOpen(false)} dark={isDarkMode} setView={setView} />}
      </div>
    </Router>
  );
}

/**
 * WRAPPER POUR CHARGER UN PRO DEPUIS L'URL /pro/:slug
 */function PublicProfileWrapper({ session, dark, setIsBookingOpen, setSelectedPro }) {
  const { slug } = useParams();
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProBySlug = async () => {
      setLoading(true);
      // Log pour vérifier que le slug arrive bien dans le code
      console.log("Recherche du slug :", slug);

      const { data, error } = await supabase
        .from('profiles_pro')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (data) {
        setPro(data);
        // Important : on s'assure que selectedPro global est mis à jour
        setSelectedPro(data); 
      }
      setLoading(false);
    };
    fetchProBySlug();
  }, [slug, setSelectedPro]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black italic text-[#bc13fe] animate-pulse uppercase tracking-[0.5em] bg-[#050505]">
      Sync_Command_Center...
    </div>
  );
  
  if (!pro) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-[#050505] text-white">
      <h2 className="text-2xl font-black italic uppercase">Studio_Introuvable</h2>
      <button onClick={() => window.location.href = '/'} className="text-[#bc13fe] underline text-xs font-black italic uppercase">Retour_Accueil</button>
    </div>
  );

  // Ici on retourne DIRECTEMENT le composant sans passer par le switch 'view'
  return (
    <div className="fixed inset-0 z-[3000] bg-[#050505]">
      <ProPublicProfile 
        pro={pro} 
        session={session} 
        onClose={() => window.location.href = '/'} 
        onBookingClick={() => setIsBookingOpen(true)} 
        dark={dark} 
      />
    </div>
  );
}