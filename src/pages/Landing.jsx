import { useState } from 'react';
import voitureHero from '../img/car.jpg'; // Ajuste le nom et l'extension (.jpg, .png, etc.)


export default function Landing({ dark, setView, searchVille, setSearchVille, handleSearch }) {
  const borderClass = dark ? 'border-white/10' : 'border-black/5';
  const glassClass = dark ? 'bg-white/[0.03] backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl shadow-sm';
  const accentText = "text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-[#bc13fe] to-[#00f2ff] animate-gradient-text";
// À insérer dans votre composant Landing ou directement dans le corps de la page
const [activePerspective, setActivePerspective] = useState('client');

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
        `}
      </style>

      <div className={`animate-in fade-in duration-1000 scroll-smooth ${dark ? 'bg-[#0a0a0b]' : 'bg-[#fcfcfc]'}`}>
        
        {/* --- HERO: THE PURITY PROTOCOL --- */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-32 pb-20">
          
          {/* FOND AQUATIQUE TECH */}
          <div className="absolute inset-0 z-0">
            <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 bg-[#00f2ff]`}></div>
            <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-10 bg-[#bc13fe]`}></div>
            
            {/* Effet de gouttes (Rain/Drips) */}
            <div className="drip opacity-20" style={{left: '15%', animationDelay: '0s'}}></div>
            <div className="drip opacity-20" style={{left: '45%', animationDelay: '2.5s'}}></div>
            <div className="drip opacity-20" style={{left: '80%', animationDelay: '1.2s'}}></div>
            
            {/* Grille de précision légère */}
            <div className={`absolute inset-0 opacity-[0.03] ${dark ? 'bg-[url("https://www.transparenttextures.com/patterns/grid-me.png")]' : 'bg-[url("https://www.transparenttextures.com/patterns/grid-me.png")] invert'}`}></div>
          </div>

          <div className="max-w-[1400px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* TEXTE GAUCHE */}
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

            {/* VISUEL DROITE: "L'EFFET MIROIR" */}
            <div className="relative group">
              {/* Cercle de réfraction dynamique */}
              <div className="absolute inset-[-40px] rounded-full border border-[#00f2ff]/20 animate-water"></div>
              
              <div className={`relative aspect-square max-w-[550px] mx-auto overflow-hidden rounded-[120px] border-[16px] shadow-3xl transition-all duration-1000 group-hover:rounded-[40px] ${dark ? 'border-white/5 bg-black' : 'border-white bg-white shadow-xl'}`}>
<img 
  src={voitureHero} 
  className="w-full h-full object-cover brightness-110 contrast-110 transition-all duration-[2s]" 
  alt="Detailing Close-up"
/>
                
                {/* Overlay de Brillance */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2ff]/10 to-transparent mix-blend-overlay"></div>
                
                {/* Scanner Laser */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_20px_white] animate-laser"></div>
                </div>
              </div>

              {/* Badge 9H Flottant */}
              <div className="absolute -bottom-6 -right-6 p-10 rounded-[50px] bg-black dark:bg-white text-white dark:text-black shadow-2xl flex flex-col items-center justify-center animate-bounce-slow border-4 border-[#00f2ff]/30">
                  <span className="text-3xl font-black italic leading-none">9H+</span>
                  <span className="text-[8px] font-black tracking-widest uppercase opacity-40">Ceramic_Grade</span>
              </div>
            </div>
          </div>
        </section>

        

{/* --- DUAL ECOSYSTEM SECTION (AVANTAGES CLIENTS & PROS) --- */}
<section id="bento" className={`py-32 px-6 relative overflow-hidden transition-colors duration-500 ${dark ? 'bg-[#0a0a0b]' : 'bg-slate-50/50'}`}>
  <div className="max-w-[1400px] mx-auto">
    
    {/* EN-TÊTE AVEC SWITCH */}
    <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
        <div className="flex items-center gap-6">
            <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase ${dark ? 'text-white' : 'text-black'}`}>
              L'Écosystème_<span className="text-[#00f2ff]">DetailPlan</span>
            </h2>
        </div>

        {/* SWITCH INTERACTIF */}
        <div className={`p-1.5 rounded-full flex items-center border ${borderClass} ${dark ? 'bg-white/5' : 'bg-black/5'} backdrop-blur-xl w-fit`}>
            <button 
                onClick={() => setActivePerspective('client')}
                className={`px-8 py-3 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 ${activePerspective === 'client' ? 'bg-[#00f2ff] text-black shadow-lg shadow-[#00f2ff]/20' : 'opacity-40 hover:opacity-100'}`}
            >
                CLIENT
            </button>
            <button 
                onClick={() => setActivePerspective('pro')}
                className={`px-8 py-3 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 ${activePerspective === 'pro' ? 'bg-[#bc13fe] text-white shadow-lg shadow-[#bc13fe]/20' : 'opacity-40 hover:opacity-100'}`}
            >
                PROFESSIONNEL
            </button>
        </div>
    </div>

    {/* CONTENU DYNAMIQUE */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* CARTE PRINCIPALE (Change selon le switch) */}
        {activePerspective === 'client' ? (
            <div className={`md:col-span-8 animate-in fade-in slide-in-from-left-8 duration-700 ${glassClass} border ${borderClass} rounded-[60px] p-12 md:p-20 relative overflow-hidden group min-h-[500px] flex flex-col justify-between`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f2ff]/10 rounded-full blur-[100px] group-hover:bg-[#00f2ff]/20 transition-all duration-700"></div>
                <div className="relative z-10">
                    <span className="text-[#00f2ff] text-[10px] font-black tracking-[0.5em] uppercase italic mb-6 block">Perspectives_Client</span>
                    <h3 className={`text-6xl md:text-7xl font-black italic tracking-tighter mb-8 uppercase leading-[0.85] ${dark ? 'text-white' : 'text-black'}`}>
                      L'EXCELLENCE <br/> <span className="text-[#00f2ff]">EN 3 CLICS.</span>
                    </h3>
                    <div className="space-y-6">
                        {[
                            { icon: "fa-search-location", text: "Géo-localisation des meilleurs ateliers de detailing." },
                            { icon: "fa-calendar-check", text: "Réservation instantanée sur l'agenda réel du pro." },
                            { icon: "fa-shield-alt", text: "Paiement séquestre sécurisé (validation par code)." }
                        ].map((item, i) => (
                            <p key={i} className="flex items-center gap-4 text-[14px] font-bold italic tracking-wide group-hover:translate-x-2 transition-transform duration-300">
                                <i className={`fas ${item.icon} text-[#00f2ff] w-6`}></i>
                                <span className="opacity-70">{item.text}</span>
                            </p>
                        ))}
                    </div>
                </div>

                <button onClick={() => setView('explorer')} className="relative z-10 w-fit mt-12 px-12 py-6 bg-white text-black rounded-full font-black text-[11px] tracking-[0.4em] uppercase hover:bg-[#00f2ff] transition-all shadow-2xl active:scale-95">
                    LANCER MA RECHERCHE
                </button>
            </div>
        ) : (
            <div className={`md:col-span-8 animate-in fade-in slide-in-from-right-8 duration-700 ${glassClass} border ${borderClass} rounded-[60px] p-12 md:p-20 relative overflow-hidden group min-h-[500px] flex flex-col justify-between`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#bc13fe]/10 rounded-full blur-[100px] group-hover:bg-[#bc13fe]/20 transition-all duration-700"></div>
                <div className="relative z-10">
                    <span className="text-[#bc13fe] text-[10px] font-black tracking-[0.5em] uppercase italic mb-6 block">Command_Center_Pro</span>
                    <h3 className={`text-6xl md:text-7xl font-black italic tracking-tighter mb-8 uppercase leading-[0.85] ${dark ? 'text-white' : 'text-black'}`}>
                      PILOTEZ VOTRE <br/> <span className="#bc13fe">STUDIO PRO.</span>
                    </h3>
                    <div className="space-y-6">
                        {[
                            { icon: "fa-rocket", text: "Déploiement immédiat de votre page vitrine personnalisée." },
                            { icon: "fa-tasks", text: "Gestion automatisée des créneaux et des prestations." },
                            { icon: "fa-file-invoice-dollar", text: "Suivi des revenus et paiements sécurisés sans effort." }
                        ].map((item, i) => (
                            <p key={i} className="flex items-center gap-4 text-[14px] font-bold italic tracking-wide group-hover:translate-x-2 transition-transform duration-300">
                                <i className={`fas ${item.icon} text-[#bc13fe] w-6`}></i>
                                <span className="opacity-70">{item.text}</span>
                            </p>
                        ))}
                    </div>
                </div>
                <button className="relative z-10 w-fit mt-12 px-12 py-6 border-2 border-[#bc13fe] text-[#bc13fe] rounded-full font-black text-[11px] tracking-[0.4em] uppercase hover:bg-[#bc13fe] hover:text-white transition-all shadow-2xl active:scale-95">
                    DÉPLOYER_MON_UNITÉ
                </button>
            </div>
        )}

        {/* COLONNE STATS & RASSURANCE */}
        <div className="md:col-span-4 flex flex-col gap-6">
            {[
                { 
                    val: activePerspective === 'client' ? "4.9/5" : "+28%", 
                    label: activePerspective === 'client' ? "SATISFACTION_CLIENT" : "CROISSANCE_MOYENNE",
                    color: activePerspective === 'client' ? "#00f2ff" : "#bc13fe",
                    icon: activePerspective === 'client' ? "fa-star" : "fa-chart-line"
                },
                { 
                    val: "100%", 
                    label: "TRANSACTIONS_SÉCURISÉES",
                    color: activePerspective === 'client' ? "#00f2ff" : "#bc13fe",
                    icon: "fa-shield-check"
                },
                { 
                    val: activePerspective === 'client' ? "-15min" : "-80%", 
                    label: activePerspective === 'client' ? "TEMPS_DE_BOOKING" : "CHARGE_ADMINISTRATIVE",
                    color: activePerspective === 'client' ? "#00f2ff" : "#bc13fe",
                    icon: "fa-bolt"
                }
            ].map((stat, i) => (
                <div key={i} className={`${glassClass} border ${borderClass} rounded-[40px] p-8 flex items-center gap-6 group hover:scale-[1.02] transition-all duration-500`}>
                    <div className={`w-16 h-16 rounded-2xl bg-current/5 flex items-center justify-center text-2xl transition-transform group-hover:rotate-12`} style={{ color: stat.color }}>
                        <i className={`fas ${stat.icon}`}></i>
                    </div>
                    <div>
                        <p className={`text-3xl font-black italic leading-none mb-2 ${dark ? 'text-white' : 'text-black'}`}>{stat.val}</p>
                        <p className="text-[9px] opacity-30 font-black tracking-[0.2em] uppercase italic">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>

    </div>
  </div>

  {/* Glows de fond clarifiés */}
  <div className={`absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 pointer-events-none transition-colors duration-1000 ${activePerspective === 'client' ? 'bg-[#00f2ff]' : 'bg-[#bc13fe]'}`}></div>
</section>

        {/* AJOUTER CECI DANS TON BLOC <style> */}
        <style>
          {`
            @keyframes scan-slow {
              0% { top: 0%; }
              100% { top: 100%; }
            }
            .animate-scan-slow { animation: scan-slow 4s infinite linear; }
          `}
        </style>
{/* --- FAQ SECTION : INTELLIGENCE_PROTOCOL --- */}
<section className="py-40 px-6 max-w-5xl mx-auto relative">
  {/* Décoration de fond subtile */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#bc13fe]/5 blur-[120px] rounded-full pointer-events-none"></div>

  <div className="relative z-10">
    {/* HEADER AVEC STYLE PROTOCOLE */}
    <div className="flex items-center gap-8 mb-24">
      <div className="flex flex-col">
        <span className={`text-[10px] font-black tracking-[0.5em] mb-2 ${dark ? 'text-[#00f2ff]' : 'text-slate-500'}`}>
          DATABASE_QUERY_V2
        </span>
        <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase ${dark ? 'text-white' : 'text-black'}`}>
          QUESTIONS_<span className="text-[#bc13fe]">FRÉQUENTES.</span>
        </h2>
      </div>
      <div className={`h-[2px] flex-1 translate-y-4 opacity-20 ${dark ? 'bg-gradient-to-r from-[#00f2ff] to-transparent' : 'bg-black'}`}></div>
    </div>
    
    <div className="space-y-6">
      {[
        {
          q: "SÉCURITÉ DES DONNÉES_?",
          r: "Toutes les transactions transitent via un tunnel chiffré AES-256. Vos données bancaires sont traitées par notre partenaire de paiement certifié PCI-DSS Level 1. Nous n'avons aucun accès direct à vos informations sensibles.",
          icon: "fa-shield-halved"
        },
        {
          q: "PROCESSUS_DÉPLOIEMENT_STUDIO_?",
          r: "Une fois votre configuration terminée, l'algorithme valide vos paramètres en temps réel. Votre studio devient visible sur le réseau mondial DetailPlan en moins de 60 secondes.",
          icon: "fa-microchip"
        },
        {
          q: "SYNCHRONISATION_TEMPS_RÉEL_?",
          r: "Notre infrastructure utilise des WebSockets à basse latence. Les modifications de tarifs, de disponibilités ou les nouveaux messages sont répercutés instantanément sur toutes les instances.",
          icon: "fa-sync"
        },
        {
          q: "POLITIQUE_D'ANNULATION_?",
          r: "Le client dispose d'un délai défini par le professionnel pour annuler. Passé ce délai, des frais de blocage de créneau peuvent être appliqués pour protéger l'agenda de l'expert.",
          icon: "fa-ban"
        }
      ].map((item, i) => (
        <details 
          key={i} 
          className={`group border-2 transition-all duration-500 rounded-[35px] overflow-hidden ${glassClass} 
            ${dark 
              ? 'border-white/5 hover:border-[#00f2ff]/30 open:border-[#00f2ff]/50' 
              : 'border-black/5 hover:border-[#bc13fe]/20 open:border-[#bc13fe]/40 shadow-sm hover:shadow-xl'
            }`}
        >
          <summary className={`flex justify-between items-center p-10 cursor-pointer list-none`}>
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500
                ${dark ? 'bg-white/5 border-white/10 group-hover:border-[#00f2ff] text-[#00f2ff]' : 'bg-black/5 border-black/10 group-hover:border-[#bc13fe] text-[#bc13fe]'}
              `}>
                <i className={`fas ${item.icon} text-sm`}></i>
              </div>
              <span className={`text-[15px] font-black tracking-widest uppercase italic transition-colors 
                ${dark ? 'text-white/80 group-open:text-[#00f2ff]' : 'text-black/80 group-open:text-[#bc13fe]'}`}>
                {item.q}
              </span>
            </div>
            
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 
              ${dark ? 'border-white/10 group-open:rotate-180 group-open:bg-[#00f2ff] group-open:text-black' : 'border-black/10 group-open:rotate-180 group-open:bg-[#bc13fe] group-open:text-white'}`}>
              <i className="fas fa-plus text-[10px]"></i>
            </div>
          </summary>
          
          <div className="px-28 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <p className={`text-[13px] normal-case font-medium leading-loose italic opacity-60 max-w-2xl
              ${dark ? 'text-white' : 'text-black'}`}>
              {item.r}
            </p>
          </div>
        </details>
      ))}
    </div>
  </div>
</section>

        {/* --- ULTRA-MODERN CYBER FOOTER --- */}
<footer className={`relative overflow-hidden border-t ${borderClass} pt-24 pb-12 px-6 ${dark ? 'bg-[#050505]' : 'bg-white'}`}>
  
  {/* Glows de fond discrets */}
  <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00f2ff]/5 blur-[100px] rounded-full"></div>
  <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#bc13fe]/5 blur-[100px] rounded-full"></div>

  <div className="max-w-[1400px] mx-auto relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
      
      {/* BRAND SECTION */}
      <div className="md:col-span-4 space-y-8">
        <h2 className={`text-3xl font-black italic tracking-tighter uppercase ${dark ? 'text-white' : 'text-black'}`}>
          DETAIL<span className="text-[#00f2ff]">PLAN</span>.
        </h2>
        <p className="text-[12px] opacity-40 font-bold leading-relaxed italic uppercase max-w-xs">
          L'écosystème ultime pour l'esthétique automobile de précision. Connecter l'excellence technique à la passion.
        </p>
        <div className="flex gap-4">
          {['fa-instagram', 'fa-tiktok', 'fa-facebook-f', 'fa-x-twitter'].map((icon, i) => (
            <a key={i} href="#" className={`w-10 h-10 rounded-xl border ${borderClass} flex items-center justify-center opacity-40 hover:opacity-100 hover:border-[#00f2ff] hover:text-[#00f2ff] transition-all`}>
              <i className={`fab ${icon} text-sm`}></i>
            </a>
          ))}
        </div>
      </div>

      {/* NAVIGATION SECTIONS */}
      <div className="md:col-span-2 space-y-6">
        <p className="text-[10px] font-black tracking-[0.4em] text-[#bc13fe] uppercase italic">Navigation_</p>
        <ul className="space-y-4 text-[11px] font-black italic uppercase">
          {['Explorer', 'Services', 'Pricing', 'Network'].map((item) => (
            <li key={item}>
              <a href="#" className="opacity-40 hover:opacity-100 hover:text-[#00f2ff] transition-all">{item}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-2 space-y-6">
        <p className="text-[10px] font-black tracking-[0.4em] text-[#bc13fe] uppercase italic">Legal_</p>
        <ul className="space-y-4 text-[11px] font-black italic uppercase">
          {['Mentions', 'Confidentialité', 'CGU', 'Cookies'].map((item) => (
            <li key={item}>
              <a href="#" className="opacity-40 hover:opacity-100 hover:text-[#00f2ff] transition-all">{item}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* NEWSLETTER SECTION */}
      <div className="md:col-span-4 space-y-8">
        <p className="text-[10px] font-black tracking-[0.4em] text-[#00f2ff] uppercase italic">Newsletter_Update</p>
        <div className={`p-1 rounded-2xl border ${borderClass} flex gap-2 ${glassClass}`}>
          <input 
            type="email" 
            placeholder="SYSTEM_MAIL_ID" 
            className="bg-transparent flex-1 px-6 py-4 text-[10px] font-black italic uppercase outline-none"
          />
          <button className="px-6 py-4 bg-white text-black dark:bg-white dark:text-black rounded-xl font-black text-[9px] tracking-widest uppercase hover:bg-[#00f2ff] transition-all">
            Join_
          </button>
        </div>
        <p className="text-[8px] opacity-20 font-bold uppercase italic">
          En vous inscrivant, vous acceptez de recevoir nos logs d'opérations et mises à jour techniques.
        </p>
      </div>
    </div>

    {/* BOTTOM BAR */}
    <div className={`pt-12 border-t ${borderClass} flex flex-col md:flex-row justify-between items-center gap-6`}>
      <p className="text-[9px] font-black tracking-[0.2em] opacity-20 uppercase italic">
        © 2026 DETAILPLAN_INFRASTRUCTURE. TOUS DROITS RÉSERVÉS.
      </p>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[8px] font-black opacity-30 tracking-widest uppercase italic">All_Systems_Nominal</span>
        </div>
        <p className="text-[8px] font-black opacity-30 tracking-widest uppercase italic">
          V.2.4.0_BUILD
        </p>
      </div>
    </div>
  </div>
</footer>
      </div>
    </>

    
  );

  
}