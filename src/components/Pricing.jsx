
const Pricing = ({ dark }) => {
  const plans = [
    {
      name: "Starter_Unit",
      price: "0",
      features: ["Visibilité basique", "5 Réservations / mois", "Commission 15%", "Support Mail"],
      color: "border-white/10",
      btn: "Déployer_Gratuit"
    },
    {
      name: "Professional_Pro",
      price: "29",
      features: ["Top_Ranking Explorer", "Réservations illimitées", "0% Commission", "Dashboard Avancé", "Gestion Planning"],
      color: "border-[#bc13fe] shadow-[0_0_30px_rgba(188,19,254,0.2)]",
      btn: "Activer_PRO",
      popular: true
    },
    {
      name: "Agency_Network",
      price: "79",
      features: ["Multi-comptes staff", "Statistiques Expert", "API Accès", "Support Prioritaire 24/7", "Badge Vérifié"],
      color: "border-[#00f2ff] shadow-[0_0_30px_rgba(0,242,255,0.2)]",
      btn: "Contact_Sales"
    }
  ];

  return (
    <section className={`py-20 px-6 ${dark ? 'bg-transparent' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
            Scale_Your_Business<span className={dark ? 'text-[#bc13fe]' : 'text-[#bc13fe]'}>.</span>
          </h2>
          <p className="opacity-50 font-bold text-sm tracking-widest">CHOISISSEZ VOTRE NIVEAU D'INTÉGRATION</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
              className={`relative border-2 p-10 rounded-[40px] flex flex-col ${plan.color} ${dark ? 'bg-black/40 backdrop-blur-xl' : 'bg-white'}`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#bc13fe] text-white text-[10px] font-black px-4 py-2 rounded-full italic">
                  RECOMMANDÉ_SYSTÈME
                </span>
              )}
              
              <h3 className="text-xl font-black italic mb-2 uppercase">{plan.name}</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-black italic">{plan.price}€</span>
                <span className="text-[10px] opacity-40 ml-2">/ MOIS</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center text-[11px] font-bold opacity-80">
                    <span className={`mr-3 h-1 w-1 rounded-full ${plan.popular ? 'bg-[#bc13fe]' : 'bg-white'}`}></span>
                    {f.toUpperCase()}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-5 rounded-2xl font-black italic uppercase text-[11px] transition-all
                ${plan.popular 
                  ? 'bg-[#bc13fe] text-white hover:scale-105' 
                  : 'border border-white/20 hover:bg-white hover:text-black'}`}>
                {plan.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;