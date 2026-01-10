import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// --- COMPOSANT : DASHBOARD PROFESSIONNEL ---
function ProDashboard({ profile, onEdit, onRefresh }) {
  const [localVisible, setLocalVisible] = useState(profile.is_visible);

  const toggleVisibility = async () => {
    const nextValue = !localVisible;
    setLocalVisible(nextValue);
    const { error } = await supabase.from('profiles_pro').update({ is_visible: nextValue }).eq('id', profile.id);
    if (error) { alert(error.message); setLocalVisible(!nextValue); } 
    else { onRefresh(); }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10" data-aos="fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-2 h-full ${localVisible ? 'bg-[#00f2ff]' : 'bg-white/10'}`}></div>
        <div>
          <div className="flex items-center gap-4">
            <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${profile.is_verified ? 'bg-white text-black' : 'bg-white/10 text-white/40'}`}>
              {profile.is_verified ? 'Certifié' : 'Vérification SIRET...'}
            </span>
            <button onClick={toggleVisibility} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${localVisible ? 'border-[#00f2ff] text-[#00f2ff]' : 'border-white/10 text-white/20'}`}>
              <div className={`w-2 h-2 rounded-full ${localVisible ? 'bg-[#00f2ff] animate-pulse' : 'bg-white/20'}`}></div>
              <span className="text-[8px] font-black uppercase tracking-widest">{localVisible ? 'Profil Public' : 'Profil Privé'}</span>
            </button>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mt-4 logo-font">{profile.nom_commercial}</h1>
          <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold italic"><i className="fas fa-location-dot text-[#00f2ff]"></i> {profile.adresse}</p>
        </div>
        <button onClick={onEdit} className="bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all">Paramètres Business</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[30px]">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 italic font-bold">Tarification</h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold">Citadine</span><span className="font-black text-xl text-[#00f2ff]">{profile.tarifs.petit}€</span></div>
            <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold">Berline</span><span className="font-black text-xl text-[#00f2ff]">{profile.tarifs.berline}€</span></div>
            <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold">SUV / 4x4</span><span className="font-black text-xl text-[#00f2ff]">{profile.tarifs.suv}€</span></div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[30px] md:col-span-2">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-4 italic font-bold">Expertise_Data</h4>
          <p className="text-sm text-slate-300 leading-relaxed font-light italic">"{profile.bio || "Présentation vide..."}"</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-10 pt-8 border-t border-white/5">
            <div><span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1">Délai Prévenance</span><span className="text-xs font-black uppercase text-white">{profile.delai_prevenance}</span></div>
            <div><span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1">Contact</span><span className="text-xs font-black uppercase text-white">{profile.telephone}</span></div>
            <div><span className="block text-[8px] text-slate-500 uppercase tracking-widest mb-1">SIRET</span><span className="text-xs font-black uppercase text-white">{profile.siret}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProForm({ session, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom_responsable: '', telephone: '', siret: '', nom_commercial: '',
    adresse: '', bio: '', tarifs: { petit: '', berline: '', suv: '' }, delai_prevenance: '24h'
  });

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles_pro').upsert({ id: session.user.id, ...formData, updated_at: new Date() });
    setLoading(false);
    if (error) alert(error.message); else onComplete();
  };

  const inputStyle = "w-full bg-black border border-white/10 p-5 text-[10px] tracking-widest outline-none focus:border-[#bc13fe] rounded-xl text-white";

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="bg-white/5 border border-white/10 rounded-[50px] p-10 md:p-16 backdrop-blur-3xl" data-aos="zoom-in">
        {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">01. Administratif</h2>
                <input className={inputStyle} placeholder="NOM RESPONSABLE" type="text" onChange={e => setFormData({...formData, nom_responsable: e.target.value})} />
                <input className={inputStyle} placeholder="TÉLÉPHONE" type="tel" onChange={e => setFormData({...formData, telephone: e.target.value})} />
                <input className={inputStyle} placeholder="SIRET" type="text" onChange={e => setFormData({...formData, siret: e.target.value})} />
            </div>
        )}
        {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">02. Votre Vitrine</h2>
                <input className={inputStyle} placeholder="NOM COMMERCIAL" type="text" onChange={e => setFormData({...formData, nom_commercial: e.target.value})} />
                <input className={inputStyle} placeholder="ADRESSE PHYSIQUE (VILLE)" type="text" onChange={e => setFormData({...formData, adresse: e.target.value})} />
                <textarea className={`${inputStyle} h-32`} placeholder="DESCRIPTION DU SAVOIR-FAIRE" onChange={e => setFormData({...formData, bio: e.target.value})} />
            </div>
        )}
        {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">03. Business Setup</h2>
                <div className="grid grid-cols-3 gap-4">
                    <input className={inputStyle} placeholder="PETIT €" type="number" onChange={e => setFormData({...formData, tarifs: {...formData.tarifs, petit: e.target.value}})} />
                    <input className={inputStyle} placeholder="BERLINE €" type="number" onChange={e => setFormData({...formData, tarifs: {...formData.tarifs, berline: e.target.value}})} />
                    <input className={inputStyle} placeholder="SUV €" type="number" onChange={e => setFormData({...formData, tarifs: {...formData.tarifs, suv: e.target.value}})} />
                </div>
            </div>
        )}
        <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
          {step > 1 && <button onClick={() => setStep(s => s - 1)} className="text-[10px] font-black uppercase opacity-40">Retour</button>}
          <button onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()} disabled={loading} className="ml-auto bg-white text-black px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#bc13fe] hover:text-white transition-all shadow-xl">
            {loading ? 'SYNC...' : step < 3 ? 'Suivant' : 'Publier Profil'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- APP PRINCIPALE ---

export default function App() {
  const [session, setSession] = useState(null);
  const [proProfile, setProProfile] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [publicDetailers, setPublicDetailers] = useState([]);

  // États Recherche
  const [searchVille, setSearchVille] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [closestDetailer, setClosestDetailer] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    fetchPublicDetailers();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && session.user?.user_metadata?.role === 'pro') fetchProProfile();
  }, [session]);

  const fetchProProfile = async () => {
    const { data } = await supabase.from('profiles_pro').select('*').eq('id', session.user.id).single();
    if (data) { setProProfile(data); setIsConfiguring(false); } else setIsConfiguring(true);
  };

  const fetchPublicDetailers = async () => {
    const { data } = await supabase.from('profiles_pro').select('*').eq('is_visible', true);
    if (data) setPublicDetailers(data);
  };

  const handleSearch = () => {
    if (!searchVille.trim()) {
      setSearchResults(null);
      return;
    }
    const results = publicDetailers.filter(pro => 
      pro.adresse.toLowerCase().includes(searchVille.toLowerCase())
    );
    setSearchResults(results);
    if (results.length === 0 && publicDetailers.length > 0) {
      setClosestDetailer(publicDetailers[0]);
    } else {
      setClosestDetailer(null);
    }
    const target = document.getElementById('reseau-section');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuth = async (role = 'client') => {
    const { error } = authMode === 'signup' 
      ? await supabase.auth.signUp({ email, password, options: { data: { role } } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); else setShowAuth(false);
  };

  const isPro = session?.user?.user_metadata?.role === 'pro';

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#bc13fe]">
      
      {/* STATUS BAR */}
      {session && (
        <div className="w-full bg-[#bc13fe] text-white py-2 px-10 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] z-[200] relative">
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span>SESSION {isPro ? 'EXPERT' : 'CLIENT'} : {session.user.email}</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="hover:underline cursor-pointer border-l border-white/20 pl-4">QUITTER [X]</button>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="p-10 flex justify-between items-center relative z-[100]">
        <div className="logo-font text-[14px] font-bold tracking-[0.8em] text-white uppercase group cursor-pointer">
          Detail<span className="text-[#bc13fe] group-hover:text-[#00f2ff] transition-colors">Plan</span>
        </div>
        <div className="hidden md:flex gap-16 text-[10px] font-black uppercase tracking-[0.4em]">
            <a href="#" className="hover:text-[#00f2ff] transition-all italic underline underline-offset-8 decoration-[#00f2ff]/30">Explorer</a>
            {!session && <button onClick={() => {setAuthMode('signup'); setShowAuth(true)}} className="text-white/50 hover:text-[#00f2ff] transition-colors">Devenir Partenaire</button>}
            {session && isPro && <span className="text-[#bc13fe] font-black uppercase">Espace Professionnel</span>}
        </div>
        <div className="flex items-center gap-4">
            {!session && <button onClick={() => {setAuthMode('login'); setShowAuth(true)}} className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white">Connexion</button>}
            <div className="w-12 h-12 flex items-center justify-center border border-white/10 rounded-full cursor-pointer hover:bg-white hover:text-black transition-all">
                <i className="fas fa-bars-staggered text-xs"></i>
            </div>
        </div>
      </nav>

      {/* CONTENT LOGIC */}
      {session && isPro ? (
        <div className="pt-10">
          {isConfiguring ? <ProForm session={session} onComplete={fetchProProfile} /> : <ProDashboard profile={proProfile} onEdit={() => setIsConfiguring(true)} onRefresh={fetchProProfile} />}
        </div>
      ) : (
        <div className="w-full">
            {/* HERO */}
            <main className="max-w-[1600px] mx-auto px-6 md:px-12 relative">
                <header className="h-[80vh] flex flex-col justify-center relative">
                    <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none">
                        <span className="text-[30vw] font-black italic tracking-tighter uppercase">GLOSS</span>
                    </div>
                    <h1 className="text-[clamp(4rem,15vw,12rem)] leading-[0.75] font-black tracking-tighter uppercase relative z-10" data-aos="zoom-out-up">
                        <span className="text-chrome">BEYOND</span> <br /> 
                        <span className="ml-[5vw] text-transparent" style={{ WebkitTextStroke: '2px #bc13fe' }}>THE SHINE.</span>
                    </h1>
                    <div className="mt-12 flex flex-col md:flex-row gap-12 items-start md:items-center relative z-10">
                        <div className="h-24 w-[1px] bg-gradient-to-b from-[#bc13fe] to-transparent hidden md:block"></div>
                        <p className="max-w-md text-slate-500 font-light tracking-[0.2em] text-[10px] uppercase leading-relaxed text-left">Infrastructure digitale de haute précision dédiée à l'esthétique et la protection automobile.</p>
                        <button className="bg-white text-black px-14 py-6 rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:bg-[#bc13fe] hover:text-white transition-all shadow-[0_0_20px_rgba(188,19,254,0.3)]">START PROTOCOL</button>
                    </div>
                </header>
            </main>

            {/* BENTO DIAGNOSTIC (LIGHT MODE) */}
            <div className="bg-[#f8f8f8] text-black py-40 relative mt-20">
                <div className="absolute top-[-119px] left-0 w-full rotate-0 fill-[#f8f8f8] h-[120px]">
                    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full"><path d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                </div>
                <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-10">
                    <div className="col-span-12 md:col-span-5 bg-white rounded-[60px] p-14 h-[650px] flex flex-col shadow-2xl relative overflow-hidden" data-aos="fade-right">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#bc13fe] to-transparent"></div>
                        <span className="text-[#bc13fe] text-[9px] font-black tracking-[0.6em] uppercase italic">Diagnostic Réseau</span>
                        <h3 className="text-6xl font-black mt-6 uppercase leading-none italic tracking-tighter text-slate-900">Scanner <br /> <span className="text-transparent" style={{ WebkitTextStroke: '1px black' }}>L'ATELIER.</span></h3>
                        <div className="mt-20 space-y-6">
                            <input type="text" placeholder="SERVICE (CRYOGENIE, CERAMIQUE...)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 outline-none font-bold text-[10px] tracking-widest focus:border-[#bc13fe]" />
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="VILLE (EX: PARIS)" 
                                    value={searchVille}
                                    onChange={(e) => setSearchVille(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 outline-none font-bold text-[10px] tracking-widest focus:border-[#00f2ff]" 
                                />
                                <i className="fas fa-location-crosshairs absolute right-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                            </div>
                            <button onClick={handleSearch} className="w-full py-7 bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-[#bc13fe] transition-all">INITIER RECHERCHE</button>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-7 rounded-[60px] overflow-hidden relative group h-[650px] shadow-2xl" data-aos="fade-left">
                        <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2071" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt="Detailing Lab" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/20 to-transparent p-16 flex flex-col justify-end">
                            <h4 className="text-6xl font-black uppercase italic text-white tracking-tighter">REFLEXION ABSOLUE.</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESULTATS DE RECHERCHE DYNAMIQUE */}
            <section id="reseau-section" className="max-w-[1600px] mx-auto px-6 md:px-12 py-60">
                <div className="mb-20">
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter">
                        {searchResults ? 'RESULTATS' : 'RESEAU'} <span className="text-[#00f2ff]">{searchResults ? 'LOCALISÉS.' : 'ACTIF.'}</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-4">
                        {searchResults ? `Unités actives détectées à : ${searchVille}` : 'Unités de detailing certifiées disponibles'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* CAS : Resultats trouvés */}
                    {searchResults && searchResults.length > 0 ? (
                        searchResults.map((pro) => (
                            <div key={pro.id} className="bg-white/5 border border-[#00f2ff] p-10 rounded-[50px] group transition-all">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-12 h-12 bg-[#00f2ff]/10 text-[#00f2ff] rounded-2xl flex items-center justify-center text-xl">
                                        <i className="fas fa-satellite-dish"></i>
                                    </div>
                                    <span className="text-[10px] font-black text-[#00f2ff]">{pro.tarifs.petit}€ <span className="opacity-20">MIN</span></span>
                                </div>
                                <h3 className="text-2xl font-black italic uppercase">{pro.nom_commercial}</h3>
                                <p className="text-[10px] text-slate-500 mt-2 uppercase italic tracking-widest">{pro.adresse}</p>
                                <button className="w-full py-5 bg-[#00f2ff] text-black rounded-2xl mt-10 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105">Prendre RDV</button>
                            </div>
                        ))
                    ) : searchResults && searchResults.length === 0 ? (
                        /* CAS : Aucun résultat dans la ville */
                        <div className="col-span-3 py-20 bg-red-500/5 border border-dashed border-red-500/20 rounded-[50px] text-center" data-aos="zoom-in">
                            <p className="text-red-400 text-[10px] uppercase tracking-[0.4em] font-black italic mb-10 animate-pulse">
                                Pas de detailer dans votre ville actuelle.
                            </p>
                            {closestDetailer && (
                                <div className="max-w-md mx-auto p-10 bg-white/5 rounded-3xl border border-white/10 hover:border-[#bc13fe] transition-all">
                                    <span className="text-[8px] text-slate-500 uppercase tracking-[0.5em]">L'unité la plus proche :</span>
                                    <h4 className="text-2xl font-black uppercase italic mt-4 text-white">{closestDetailer.nom_commercial}</h4>
                                    <p className="text-[9px] text-slate-500 mt-2">{closestDetailer.adresse}</p>
                                    <button className="mt-8 text-[9px] font-black uppercase text-[#bc13fe] hover:underline">Voir les tarifs</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* CAS PAR DEFAUT : Afficher tout le réseau */
                        publicDetailers.map((pro) => (
                            <div key={pro.id} className="bg-white/5 border border-white/10 p-10 rounded-[50px] hover:border-[#bc13fe] transition-all group">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-12 h-12 bg-[#bc13fe]/10 text-[#bc13fe] rounded-2xl flex items-center justify-center text-xl group-hover:bg-[#bc13fe] group-hover:text-white transition-all shadow-inner">
                                        <i className="fas fa-microchip"></i>
                                    </div>
                                    <span className="text-[10px] font-black text-[#00f2ff]">{pro.tarifs.petit}€ <span className="opacity-20">MIN</span></span>
                                </div>
                                <h3 className="text-2xl font-black italic uppercase group-hover:text-[#bc13fe] transition-colors leading-none">{pro.nom_commercial}</h3>
                                <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest leading-relaxed line-clamp-3">{pro.bio || "Protocole d'esthétique premium."}</p>
                                <button className="w-full py-5 bg-white/5 group-hover:bg-white group-hover:text-black rounded-2xl mt-10 text-[9px] font-black uppercase tracking-widest transition-all">Voir Profil_</button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* ALGORITHMES */}
            <section className="max-w-[1600px] mx-auto px-6 md:px-12 py-20 bg-black">
                 <div className="flex justify-between items-end mb-20">
                    <h2 className="text-8xl font-black italic uppercase text-white tracking-tighter leading-none">NOS <br/> <span className="text-white/10">ALGORITHMES.</span></h2>
                    <p className="text-[9px] font-bold text-slate-500 border-r-2 border-[#bc13fe] pr-6 uppercase tracking-[0.4em]">Surface Engineering 2026</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { icon: 'fa-soap', title: 'Cryo-Genic', desc: 'Nettoyage glace carbonique.', color: '#bc13fe' },
                        { icon: 'fa-shield-halved', title: 'Armor-9H', desc: 'Protection auto-cicatrisante.', color: '#00f2ff' },
                        { icon: 'fa-wand-magic-sparkles', title: 'Level-3 Polish', desc: 'Finition miroir absolue.', color: '#bc13fe' },
                        { icon: 'fa-couch', title: 'Inner-Soin', desc: 'Nutrition des cuirs rares.', color: '#00f2ff' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-md p-10 rounded-[50px] border border-white/10 hover:border-[#bc13fe] transition-all">
                             <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-xl mb-12" style={{ color: item.color }}><i className={`fas ${item.icon}`}></i></div>
                             <h3 className="text-xl font-black italic uppercase mb-2 tracking-tight leading-none">{item.title}</h3>
                             <p className="text-[10px] text-slate-500 font-light uppercase tracking-widest">{item.desc}</p>
                        </div>
                    ))}
                 </div>
            </section>

            {/* FOOTER */}
            <footer className="max-w-[1600px] mx-auto px-6 md:px-12 py-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center mt-40">
                <div className="logo-font text-xs font-bold tracking-[1em] opacity-30">DETAILPLAN</div>
                <div className="flex gap-10 text-[8px] font-black uppercase tracking-[0.5em] text-slate-500">
                    <a href="#" className="hover:text-[#bc13fe]">Instagram</a>
                    <a href="#" className="hover:text-[#00f2ff]">X-Matrix</a>
                </div>
                <p className="text-[8px] opacity-20 uppercase tracking-[0.5em]">©2026 / L'Elite Automobile / Version 1.0.2</p>
            </footer>
        </div>
      )}

      {/* MODAL AUTH */}
      {showAuth && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 shadow-[inset_0_0_100px_rgba(188,19,254,0.1)]">
          <div className="w-full max-w-sm bg-white/5 border border-white/10 p-12 rounded-[60px] shadow-2xl relative" data-aos="zoom-in">
            <button onClick={() => setShowAuth(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition">✕</button>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 text-center">{authMode === 'login' ? 'System Login' : 'Join Network'}</h3>
            <div className="space-y-4">
              <input type="email" placeholder="EMAIL_ENCRYPTED" className="w-full bg-black border border-white/10 p-5 text-[10px] rounded-2xl outline-none focus:border-[#bc13fe] tracking-widest" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="SECURE_HASH" className="w-full bg-black border border-white/10 p-5 text-[10px] rounded-2xl outline-none focus:border-[#bc13fe] tracking-widest" onChange={e => setPassword(e.target.value)} />
              
              {authMode === 'login' ? (
                <button onClick={() => handleAuth()} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-[#bc13fe] hover:text-white transition-all tracking-[0.3em]">Initialize</button>
              ) : (
                <div className="flex flex-col gap-3">
                    <button onClick={() => handleAuth('pro')} className="w-full border border-[#bc13fe] text-[#bc13fe] py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-[#bc13fe] hover:text-white transition tracking-widest">Compte Expert</button>
                    <button onClick={() => handleAuth('client')} className="w-full border border-white/10 text-white/40 py-5 rounded-2xl font-black uppercase text-[10px] hover:text-white transition tracking-widest">Compte Client</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}