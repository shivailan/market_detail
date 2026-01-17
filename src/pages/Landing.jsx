import voitureHero from '../img/car.jpg'; // Ajuste le nom et l'extension (.jpg, .png, etc.)

export default function Landing({ dark, setView, searchVille, setSearchVille, handleSearch }) {
  const borderClass = dark ? 'border-white/10' : 'border-black/5';
  const glassClass = dark ? 'bg-white/[0.03] backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl shadow-sm';
  const accentText = "text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-[#bc13fe] to-[#00f2ff] animate-gradient-text";

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
                PURIFIER <br />
                <span className={accentText}>L'ESSENCE.</span>
              </h1>

              <p className={`max-w-md text-[13px] tracking-[0.2em] font-bold uppercase italic leading-relaxed border-l-2 pl-8 ${dark ? 'text-white/40 border-white/10' : 'text-black/40 border-black/10'}`}>
                L'interface ultime entre la <span className={dark ? 'text-white' : 'text-black'}>passion automobile</span> <br/>
                et la science de la protection moléculaire.
              </p>

              <div className="flex flex-wrap gap-8 pt-6">
                <button 
                  onClick={() => setView('explorer')}
                  className="shine-effect px-16 py-8 bg-black text-white dark:bg-white dark:text-black rounded-full font-black text-[11px] tracking-[0.4em] uppercase shadow-2xl hover:scale-105 transition-all"
                >
                  Explorer_Base
                </button>
                <button 
                   onClick={() => document.getElementById('bento').scrollIntoView({behavior:'smooth'})}
                   className={`px-12 py-8 rounded-full border-2 ${borderClass} font-black text-[11px] tracking-[0.4em] uppercase hover:bg-current hover:text-white transition-all ${dark ? 'text-white' : 'text-black'}`}
                >
                  Specs_
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
        <section id="bento" className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            
            {/* EN-TÊTE PLUS FIN */}
            <div className="mb-16 flex items-center gap-6">
                <h2 className={`text-4xl font-black italic tracking-tighter uppercase ${dark ? 'text-white' : 'text-black'}`}>
                  L'Écosystème_<span className="text-[#00f2ff]">DetailPlan</span>
                </h2>
                <div className={`h-[1px] flex-1 ${dark ? 'bg-white/10' : 'bg-black/5'}`}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* CARTE CLIENTS (CYAN) */}
                <div className={`md:col-span-7 ${glassClass} border ${borderClass} rounded-[50px] p-10 md:p-16 relative overflow-hidden group min-h-[450px] flex flex-col justify-between`}>
                    {/* Background décoratif léger */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2ff]/5 rounded-full blur-[80px] group-hover:bg-[#00f2ff]/10 transition-all duration-700"></div>
                    
                    <div className="relative z-10">
                        <span className="text-[#00f2ff] text-[10px] font-black tracking-[0.4em] uppercase italic mb-4 block">Côté_Propriétaire</span>
                        <h3 className={`text-5xl font-black italic tracking-tighter mb-6 uppercase leading-none ${dark ? 'text-white' : 'text-black'}`}>
                          TROUVER L'EXCELLENCE <br/> <span className="text-[#00f2ff]">EN 3 CLICS.</span>
                        </h3>
                        <div className="space-y-4 opacity-60">
                            <p className="flex items-start gap-3 text-[13px] font-bold italic tracking-wide">
                                <i className="fas fa-search-location mt-1 text-[#00f2ff]"></i>
                                Géo-localisation des meilleurs ateliers de detailing.
                            </p>
                            <p className="flex items-start gap-3 text-[13px] font-bold italic tracking-wide">
                                <i className="fas fa-calendar-check mt-1 text-[#00f2ff]"></i>
                                Réservation instantanée sur l'agenda réel du pro.
                            </p>
                            <p className="flex items-start gap-3 text-[13px] font-bold italic tracking-wide">
                                <i className="fas fa-shield-alt mt-1 text-[#00f2ff]"></i>
                                Paiement sécurisé et messagerie directe intégrée.
                            </p>
                        </div>
                    </div>

                    <button className="relative z-10 w-fit px-10 py-5 bg-white text-black rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-[#00f2ff] transition-all shadow-xl">
                        Lancer_une_Recherche
                    </button>
                </div>

                {/* CARTE PROS (VIOLET) */}
                <div className={`md:col-span-5 ${glassClass} border ${borderClass} rounded-[50px] p-10 md:p-16 relative overflow-hidden group min-h-[450px] flex flex-col justify-between`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#bc13fe]/5 rounded-full blur-[80px] group-hover:bg-[#bc13fe]/10 transition-all duration-700"></div>

                    <div className="relative z-10">
                        <span className="text-[#bc13fe] text-[10px] font-black tracking-[0.4em] uppercase italic mb-4 block">Côté_Professionnel</span>
                        <h3 className={`text-4xl font-black italic tracking-tighter mb-6 uppercase leading-none ${dark ? 'text-white' : 'text-black'}`}>
                          PILOTEZ VOTRE <br/> <span className="text-[#bc13fe]">STUDIO PRO.</span>
                        </h3>
                        <p className={`text-[12px] opacity-40 font-bold italic normal-case mb-8 ${dark ? 'text-white' : 'text-black'}`}>
                          Devenez visible, gérez vos réservations et encaissez vos paiements sans effort administratif.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4 border-t border-current/5 pt-8">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black opacity-30 tracking-widest uppercase italic">Déploiement_CMS</span>
                            <span className="text-[#bc13fe] text-[10px] font-black italic">IMMÉDIAT</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black opacity-30 tracking-widest uppercase italic">Commission_Réseau</span>
                            <span className="text-[#bc13fe] text-[10px] font-black italic">0€ / MOIS</span>
                        </div>
                        <button className="w-full mt-4 py-5 border-2 border-[#bc13fe] text-[#bc13fe] rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-[#bc13fe] hover:text-white transition-all">
                            Créer_mon_Espace
                        </button>
                    </div>
                </div>

                {/* PETITE BOX STATS / RASSURANCE (BAS) */}
                <div className={`md:col-span-4 ${glassClass} border ${borderClass} rounded-[40px] p-8 flex items-center gap-6 group hover:border-[#00f2ff] transition-colors`}>
                   <div className="w-16 h-16 rounded-2xl bg-current/5 flex items-center justify-center text-2xl">
                      <i className="fas fa-star text-[#00f2ff]"></i>
                   </div>
                   <div>
                      <p className={`text-2xl font-black italic leading-none ${dark ? 'text-white' : 'text-black'}`}>4.9/5</p>
                      <p className="text-[9px] opacity-30 font-black tracking-widest uppercase italic">Satisfaction_Client</p>
                   </div>
                </div>

                <div className={`md:col-span-4 ${glassClass} border ${borderClass} rounded-[40px] p-8 flex items-center gap-6 group hover:border-[#bc13fe] transition-colors`}>
                   <div className="w-16 h-16 rounded-2xl bg-current/5 flex items-center justify-center text-2xl">
                      <i className="fas fa-check-double text-[#bc13fe]"></i>
                   </div>
                   <div>
                      <p className={`text-2xl font-black italic leading-none ${dark ? 'text-white' : 'text-black'}`}>100%</p>
                      <p className="text-[9px] opacity-30 font-black tracking-widest uppercase italic">Paiements_Sécurisés</p>
                   </div>
                </div>

                <div className={`md:col-span-4 ${glassClass} border ${borderClass} rounded-[40px] p-8 flex items-center gap-6 group hover:border-[#00f2ff] transition-colors`}>
                   <div className="w-16 h-16 rounded-2xl bg-current/5 flex items-center justify-center text-2xl">
                      <i className="fas fa-clock text-[#00f2ff]"></i>
                   </div>
                   <div>
                      <p className={`text-2xl font-black italic leading-none ${dark ? 'text-white' : 'text-black'}`}>-80%</p>
                      <p className="text-[9px] opacity-30 font-black tracking-widest uppercase italic">Gestion_Administrative</p>
                   </div>
                </div>

            </div>
          </div>
        </section>
        {/* --- SEARCH SCANNER --- */}

{/* --- SEARCH SCANNER : RADAR INTERFACE --- */}
        <section className="py-32 px-6 relative">
          <div className={`max-w-[1200px] mx-auto ${glassClass} border ${borderClass} rounded-[60px] md:rounded-[100px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl`}>
              
              {/* Effet de scan laser qui passe horizontalement */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f2ff] shadow-[0_0_15px_#00f2ff] opacity-20 animate-scan-slow"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.03] invert-0 dark:invert"></div>
              </div>

              {/* Contenu Header */}
              <div className="relative z-10 mb-16">
                  <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full border border-[#00f2ff]/30 bg-[#00f2ff]/5 mb-6">
                      <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-ping"></span>
                      <span className="text-[9px] font-black tracking-[0.3em] text-[#00f2ff] uppercase italic">Signal_Capture_Active</span>
                  </div>
                  <h3 className={`text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none ${dark ? 'text-white' : 'text-black'}`}>
                      LOCALISER_<span className={accentText}>L'ATELIER.</span>
                  </h3>
              </div>
              
              {/* Interface Input de Recherche */}
              <div className="relative max-w-3xl mx-auto z-10">
                  <div className="relative group">
                      {/* Petites infos tech aux coins de l'input */}
                      <div className="absolute -top-6 left-6 text-[8px] font-black opacity-20 tracking-widest italic">COORD_X: 48.8566</div>
                      <div className="absolute -top-6 right-6 text-[8px] font-black opacity-20 tracking-widest italic">COORD_Y: 2.3522</div>

                      <input 
                          type="text" 
                          placeholder="ENTRER NOM_VILLE_ID" 
                          value={searchVille} 
                          onChange={(e) => setSearchVille(e.target.value)} 
                          className={`w-full p-8 md:p-12 rounded-3xl border-2 transition-all outline-none font-black italic text-[16px] tracking-[0.2em] uppercase text-center
                            ${dark 
                                ? 'bg-black/40 border-white/10 text-white focus:border-[#00f2ff] focus:shadow-[0_0_30px_rgba(0,242,255,0.1)]' 
                                : 'bg-white/80 border-black/5 text-black focus:border-[#00f2ff] focus:shadow-[0_15px_30px_rgba(0,0,0,0.05)]'}
                          `} 
                      />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                      <button 
                          onClick={handleSearch} 
                          className="group relative px-16 py-7 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black italic text-[11px] tracking-[0.4em] uppercase overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl"
                      >
                          <span className="relative z-10 flex items-center gap-4">
                              <i className="fas fa-satellite-dish animate-pulse"></i>
                              Initialiser_Le_Scan
                          </span>
                          <div className="absolute inset-0 bg-[#00f2ff] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      </button>
                      
                      <div className="hidden md:flex flex-col text-left border-l border-current/10 pl-6">
                        <span className="text-[8px] font-black opacity-30 tracking-widest">DATABASE_QUERY</span>
                        <span className="text-[10px] font-black italic">SEARCHING_PRO_NETWORK_V4.0</span>
                      </div>
                  </div>
              </div>

              {/* Décoration de fond : Radar circles */}
              <div className="absolute -bottom-24 -left-24 w-64 h-64 border border-[#00f2ff]/10 rounded-full animate-ping opacity-20"></div>
          </div>
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

        {/* --- FAQ SECTION --- */}
        <section className="py-40 px-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-10 mb-24 opacity-30">
              <span className={`text-[11px] font-black italic tracking-widest ${dark ? 'text-white' : 'text-black'}`}>FAQ_MODULE</span>
              <div className={`h-[1px] flex-1 ${dark ? 'bg-white/10' : 'bg-black/10'}`}></div>
          </div>
          
          <div className="space-y-10 font-black italic">
              {[
                  {q: "SÉCURITÉ DES DONNÉES ?", r: "Toutes les réservations sont chiffrées de bout en bout sur notre protocole sécurisé. Vos données bancaires ne sont jamais stockées sur nos serveurs."},
                  {q: "DÉPLOIEMENT STUDIO ?", r: "Validation instantanée. Votre page pro est injectée dans l'écosystème dès la fin de votre phase de configuration CMS."},
                  {q: "SYNCHRONISATION ?", r: "Mise à jour ultra-basse latence via notre cloud. Toute modification de tarif est répercutée en moins de 100ms sur le réseau."}
              ].map((item, i) => (
                  <details key={i} className={`group ${glassClass} border-2 ${borderClass} rounded-[40px] overflow-hidden transition-all duration-700`}>
                      <summary className={`flex justify-between items-center p-12 cursor-pointer list-none ${dark ? 'text-white' : 'text-black'}`}>
                          <span className="text-[14px] font-black tracking-[0.2em] group-open:text-[#00f2ff] uppercase transition-colors">{item.q}</span>
                          <div className={`w-10 h-10 rounded-full border ${borderClass} flex items-center justify-center transition-transform duration-500 group-open:rotate-180`}>
                              <i className="fas fa-chevron-down text-[10px]"></i>
                          </div>
                      </summary>
                      <div className={`px-12 pb-12 opacity-50 text-[12px] tracking-[0.1em] leading-relaxed italic text-left font-bold ${dark ? 'text-white' : 'text-black'}`}>
                          {item.r}
                      </div>
                  </details>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}