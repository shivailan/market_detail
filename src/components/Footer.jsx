
export default function Footer({ dark, setView }) {
  const borderClass = dark ? 'border-white/10' : 'border-black/5';

  return (
    <footer className={`relative overflow-hidden border-t ${borderClass} pt-16 md:pt-24 pb-12 px-6 ${dark ? 'bg-[#050505]' : 'bg-white'}`}>
      
      {/* Glows de fond */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00f2ff]/5 blur-[100px] rounded-full"></div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-12 md:gap-16 mb-16 md:mb-24 items-center md:items-start text-center md:text-left">
          
          {/* BRAND SECTION */}
          <div className="md:col-span-4 space-y-6">
            <h2 className={`text-2xl md:text-3xl font-black italic tracking-tighter uppercase ${dark ? 'text-white' : 'text-black'}`}>
              DETAIL<span className="text-[#00f2ff]">PLAN</span>.
            </h2>
            <p className="text-[11px] md:text-[12px] opacity-40 font-bold leading-relaxed italic uppercase max-w-xs mx-auto md:mx-0">
              L'écosystème ultime pour l'esthétique automobile de précision. Connecter l'excellence technique à la passion.
            </p>
          </div>

          {/* NAVIGATION SECTIONS */}
          <div className="w-full md:contents">
            <div className="grid grid-cols-2 md:contents gap-4 w-full">
              {/* Navigation */}
              <div className="md:col-span-3 space-y-6">
                <p className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-[#bc13fe] uppercase italic">Navigation_</p>
                <ul className="space-y-3 text-[10px] md:text-[11px] font-black italic uppercase">
                  <li><button onClick={() => setView('explorer')} className="opacity-40 hover:opacity-100 hover:text-[#00f2ff] transition-all">Explorer</button></li>
                  <li><button onClick={() => setView('landing')} className="opacity-40 hover:opacity-100 hover:text-[#00f2ff] transition-all">Accueil</button></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="md:col-span-3 space-y-6">
                <p className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-[#bc13fe] uppercase italic">Legal_</p>
                <ul className="space-y-3 text-[10px] md:text-[11px] font-black italic uppercase">
                  {/* Lien vers les Mentions Légales */}
                  <li><button onClick={() => setView('mentions')} className="opacity-40 hover:opacity-100 hover:text-[#00f2ff] transition-all text-left">Mentions_Légales</button></li>
                  
                  {/* Lien vers la Politique de Confidentialité (Privacy) */}
                  <li><button onClick={() => setView('privacy')} className="opacity-40 hover:opacity-100 hover:text-[#00f2ff] transition-all text-left">Privacy_RGPD</button></li>
                  
                  {/* Lien vers les CGU (Terms) */}
                  <li><button onClick={() => setView('terms')} className="opacity-40 hover:opacity-100 hover:text-[#00f2ff] transition-all text-left">CGU_Service</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className={`pt-8 md:pt-12 border-t ${borderClass} flex flex-col items-center gap-6`}>
          <p className="text-[8px] md:text-[9px] font-black tracking-[0.2em] opacity-20 uppercase italic text-center leading-loose">
            © 2026 DETAILPLAN_INFRASTRUCTURE.<br className="md:hidden" /> TOUS DROITS RÉSERVÉS.
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[8px] font-black opacity-30 tracking-widest uppercase italic">All_Systems_Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}