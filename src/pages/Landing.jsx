
export default function Landing({ dark, setView, searchVille, setSearchVille, handleSearch }) {
  const borderClass = dark ? 'border-white/10' : 'border-black/10';
  const glassClass = dark ? 'bg-white/[0.03] backdrop-blur-xl' : 'bg-black/[0.03] backdrop-blur-xl';
  const accentText = "text-transparent bg-clip-text bg-gradient-to-r from-[#bc13fe] via-[#00f2ff] to-[#bc13fe] animate-gradient-text";

  return (
    <div className="animate-in fade-in duration-1000 scroll-smooth">
      
      {/* --- HERO: THE CORE PROTOCOL --- */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay`}></div>
            <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${dark ? 'bg-[#bc13fe]' : 'bg-[#bc13fe]/40'}`}></div>
            <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 ${dark ? 'bg-[#00f2ff]' : 'bg-[#00f2ff]/40'}`}></div>
        </div>

        <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 font-black italic text-left">
            <span className="inline-block px-4 py-1 rounded-full border border-[#bc13fe] text-[#bc13fe] text-[8px] tracking-[0.5em] mb-6 animate-pulse uppercase">System_Online_V.4.0</span>
            <h1 className="text-[clamp(3.5rem,12vw,9rem)] leading-[0.8] tracking-tighter uppercase">
              <span className={dark ? 'text-white' : 'text-black'}>GLOSS</span> <br />
              <span className={accentText}>COMMAND.</span>
            </h1>
            <p className="mt-10 max-w-xl text-[12px] md:text-[14px] tracking-widest uppercase opacity-60 leading-relaxed font-medium">
              L'écosystème ultime pour l'esthétique automobile. Connectez votre passion aux experts les plus qualifiés du réseau.
            </p>
            
            <div className="flex flex-wrap gap-6 mt-12">
                <button onClick={() => setView('explorer')} className="group relative px-12 py-7 bg-white text-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95">
                    <span className="relative z-10 font-black text-[11px] tracking-[0.3em] uppercase">Explorer_Database</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#bc13fe] to-[#00f2ff] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button onClick={() => document.getElementById('bento').scrollIntoView({behavior:'smooth'})} className={`px-12 py-7 rounded-full border ${borderClass} font-black text-[11px] tracking-[0.3em] hover:bg-current hover:text-white transition-all uppercase`}>
                    Specifications_
                </button>
            </div>
          </div>

<div className="lg:col-span-5 hidden lg:block">
             <div className="relative animate-float-car">
                <div className="absolute inset-0 bg-[#00f2ff] blur-[100px] opacity-10 rounded-full animate-pulse"></div>
                <img src="https://images.unsplash.com/photo-1605437241278-c1806d14a4d9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyJTIwZGV0YWlsaW5nfGVufDB8fDB8fHwy://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2070" className="rounded-[80px] shadow-2xl grayscale brightness-75 contrast-125 border border-white/10" alt="Supercar" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }} />
                <div className="absolute inset-0 overflow-hidden rounded-[80px]"><div className="absolute top-0 bottom-0 w-[1px] bg-[#00f2ff] shadow-[0_0_20px_#00f2ff] animate-laser"></div></div>
             </div>
          </div>
        </div>
      </section>

      {/* --- BENTO GRID SECTION --- */}
      <section id="bento" className="py-32 px-6">
        <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-full lg:h-[800px]">
                
                {/* 01. Visualisation (Large) - IMAGE CORRIGÉE (Microfiber Reflet) */}
                <div className={`md:col-span-2 md:row-span-2 ${glassClass} border ${borderClass} rounded-[60px] p-12 flex flex-col justify-end text-left group overflow-hidden relative`}>
                    <img src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=2071" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000" alt="Ceramic Coating" />
                    <div className="relative z-10 font-black italic">
                        <span className="text-[#00f2ff] text-[9px] font-black tracking-[0.5em] mb-4 block uppercase">Interface_Client</span>
                        <h3 className="text-5xl font-black tracking-tighter mb-6 uppercase">SCAN. COMPARE.<br/>BOOK.</h3>
                        <p className="opacity-50 text-[11px] leading-loose max-w-sm normal-case font-medium">Localisez les unités de detailing certifiées. Accédez aux portfolios haute définition et comparez les protocoles techniques avant de réserver.</p>
                    </div>
                </div>

                {/* 02. Pro CMS (Wide) */}
                <div className={`md:col-span-2 ${glassClass} border ${borderClass} rounded-[60px] p-12 flex flex-col justify-center text-left relative overflow-hidden group`}>
                    <div className="absolute right-[-10%] top-[-20%] text-[20vw] font-black opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000 uppercase">CMS</div>
                    <span className="text-[#bc13fe] text-[9px] font-black tracking-[0.5em] mb-4 block uppercase italic">Interface_Studio</span>
                    <h3 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">DEPLOY_YOUR_WEB_PAGE.</h3>
                    <p className="opacity-50 text-[11px] leading-loose max-w-md normal-case font-medium">Un site web professionnel généré en 5 minutes. Gérez vos services, vos tarifs et vos visuels sans aucune connaissance technique.</p>
                </div>

                {/* 03. Stats */}
                <div className={`md:col-span-1 ${glassClass} border ${borderClass} rounded-[60px] p-12 flex flex-col items-center justify-center text-center group`}>
                    <div className="text-5xl font-black text-[#00f2ff] mb-2 group-hover:scale-110 transition-transform tracking-tighter italic">100%</div>
                    <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-40 italic">Precision_Service</span>
                </div>

                {/* 04. Dashboard */}
                <div className={`md:col-span-1 ${glassClass} border ${borderClass} rounded-[60px] p-12 flex flex-col items-center justify-center text-center group`}>
                    <i className="fas fa-microchip text-4xl text-[#bc13fe] mb-4 group-hover:rotate-90 transition-transform duration-500"></i>
                    <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-40 italic">Cloud_CRM_Management</span>
                </div>

            </div>
        </div>
      </section>

      {/* --- SEARCH SCANNER --- */}
      <section className="py-32 px-6">
        <div className={`max-w-[1600px] mx-auto ${glassClass} border ${borderClass} rounded-[80px] p-12 md:p-24 relative overflow-hidden`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-left relative z-10 font-black italic">
                    <h3 className="text-6xl font-black tracking-tighter mb-8 uppercase leading-none">IDENTIFIER<br/><span className={accentText}>L'ATELIER LOCAL.</span></h3>
                    <div className="relative max-w-md group font-black italic">
                        <input 
                            type="text" 
                            placeholder="ENTRER CODE_VILLE_ID" 
                            value={searchVille} 
                            onChange={(e) => setSearchVille(e.target.value)} 
                            className={`w-full p-8 rounded-full border-2 border-current/10 bg-transparent outline-none font-black italic text-[12px] tracking-[0.3em] focus:border-[#00f2ff] transition-all uppercase`} 
                        />
                        <button 
                            onClick={handleSearch} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#bc13fe] rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-xl"
                        >
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                {/* IMAGE SECTION SCANNER : ATELIER PRO */}
                <div className="relative group overflow-hidden rounded-[40px]">
<img src="https://images.unsplash.com/photo-1552933529-e359b2477252?q=80&w=2070" className="w-full h-[400px] object-cover rounded-[40px] opacity-40 group-hover:scale-105 group-hover:opacity-60 transition-all duration-[2s]" alt="Garage" />                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black tracking-[1.5em] border-y py-4 border-white/20 uppercase italic">Detection_Zone_Active</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER: FAQ --- */}
      <section className="py-40 px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-20 opacity-40">
            <div className="h-[1px] flex-1 bg-current"></div>
            <h2 className="text-[10px] font-black tracking-[1em] uppercase italic">FAQ_CORE</h2>
            <div className="h-[1px] flex-1 bg-current"></div>
        </div>
        <div className="space-y-6 font-black italic">
            {[
                {q: "SÉCURITÉ DES DONNÉES ?", r: "Toutes les réservations sont chiffrées de bout en bout sur notre protocole sécurisé."},
                {q: "DÉPLOIEMENT PRO ?", r: "Validation instantanée. Votre page est en ligne dès la fin de la phase de configuration."},
                {q: "MODIFICATION TARIF ?", r: "Mise à jour en temps réel via votre console de bord 'Mon Atelier'."}
            ].map((item, i) => (
                <details key={i} className={`group ${glassClass} border ${borderClass} rounded-3xl overflow-hidden transition-all duration-500`}>
                    <summary className="flex justify-between items-center p-10 cursor-pointer list-none">
                        <span className="text-[11px] font-black tracking-[0.2em] group-open:text-[#00f2ff] uppercase">{item.q}</span>
                        <div className={`w-6 h-6 rounded-full border ${borderClass} flex items-center justify-center transition-transform group-open:rotate-180`}>
                            <i className="fas fa-chevron-down text-[8px]"></i>
                        </div>
                    </summary>
                    <div className="px-10 pb-10 opacity-60 text-[10px] tracking-widest leading-loose italic text-left normal-case font-medium">
                        {item.r}
                    </div>
                </details>
            ))}
        </div>
      </section>
    </div>
  );
}