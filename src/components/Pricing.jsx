export default function Pricing({ dark, setShowAuth, setAuthMode }) {
  const commonFeatures = [
    "Profil Public Référencé",
    "Gestion Planning & RDV",
    "Paiements Sécurisés",
    "Messagerie Directe Client",
    "Analytiques Avancés"
  ];

  return (
    <section className={`py-24 md:py-40 px-6 animate-in fade-in duration-700 ${dark ? 'bg-[#0a0a0b]' : 'bg-[#fcfcfc]'}`}>
      <div className="max-w-5xl mx-auto">
        
        {/* EN-TÊTE STRATÉGIQUE */}
        <div className="text-center mb-24 space-y-6">
          <h2 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase italic ${dark ? 'text-white' : 'text-slate-900'}`}>
            ÉVOLUEZ_À_VOTRE <span className="text-[#bc13fe]">RYTHME</span>
          </h2>
          <p className="text-[10px] md:text-[12px] font-black tracking-[0.5em] uppercase opacity-40 italic max-w-2xl mx-auto leading-relaxed">
            Commencez sans frais fixes, testez la puissance de l'outil, et passez au niveau supérieur quand votre business décolle_
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch">
          
          {/* ÉTAPE 1 : TEST & DÉCOLLAGE */}
          <div className={`relative border p-10 md:p-14 rounded-[50px] flex flex-col transition-all duration-500 border-white/10 ${dark ? 'bg-white/[0.02]' : 'bg-white shadow-xl shadow-black/5'}`}>
            <div className="absolute -top-5 left-10 bg-white text-black text-[9px] font-black px-4 py-2 rounded-full italic tracking-[0.2em] uppercase">
              Étape_01 : TESTER
            </div>

            <div className="mb-12 text-left">
              <h3 className={`text-[11px] font-black tracking-[0.4em] uppercase opacity-40 mb-4 ${dark ? 'text-white' : 'text-black'}`}>
                Starter_Commission
              </h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-6xl md:text-7xl font-black italic tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>
                  15%
                </span>
                <span className="text-[12px] font-black opacity-30 uppercase tracking-widest">/ mission</span>
              </div>
              <p className="mt-6 text-[11px] font-black opacity-80 leading-relaxed uppercase italic">
                L'offre parfaite pour <span className="text-[#00f2ff]">lancer votre activité</span> sans débourser un seul euro.
              </p>
            </div>

            <ul className="space-y-6 mb-16 flex-grow border-t border-white/5 pt-10">
              {commonFeatures.map((f, i) => (
                <li key={i} className={`flex items-center gap-5 text-[12px] md:text-[14px] font-black italic tracking-wide ${dark ? 'text-white/70' : 'text-slate-700'}`}>
                  <div className="w-2 h-2 rounded-full bg-[#00f2ff]"></div>
                  <span>{f.toUpperCase()}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
              className="w-full py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] bg-white text-black hover:bg-[#00f2ff] transition-all duration-500"
            >
              LANCER_LE_TEST_GRATUIT
            </button>
          </div>

          {/* ÉTAPE 2 : RENTABILITÉ PRO */}
          <div className={`relative border p-10 md:p-14 rounded-[50px] flex flex-col transition-all duration-500 scale-105 border-[#bc13fe] ${dark ? 'bg-[#bc13fe]/5' : 'bg-[#fdf4ff]'}`}>
            <div className="absolute -top-5 left-10 bg-[#bc13fe] text-white text-[9px] font-black px-4 py-2 rounded-full italic tracking-[0.2em] uppercase shadow-[0_10px_20px_rgba(188,19,254,0.3)]">
              Étape_02 : ACCÉLÉRER
            </div>
            
            <div className="mb-12 text-left">
              <h3 className={`text-[11px] font-black tracking-[0.4em] uppercase opacity-40 mb-4 ${dark ? 'text-white' : 'text-black'}`}>
                Premium_Mensuel
              </h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-6xl md:text-7xl font-black italic tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>
                  29<span className="text-[30px]">.99</span>€
                </span>
                <span className="text-[12px] font-black opacity-30 uppercase tracking-widest">/ mois</span>
              </div>
              <p className="mt-6 text-[11px] font-black text-[#bc13fe] leading-relaxed uppercase italic">
                Dès que vous dépassez 2 missions, <span className="underline">ce forfait vous fait gagner de l'argent</span>.
              </p>
            </div>

            <ul className="space-y-6 mb-16 flex-grow border-t border-[#bc13fe]/20 pt-10">
              {commonFeatures.map((f, i) => (
                <li key={i} className={`flex items-center gap-5 text-[12px] md:text-[14px] font-black italic tracking-wide ${dark ? 'text-white/70' : 'text-slate-700'}`}>
                  <div className="w-2 h-2 rounded-full bg-[#bc13fe] shadow-[0_0_10px_#bc13fe]"></div>
                  <span>{f.toUpperCase()}</span>
                </li>
              ))}
              <li className="flex items-center gap-5 text-[12px] md:text-[14px] font-black italic text-[#bc13fe]">
                <div className="w-2 h-2 rounded-full bg-[#bc13fe]"></div>
                <span>0% COMMISSION PLATEFORME</span>
              </li>
            </ul>

            <button 
              onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
              className="w-full py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] bg-[#bc13fe] text-white hover:bg-[#a611e0] shadow-[0_15px_30px_rgba(188,19,254,0.3)] transition-all"
            >
              PASSER_EN_MODE_RENTABLE
            </button>
          </div>

        </div>

        {/* LOGIQUE DE TRANSITION */}
        <div className="mt-24 max-w-3xl mx-auto">
            <div className={`p-8 md:p-12 rounded-[40px] border border-dashed border-current/10 flex flex-col md:flex-row items-center gap-8 ${dark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                <div className="text-4xl md:text-5xl opacity-20"><i className="fas fa-route"></i></div>
                <div className="flex-1 text-center md:text-left">
                    <h5 className="text-[13px] font-black uppercase italic mb-2 tracking-widest">Le parcours classique du Pro_</h5>
                    <p className="text-[11px] opacity-50 normal-case font-medium leading-relaxed italic">
                        La majorité de nos partenaires commencent par l'offre à 15%. C'est sans risque : nous gagnons de l'argent uniquement si vous en gagnez. Une fois que vous avez validé que DetailPlan vous apporte des clients, basculez sur l'abonnement pour supprimer la commission et garder 100% de votre chiffre d'affaires.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
}