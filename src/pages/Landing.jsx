import { useEffect, useState } from 'react';
import voitureHero from '../img/car.webp';
import imgCeramique from '../img/ceramique.png';
import imgEtoile from '../img/etoile.jpg';
import { supabase } from '../lib/supabase';


export default function Landing({ dark, setView, searchVille, setSearchVille, handleSearch }) {
  const borderClass = dark ? 'border-white/10' : 'border-black/5';
  const glassClass = dark ? 'bg-white/[0.03] backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl shadow-sm';
  const accentText = "text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-[#bc13fe] to-[#00f2ff] animate-gradient-text";
  
  const [activePerspective, setActivePerspective] = useState('client');
  const [counts, setCounts] = useState({});

  // --- RÉCUPÉRATION DYNAMIQUE DES STATS AGENCES ---
  useEffect(() => {
    const fetchCounts = async () => {
      const { data, error } = await supabase.from('profiles_pro').select('expertise');
      if (!error && data) {
        const stats = {};
        data.forEach(pro => {
          if (Array.isArray(pro.expertise)) {
            pro.expertise.forEach(service => {
              stats[service] = (stats[service] || 0) + 1;
            });
          }
        });
        setCounts(stats);
      }
    };
    fetchCounts();
  }, []);

  const expertiseServices = [
    { title: "Lavage Manuel", img: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=800" },
    { title: "Polissage", img: "https://images.unsplash.com/photo-1708805282676-0c15476eb8a2?w=500&auto=format&fit=crop&q=60" },
    { title: "Protection Céramique", img: imgCeramique },
    { title: "Pose de PPF", img: "https://images.unsplash.com/photo-1646531840695-62810bcd1171?q=80&w=1364" },
    { title: "Nettoyage Intérieur", img: "https://images.unsplash.com/photo-1732357624591-f2137085659b?q=80&w=1364" },
    { title: "Rénovation Cuir", img: "https://images.unsplash.com/photo-1716370287223-0a162e265ddc?q=80&w=2070" },
    { title: "Optiques de Phare", img: "https://images.unsplash.com/photo-1577903514522-a78357092dac?q=80&w=2069" },
    { title: "Ciel étoilé", img: imgEtoile },
    { title: "Vitres Teintées", img: "https://images.unsplash.com/photo-1765903916475-232947bd4d4a?q=80&w=1934" }
  ];

  return (
    <>
      <style>
        {`
          @keyframes water-flow {
            0% { transform: translateY(-10px) scale(1); opacity: 0.3; }
            50% { transform: translateY(10px) scale(1.05); opacity: 0.6; }
            100% { transform: translateY(-10px) scale(1); opacity: 0.3; }
          }
          @keyframes drip {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(800%); opacity: 0; }
          }
          @keyframes shine-bright {
            0% { left: -100%; }
            100% { left: 200%; }
          }
          .animate-water { animation: water-flow 8s infinite ease-in-out; }
          .drip { position: absolute; width: 1px; height: 120px; background: linear-gradient(to bottom, transparent, #00f2ff, transparent); animation: drip 4s infinite linear; }
          .shine-effect { position: relative; overflow: hidden; }
          .shine-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
            transform: skewX(-25deg);
            animation: shine-bright 3s infinite;
          }
          @media screen and (max-width: 768px) {
            input, select, textarea { font-size: 16px !important; }
          }
        `}
      </style>

      <div className={`animate-in fade-in duration-1000 scroll-smooth ${dark ? 'bg-[#0a0a0b]' : 'bg-[#fcfcfc]'}`}>
        
        {/* --- SECTION 1: HERO --- */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-32 pb-20">
          <div className="absolute inset-0 z-0">
            <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 bg-[#00f2ff]`}></div>
            <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-10 bg-[#bc13fe]`}></div>
            <div className="drip opacity-20" style={{left: '15%', animationDelay: '0s'}}></div>
            <div className="drip opacity-20" style={{left: '80%', animationDelay: '1.2s'}}></div>
            <div className={`absolute inset-0 opacity-[0.03] ${dark ? 'bg-[url("https://www.transparenttextures.com/patterns/grid-me.png")]' : 'bg-[url("https://www.transparenttextures.com/patterns/grid-me.png")] invert'}`}></div>
          </div>

          <div className="max-w-[1400px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="text-left space-y-10">
              <div className="flex items-center gap-4">
              </div>
              <h1 className={`text-[clamp(3rem,8vw,7.5rem)] leading-[0.85] font-black italic uppercase tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>
                Detailing <br />
                <span className={accentText}>Auto</span>
              </h1>
              <p className={`max-w-md text-[13px] tracking-[0.2em] font-bold uppercase italic leading-relaxed border-l-2 pl-8 ${dark ? 'text-white/40 border-white/10' : 'text-black/40 border-black/10'}`}>
                 Accédez aux meilleurs experts de l’esthétique auto, <br/> <span className={dark ? 'text-white' : 'text-black'}> comparez </span> 
                les services et <span className={dark ? 'text-white' : 'text-black'}> réservez </span> votre rendez-vous en ligne.
              </p>
              <div className="flex flex-wrap gap-8 pt-6">
                <button 
                  onClick={() => setView('explorer')}
                  className="shine-effect px-16 py-8 bg-black text-white dark:bg-white dark:text-black rounded-full font-black text-[11px] tracking-[0.4em] uppercase shadow-2xl hover:scale-105 transition-all"
                >
                  Nos professionnels
                </button>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-[-40px] rounded-full border border-[#00f2ff]/20 animate-water"></div>
              <div className={`relative aspect-square max-w-[300px] md:max-w-[550px] mx-auto overflow-hidden rounded-[60px] md:rounded-[120px] border-8 md:border-[16px] shadow-3xl transition-all duration-1000 ${dark ? 'border-white/5 bg-black' : 'border-white bg-white shadow-xl'}`}>
                <img src={voitureHero} className="w-full h-full object-cover scale-110" alt="Detailing View" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2ff]/10 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
          </div>
          {/* SCROLL INDICATOR - BAS DE SECTION */}
<div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
  {/* Texte technique discret */}
  <span className={`text-[8px] font-black tracking-[0.5em] uppercase italic opacity-30 ${dark ? 'text-white' : 'text-black'}`}>
    FAITES DÉFILER
  </span>
  
  {/* La "Souris" animée */}
  <div className={`w-[26px] h-[45px] rounded-full border-2 flex justify-center p-2 ${dark ? 'border-white/20' : 'border-black/20'}`}>
    {/* La bille qui bouge */}
    <div className="w-1 h-2 bg-[#00f2ff] rounded-full animate-scroll-dot shadow-[0_0_10px_#00f2ff]"></div>
  </div>
</div>
        </section>

        {/* --- SECTION 2: NOS SERVICES (AVEC FILTRE CORRIGÉ) --- */}
        <section className={`py-24 px-6 md:px-12 relative overflow-hidden transition-all ${dark ? 'bg-[#080809]' : 'bg-white'}`}>
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 text-left">
              <div className="space-y-4">
                <h2 className={`text-5xl md:text-7xl font-black italic tracking-tighter leading-none uppercase ${dark ? 'text-white' : 'text-black'}`}>
                  Nos <span className="text-[#bc13fe]">Services</span>
                </h2>
                <div className="h-1 w-40 bg-gradient-to-r from-[#bc13fe] to-[#00f2ff]"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {expertiseServices.map((s, i) => {
                const agencesCount = counts[s.title] || 0;
                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      // CORRECTION ICI : On utilise la clé 'service' pour matcher ton useEffect dans Explorer.jsx
                      if(handleSearch) handleSearch({ service: s.title });
                      setView('explorer');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative h-80 rounded-[40px] overflow-hidden border border-white/10 cursor-pointer shadow-2xl transition-all hover:-translate-y-2 active:scale-95"
                  >
                    <img src={s.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={s.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-left">
                      <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white leading-none mb-4 group-hover:text-[#00f2ff] transition-colors">
                        {s.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="bg-[#bc13fe] text-white text-[10px] font-black px-4 py-2 rounded-full shadow-[0_0_15px_rgba(188,19,254,0.5)] uppercase">
                          {agencesCount} {agencesCount > 1 ? 'AGENCES DISPONIBLES' : 'AGENCE DISPONIBLE'}
                        </span>
                        <span className="text-white text-[10px] font-black underline underline-offset-4 decoration-[#00f2ff] uppercase tracking-widest">Voir_Les_Experts</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

{/* --- SECTION 3: THE FLOW JOURNEY --- */}
{/* --- SECTION 3: THE FLOW JOURNEY --- */}
<section 
  id="journey" 
  className={`py-24 md:py-36 px-4 md:px-6 relative overflow-hidden transition-all duration-700 
    ${dark 
      ? 'bg-[#0d1117] border-y border-white/5' // Changement ici : Bleu nuit/Gris titane au lieu du noir pur
      : 'bg-[#f8fafc] border-y border-black/5'
    }`}
>
  {/* EFFETS DE LUMIÈRE D'ARRIÈRE-PLAN (Pour casser le noir) */}
  <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-1000 ${activePerspective === 'client' ? 'bg-[#00f2ff]' : 'bg-[#bc13fe]'}`}></div>
  <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-1000 ${activePerspective === 'client' ? 'bg-[#bc13fe]' : 'bg-[#00f2ff]'}`}></div>

  {/* GRID TECHNIQUE (Points de repère) */}
  <div className={`absolute inset-0 opacity-[0.05] pointer-events-none ${dark ? 'invert-0' : 'invert'}`} 
    style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
  </div>

  <div className="max-w-[1400px] mx-auto relative z-10">
    
    {/* TITRE ÉLECTRIQUE */}
    <div className="text-center mb-16 md:mb-32">
        <h2 className={`text-[12vw] md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] ${dark ? 'text-white' : 'text-black'}`}>
          VOTRE EXPÉRIENCE <br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-all duration-1000 ${activePerspective === 'client' ? 'from-[#00f2ff] to-[#0066ff]' : 'from-[#bc13fe] to-[#6600ff]'}`}>
            SANS FRICTION.
          </span>
        </h2>
    </div>

    {/* SWITCH COMMAND UNIT */}
    <div className="flex justify-center mb-20 md:mb-32">
        <div className={`p-2 rounded-full flex items-center border-2 ${borderClass} ${dark ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-xl w-full max-w-xl shadow-2xl relative`}>
            {/* Indicateur de slide */}
            <div className={`absolute h-[calc(100%-16px)] w-[calc(50%-12px)] rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${activePerspective === 'client' ? 'left-2 bg-[#00f2ff]' : 'left-[calc(50%+4px)] bg-[#bc13fe]'}`}></div>
            
            <button 
                onClick={() => setActivePerspective('client')} 
                className={`relative z-10 flex-1 py-5 rounded-full text-[11px] font-black tracking-[0.3em] transition-colors duration-500 ${activePerspective === 'client' ? 'text-black' : 'text-current opacity-40'}`}
            >
                CÔTÉ CLIENT
            </button>
            <button 
                onClick={() => setActivePerspective('pro')} 
                className={`relative z-10 flex-1 py-5 rounded-full text-[11px] font-black tracking-[0.3em] transition-colors duration-500 ${activePerspective === 'pro' ? 'text-white' : 'text-current opacity-40'}`}
            >
                CÔTÉ PRO
            </button>
        </div>
    </div>

    {/* JOURNEY FLOW DESIGN */}
    <div className="relative">
        {/* LIGNE DE CONNEXION FIBRE OPTIQUE */}
        <div className={`absolute top-1/2 left-0 w-full h-[1px] hidden lg:block -translate-y-1/2 ${dark ? 'bg-white/10' : 'bg-black/10'}`}>
            <div className={`h-full transition-all duration-1000 ease-in-out ${activePerspective === 'client' ? 'bg-[#00f2ff] w-full shadow-[0_0_15px_#00f2ff]' : 'bg-[#bc13fe] w-full shadow-[0_0_15px_#bc13fe]'}`}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {(activePerspective === 'client' ? [
                { step: "01", title: "RECHERCHE", desc: "Localisez les agences autour de vous.", icon: "fa-search" },
                { step: "02", title: "SÉLECTION", desc: "Comparez services, avis et portfolios.", icon: "fa-eye" },
                { step: "03", title: "RÉSERVATION", desc: "Payez via séquestre et recevez votre code.", icon: "fa-calendar-check" },
                { step: "04", title: "PRESTATION", desc: "Libérez les fonds une fois le travail validé.", icon: "fa-car-side" }
            ] : [
                { step: "01", title: "DÉPLOIEMENT", desc: "Créez votre page pro en 2 min sans code.", icon: "fa-rocket" },
                { step: "02", title: "SYNC", desc: "Vos créneaux se gèrent en auto-pilote.", icon: "fa-sync" },
                { step: "03", title: "RECEPTION", desc: "Gérez vos missions via le Command Center.", icon: "fa-tasks" },
                { step: "04", title: "ENCAISSEMENT", desc: "Retraits instantanés de vos revenus.", icon: "fa-wallet" }
            ]).map((item, i) => (
                <div key={i} className="group relative">
                    <div className={`${glassClass} border ${borderClass} rounded-[35px] md:rounded-[45px] p-8 h-full transition-all duration-500 hover:translate-y-[-10px] group-hover:border-current flex flex-col items-center text-center`}
                         style={{ backgroundColor: dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }}>
                        
                        {/* ICON CIRCLE */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-8 transition-all duration-500 ${activePerspective === 'client' ? 'bg-[#00f2ff] text-black shadow-[0_0_30px_rgba(0,242,255,0.3)]' : 'bg-[#bc13fe] text-white shadow-[0_0_30px_rgba(188,19,254,0.3)]'}`}>
                            <i className={`fas ${item.icon}`}></i>
                        </div>

                        <span className="text-[10px] font-black tracking-[0.4em] opacity-30 mb-2 block uppercase italic">Step_{item.step}</span>
                        <h4 className={`text-2xl font-black italic mb-4 tracking-tighter ${dark ? 'text-white' : 'text-black'}`}>{item.title}</h4>
                        <p className={`text-[13px] font-bold italic leading-relaxed opacity-60 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    </div>

    {/* CTA DYNAMIQUE */}
    <div className="mt-20 md:mt-32 text-center">
        <button 
            onClick={() => activePerspective === 'client' ? setView('explorer') : setView('pricing')}
            className={`group px-12 py-6 rounded-full font-black text-[12px] tracking-[0.5em] uppercase transition-all duration-500 relative overflow-hidden shadow-2xl active:scale-95 ${activePerspective === 'client' ? 'bg-[#00f2ff] text-black hover:shadow-[0_0_50px_rgba(0,242,255,0.4)]' : 'bg-[#bc13fe] text-white hover:shadow-[0_0_50px_rgba(188,19,254,0.4)]'}`}
        >
            <span className="relative z-10">
                {activePerspective === 'client' ? 'DÉMARRER MON EXPÉRIENCE' : 'ACTIVER MON STUDIO'}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
    </div>
  </div>
</section>


      </div>
    </>
  );
}