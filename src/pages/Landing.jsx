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
    { title: "Polissage", img: "https://images.unsplash.com/photo-1708805282676-0c15476eb8a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cG9sbGlzYWdlfGVufDB8fDB8fHwy" },
    { title: "Protection Céramique", img: imgCeramique },
    { title: "Pose de PPF", img: "https://images.unsplash.com/photo-1646531840695-62810bcd1171?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Nettoyage Intérieur", img: "https://images.unsplash.com/photo-1732357624591-f2137085659b?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Rénovation Cuir", img: "https://images.unsplash.com/photo-1716370287223-0a162e265ddc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Optiques de Phare", img: "https://images.unsplash.com/photo-1577903514522-a78357092dac?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Ciel étoilé", img: imgEtoile },
    { title: "Vitres Teintées", img: "https://images.unsplash.com/photo-1765903916475-232947bd4d4a?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
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
                <span className="w-12 h-[1px] bg-[#00f2ff]"></span>
                <span className={`text-[10px] font-black tracking-[0.6em] uppercase italic ${dark ? 'text-white/40' : 'text-black/40'}`}>Laboratory_Standard_v4</span>
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
        </section>

        {/* --- SECTION 2: EXPERTISE_UNIT (VISUELLE & DYNAMIQUE) --- */}
        <section className={`py-24 px-6 md:px-12 relative overflow-hidden transition-all ${dark ? 'bg-[#080809]' : 'bg-white'}`}>
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 text-left">
              <div className="space-y-4">
                <span className="text-[10px] font-black tracking-[0.5em] text-[#00f2ff] uppercase italic">Database_Linked</span>
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
                      // 1. On active le filtre spécifique au service cliqué
                      // On envoie un objet avec la clé "expertise" car c'est le nom de ta colonne en BDD
                      if(handleSearch) handleSearch({ expertise: s.title });

                      // 2. On change la vue vers l'explorateur
                      setView('explorer');

                      // 3. On remonte en haut de page pour voir les résultats
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
                          {agencesCount} {agencesCount > 1 ? 'UNITÉS DISPONIBLES' : 'UNITÉ DISPONIBLE'}
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

        {/* --- SECTION 3: DUAL ECOSYSTEM --- */}
        <section id="bento" className={`py-20 md:py-32 px-4 md:px-6 relative overflow-hidden transition-colors duration-500 ${dark ? 'bg-[#0a0a0b]' : 'bg-slate-50/50'}`}>
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-12 md:mb-20 gap-8">
                <div className="flex items-center gap-6 text-center lg:text-left w-full">
                    <h2 className={`text-[8vw] md:text-5xl font-black italic tracking-tighter uppercase leading-tight break-words w-full ${dark ? 'text-white' : 'text-black'}`}>
                      L'Écosystème<br className="md:hidden" />
                      <span className="text-[#00f2ff]">DetailPlan</span>
                    </h2>
                </div>
                <div className={`p-1 rounded-full flex items-center border ${borderClass} ${dark ? 'bg-white/5' : 'bg-black/5'} backdrop-blur-xl w-full lg:w-fit`}>
                    <button onClick={() => setActivePerspective('client')} className={`flex-1 lg:flex-none px-4 md:px-8 py-3 rounded-full text-[9px] md:text-[10px] font-black tracking-widest transition-all duration-300 ${activePerspective === 'client' ? 'bg-[#00f2ff] text-black shadow-lg' : 'opacity-40'}`}>CLIENT</button>
                    <button onClick={() => setActivePerspective('pro')} className={`flex-1 lg:flex-none px-4 md:px-8 py-3 rounded-full text-[9px] md:text-[10px] font-black tracking-widest transition-all duration-300 ${activePerspective === 'pro' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>PRO</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                <div className={`lg:col-span-8 ${glassClass} border ${borderClass} rounded-[40px] md:rounded-[60px] p-8 md:p-20 relative overflow-hidden group min-h-[450px] md:min-h-[500px] flex flex-col justify-between transition-all`}>
                    <div className={`absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full blur-[80px] md:blur-[100px] opacity-10 transition-all duration-700 ${activePerspective === 'client' ? 'bg-[#00f2ff]' : 'bg-[#bc13fe]'}`}></div>
                    <div className="relative z-10 text-left">
                        <span className={`text-[10px] font-black tracking-[0.5em] uppercase italic mb-6 block ${activePerspective === 'client' ? 'text-[#00f2ff]' : 'text-[#bc13fe]'}`}>{activePerspective === 'client' ? 'Perspectives_Client' : 'Command_Center_Pro'}</span>
                        <h3 className={`text-[clamp(2.5rem,8vw,4.5rem)] font-black italic tracking-tighter mb-8 uppercase leading-[0.85] ${dark ? 'text-white' : 'text-black'}`}>
                          {activePerspective === 'client' ? (<>L'EXCELLENCE <br/> <span className="text-[#00f2ff]">EN 3 CLICS.</span></>) : (<>PILOTEZ VOTRE <br/> <span className="text-[#bc13fe]">STUDIO PRO.</span></>)}
                        </h3>
                        <div className="space-y-4 md:space-y-6">
                            {(activePerspective === 'client' ? [
                                { icon: "fa-search-location", text: "Géo-localisation des meilleurs ateliers." },
                                { icon: "fa-calendar-check", text: "Réservation instantanée sur l'agenda réel." },
                                { icon: "fa-shield-alt", text: "Paiement séquestre sécurisé par code." }
                            ] : [
                                { icon: "fa-rocket", text: "Déploiement immédiat de votre vitrine." },
                                { icon: "fa-tasks", text: "Gestion automatisée des créneaux." },
                                { icon: "fa-file-invoice-dollar", text: "Suivi des revenus sans effort." }
                            ]).map((item, i) => (
                                <p key={i} className={`flex items-start gap-4 text-[13px] md:text-[14px] font-bold italic tracking-wide ${dark ? 'text-white' : 'text-black'}`}>
                                    <i className={`fas ${item.icon} mt-1 w-6 ${activePerspective === 'client' ? 'text-[#00f2ff]' : 'text-[#bc13fe]'}`}></i>
                                    <span className="opacity-70">{item.text}</span>
                                </p>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => activePerspective === 'client' ? setView('explorer') : null} className={`relative z-10 w-full md:w-fit mt-12 px-12 py-6 rounded-full font-black text-[11px] tracking-[0.4em] uppercase transition-all shadow-2xl active:scale-95 ${activePerspective === 'client' ? 'bg-white text-black hover:bg-[#00f2ff]' : 'border-2 border-[#bc13fe] text-[#bc13fe] hover:bg-[#bc13fe] hover:text-white'}`}>
                        {activePerspective === 'client' ? 'LANCER MA RECHERCHE' : 'DÉPLOYER_MON_UNITÉ'}
                    </button>
                </div>
                
                <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
                    {[
                        { val: activePerspective === 'client' ? "4.9/5" : "+28%", label: activePerspective === 'client' ? "SATISFACTION_CLIENT" : "CROISSANCE_MOYENNE", color: activePerspective === 'client' ? "#00f2ff" : "#bc13fe", icon: activePerspective === 'client' ? "fa-star" : "fa-chart-line" },
                        { val: "100%", label: "TRANSACTIONS_SÉCURISÉES", color: activePerspective === 'client' ? "#00f2ff" : "#bc13fe", icon: "fa-shield-check" },
                        { val: activePerspective === 'client' ? "-15min" : "-80%", label: activePerspective === 'client' ? "TEMPS_DE_BOOKING" : "CHARGE_ADMINISTRATIVE", color: activePerspective === 'client' ? "#00f2ff" : "#bc13fe", icon: "fa-bolt" }
                    ].map((stat, i) => (
                        <div key={i} className={`${glassClass} border ${borderClass} rounded-[30px] md:rounded-[40px] p-6 md:p-8 flex items-center gap-6 group hover:scale-[1.02] transition-all duration-500`}>
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-current/5 flex items-center justify-center text-xl md:text-2xl transition-transform group-hover:rotate-12`} style={{ color: stat.color }}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <div className="text-left">
                                <p className={`text-2xl md:text-3xl font-black italic leading-none mb-1 md:mb-2 ${dark ? 'text-white' : 'text-black'}`}>{stat.val}</p>
                                <p className="text-[8px] opacity-30 font-black tracking-[0.2em] uppercase italic">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="py-20 md:py-40 px-4 md:px-6 max-w-5xl mx-auto relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-16 md:mb-24 text-center md:text-left">
              <div className="flex flex-col w-full">
                <span className={`text-[8px] md:text-[10px] font-black tracking-[0.4em] mb-2 ${dark ? 'text-[#00f2ff]' : 'text-slate-500'}`}>DATABASE_QUERY_V2</span>
                <h2 className={`text-[9vw] md:text-5xl font-black italic tracking-tighter uppercase leading-[0.9] ${dark ? 'text-white' : 'text-black'}`}>QUESTIONS<span className="text-[#bc13fe]">_FRÉQUENTES.</span></h2>
              </div>
            </div>
            <div className="space-y-4 md:space-y-6">
              {[
                { q: "SÉCURITÉ DES DONNÉES_?", r: "Toutes les transactions transitent via un tunnel chiffré AES-256.", icon: "fa-solid fa-lock" },
                { q: "DÉPLOIEMENT_STUDIO_?", r: "Votre studio devient visible en moins de 60 secondes.", icon: "fa-microchip" },
                { q: "SYNCHRO_TEMPS_RÉEL_?", r: "Mises à jour instantanées sur toutes les instances.", icon: "fa-sync" },
                { q: "ANNULATION_?", r: "Le client dispose d'un délai défini par le professionnel.", icon: "fa-ban" }
              ].map((item, i) => (
                <details key={i} className={`group border-2 transition-all duration-500 rounded-[25px] md:rounded-[35px] overflow-hidden ${dark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                  <summary className="flex items-center p-4 md:p-8 cursor-pointer list-none outline-none text-left">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center border shrink-0 ${dark ? 'bg-black border-white/10 text-[#00f2ff]' : 'bg-white border-black/10 text-[#bc13fe]'}`}><i className={`fas ${item.icon} text-xs md:text-lg`}></i></div>
                    <span className={`flex-1 px-4 md:px-8 text-[10px] md:text-[15px] font-black tracking-widest uppercase italic ${dark ? 'text-white/80' : 'text-black/80'}`}>{item.q}</span>
                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all duration-500 shrink-0 ${dark ? 'border-white/10 group-open:rotate-45 group-open:bg-[#00f2ff] group-open:text-black' : 'border-black/10 group-open:rotate-45 group-open:bg-[#bc13fe] group-open:text-white'}`}><i className="fas fa-plus text-[10px]"></i></div>
                  </summary>
                  <div className="px-6 md:px-28 pb-8 md:pb-10 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                    <p className={`text-[11px] md:text-[14px] normal-case font-medium leading-relaxed italic opacity-60 ${dark ? 'text-white' : 'text-black'}`}>{item.r}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}