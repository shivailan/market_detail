
export default function Pricing({ dark, setShowAuth, setAuthMode }) {
  const plans = [
    {
      name: "Starter_Unit",
      price: "0",
      features: ["Visibilité basique", "5 Réservations / mois", "Commission 15%", "Support Mail"],
      color: dark ? "border-white/10" : "border-black/5",
      bg: dark ? "bg-white/[0.02]" : "bg-white",
      btn: "Déployer_Gratuit",
      accent: "#ffffff"
    },
    {
      name: "Professional_Pro",
      price: "29",
      features: ["Top_Ranking Explorer", "Réservations illimitées", "0% Commission", "Dashboard Avancé", "Gestion Planning"],
      color: "border-[#bc13fe]/50",
      bg: dark ? "bg-[#bc13fe]/5" : "bg-[#fdf4ff]",
      btn: "Activer_PRO",
      popular: true,
      accent: "#bc13fe"
    },
    {
      name: "Agency_Network",
      price: "79",
      features: ["Multi-comptes staff", "Statistiques Expert", "API Accès", "Support Prioritaire 24/7", "Badge Vérifié"],
      color: "border-[#00f2ff]/50",
      bg: dark ? "bg-[#00f2ff]/5" : "bg-[#f0fdff]",
      btn: "Contact_Sales",
      accent: "#00f2ff"
    }
  ];

  return (
    <section className={`py-24 md:py-32 px-6 animate-in fade-in duration-700 ${dark ? 'bg-[#0a0a0b]' : 'bg-[#fcfcfc]'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* EN-TÊTE ÉPURÉ */}
        <div className="text-center mb-20 space-y-4">
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight uppercase italic ${dark ? 'text-white' : 'text-slate-900'}`}>
            Solutions <span className="text-[#bc13fe]">Professionnelles</span>
          </h2>
          <p className="text-[10px] md:text-[11px] font-medium tracking-[0.4em] uppercase opacity-50 italic">
            Choisissez le niveau d'intégration adapté à votre studio_
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative border p-8 md:p-10 rounded-[40px] flex flex-col transition-all duration-500 hover:shadow-2xl ${plan.color} ${plan.bg} ${dark ? 'backdrop-blur-sm' : 'shadow-sm'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-8 bg-[#bc13fe] text-white text-[9px] font-bold px-4 py-1.5 rounded-full italic tracking-widest uppercase">
                  Option_Recommandée
                </div>
              )}
              
              <div className="mb-10 text-left">
                <h3 className={`text-xs font-bold tracking-[0.3em] uppercase opacity-40 mb-2 ${dark ? 'text-white' : 'text-black'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold italic ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}€
                  </span>
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">/ mois</span>
                </div>
              </div>

              {/* LISTE AFFINÉE */}
              <ul className="space-y-4 mb-12 flex-grow">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-4 text-[11px] md:text-[12px] font-medium tracking-wide ${dark ? 'text-white/70' : 'text-slate-600'}`}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: plan.accent, opacity: 0.6 }}></div>
                    <span className="uppercase">{f}</span>
                  </li>
                ))}
              </ul>

              {/* BOUTON ÉLÉGANT */}
              <button 
                onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
                className={`w-full py-4 md:py-5 rounded-2xl font-bold uppercase text-[10px] md:text-[11px] tracking-[0.2em] transition-all duration-300
                ${plan.popular 
                  ? 'bg-[#bc13fe] text-white hover:bg-[#a611e0] shadow-lg shadow-[#bc13fe]/20' 
                  : (dark ? 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-black' : 'bg-slate-900 text-white hover:bg-slate-800')}
              `}>
                {plan.btn}
              </button>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}