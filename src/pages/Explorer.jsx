import { useEffect, useState } from 'react';

// Liste identique à celle du ProCMS pour assurer la correspondance parfaite
const SPECIALITIES_LIST = [
  "Lavage Manuel", 
  "Polissage", 
  "Protection Céramique", 
  "Pose de PPF", 
  "Nettoyage Intérieur", 
  "Rénovation Cuir", 
  "Optiques de Phare", 
  "Ciel étoilé", 
  "Vitres Teintées"
];

export default function Explorer({ detailers = [], onSelectPro, dark, filters }) {
    // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- SYNCHRONISATION AVEC LA LANDING ---
  // Dès qu'on arrive de la Landing avec un filtre (ex: Polissage), on l'applique ici
  useEffect(() => {
    if (filters && filters.service) {
      setFilterExpertise(filters.service);
      setShowMobileFilters(false);
    }
  }, [filters]);

  // Extraction dynamique des villes à partir de la liste des detailers
  const cities = [...new Set(detailers.map(pro => {
    const parts = pro.adresse?.split(',');
    return parts ? parts.pop().trim() : '';
  }))].filter(Boolean);

  // --- LOGIQUE DE FILTRAGE ---
const filtered = (detailers || []).filter(pro => {
      const searchString = searchTerm.toLowerCase();
    
    // 1. Recherche Textuelle (Nom ou Adresse)
    const matchSearch = pro.nom_commercial?.toLowerCase().includes(searchString) || 
                        pro.adresse?.toLowerCase().includes(searchString);

    // 2. Filtre Ville
    const matchCity = cityFilter === '' || pro.adresse?.toLowerCase().includes(cityFilter.toLowerCase());

    // 3. Filtre Expertise (Tableau pro.expertise coché par le Pro)
    const matchExpertise = filterExpertise === '' || 
                           (pro.expertise && pro.expertise.includes(filterExpertise));

    return matchSearch && matchCity && matchExpertise;
  });

  const glassClass = dark 
    ? 'bg-white/[0.08] border-white/20 backdrop-blur-2xl' 
    : 'bg-white/70 border-black/10 backdrop-blur-xl shadow-lg';
  
  const borderClass = dark ? 'border-white/10' : 'border-black/5';
  const pageBg = dark ? 'bg-[#0a0a0b]' : 'bg-[#f8f9fa]';

  return (
    <div className={`min-h-screen pt-32 md:pt-40 pb-20 px-6 md:px-12 animate-in fade-in duration-700 font-black italic uppercase ${pageBg} ${dark ? 'text-white' : 'text-black'}`}>
      
      <div className="max-w-[1600px] mx-auto">
        
        {/* EN-TÊTE DE SECTION */}
        <div className="mb-12 text-left">
           <span className="text-[10px] tracking-[0.5em] text-[#00f2ff]">Réseau_Localisé</span>
           <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
             Trouvez votre <span className="text-[#bc13fe]">Expert</span>
           </h1>
        </div>

        {/* BARRE DE CONTRÔLE MOBILE */}
        <div className="md:hidden flex flex-col gap-4 mb-8">
            <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`w-full p-6 rounded-[30px] border flex justify-between items-center transition-all ${showMobileFilters ? 'bg-[#bc13fe] text-white border-[#bc13fe]' : (dark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5')}`}
            >
                <span className="text-[10px] tracking-[0.3em]">
                    {showMobileFilters ? 'PROTOCOLE_ACTIF_[-]' : 'OUVRIR_FILTRES_[+]'}
                </span>
                <i className={`fas ${showMobileFilters ? 'fa-times' : 'fa-sliders-h'}`}></i>
            </button>
        </div>

        {/* TERMINAL DE FILTRES */}
        <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-col space-y-6 mb-16 p-8 rounded-[40px] border ${borderClass} ${glassClass} text-left`}>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 relative">
                    <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-[#00f2ff] opacity-40"></i>
                    <input 
                      type="text" 
                      value={searchTerm}
                      placeholder="RECHERCHER UN ATELIER..." 
                      className={`w-full p-6 pl-14 rounded-[30px] outline-none transition-all text-[11px] tracking-[0.2em] ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>

                <div className="md:col-span-3">
                    <select 
                      value={cityFilter} 
                      onChange={(e) => setCityFilter(e.target.value)} 
                      className={`w-full p-6 rounded-[30px] outline-none cursor-pointer text-[11px] font-black uppercase ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
                    >
                      <option value="">TOUTE_LA_FRANCE</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>

                <div className="md:col-span-3">
                    <select 
                      value={filterExpertise}
                      onChange={(e) => setFilterExpertise(e.target.value)}
                      className={`w-full p-6 rounded-[30px] outline-none cursor-pointer text-[11px] font-black uppercase ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
                    >
                      <option value="">TOUTES_EXPERTISES</option>
                      {SPECIALITIES_LIST.map(spec => (
                        <option key={spec} value={spec}>{spec.toUpperCase()}</option>
                      ))}
                    </select>
                </div>
            </div>

            {/* BADGES ACTIFS (UX : Permet de voir et supprimer les filtres) */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-current/10">
                <span className="text-[8px] font-black opacity-30 tracking-widest italic uppercase">Paramètres_actifs :</span>
                
                <div className="flex flex-wrap gap-2">
                    {filterExpertise && (
                        <button 
                          onClick={() => setFilterExpertise('')}
                          className="px-4 py-2 bg-[#bc13fe]/20 text-[#bc13fe] border border-[#bc13fe]/30 rounded-full text-[9px] flex items-center gap-2 hover:bg-[#bc13fe] hover:text-white transition-all"
                        >
                          SERVICE: {filterExpertise} <i className="fas fa-times text-[7px]"></i>
                        </button>
                    )}
                    {cityFilter && (
                        <button 
                          onClick={() => setCityFilter('')}
                          className="px-4 py-2 bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 rounded-full text-[9px] flex items-center gap-2 hover:bg-[#00f2ff] hover:text-black transition-all"
                        >
                          VILLE: {cityFilter} <i className="fas fa-times text-[7px]"></i>
                        </button>
                    )}
                    {(filterExpertise || cityFilter || searchTerm) && (
                        <button 
                          onClick={() => {setFilterExpertise(''); setCityFilter(''); setSearchTerm('');}}
                          className="text-[8px] font-black opacity-40 hover:opacity-100 transition-opacity ml-2"
                        >
                          [RÉINITIALISER_TOUT]
                        </button>
                    )}
                    {!filterExpertise && !cityFilter && !searchTerm && (
                        <span className="text-[8px] font-black opacity-20 italic">Aucun_filtre_appliqué</span>
                    )}
                </div>

                <div className="ml-auto text-[10px] font-black opacity-40">
                    {filtered.length} UNITÉS_TROUVÉES
                </div>
            </div>
        </div>

        {/* GRID CARTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((pro) => (
            <div key={pro.id} onClick={() => onSelectPro(pro)} className={`group relative rounded-[55px] border transition-all duration-700 cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(188,19,254,0.2)] ${glassClass}`}>
              
              <div className="h-48 md:h-60 overflow-hidden relative">
                <img 
                  src={pro.cover_url || "https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=2071"} 
                  className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110 opacity-80" 
                  alt="Studio" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${dark ? 'from-[#0a0a0b]' : 'from-white/80'} via-transparent to-transparent`}></div>
                <div className="absolute top-6 left-6 px-5 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black text-black dark:text-white shadow-lg border border-white/20">
                   <i className="fas fa-location-dot mr-2 text-[#bc13fe]"></i>
                   {pro.adresse?.split(',').pop() || 'FRANCE'}
                </div>
              </div>

              <div className="p-6 md:p-10 -mt-8 md:-mt-10 relative z-10 text-left">
                <div className={`p-6 md:p-8 rounded-[35px] md:rounded-[45px] border border-white/20 shadow-xl transition-all ${dark ? 'bg-white/5' : 'bg-white/90'}`}>
                  
                  {/* BADGES EXPERTISES */}
                  <div className="flex flex-wrap gap-1.5 mb-4 min-h-[20px]">
                    {pro.expertise && pro.expertise.length > 0 ? (
                      <>
                        {pro.expertise.slice(0, 2).map((exp, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#bc13fe]/10 text-[#bc13fe] border border-[#bc13fe]/20 rounded-lg text-[7px] font-black uppercase tracking-wider">
                            {exp}
                          </span>
                        ))}
                        {pro.expertise.length > 2 && <span className="text-[7px] opacity-30 self-center">+{pro.expertise.length - 2}</span>}
                      </>
                    ) : (
                      <span className="text-[7px] opacity-20 uppercase tracking-widest italic">Standard_Protocol</span>
                    )}
                  </div>

                  <h3 className="text-xl md:text-2xl leading-none mb-4 tracking-tighter group-hover:text-[#bc13fe] transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                    {pro.nom_commercial}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-4 md:mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                      <div>
                          <p className="text-[8px] opacity-40 mb-1">À PARTIR DE</p>
                          <p className="text-2xl md:text-3xl font-black text-[#00f2ff]">{pro.services_list?.[0]?.price || '49'}€</p>
                      </div>
                      <button className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${dark ? 'bg-white text-black hover:bg-[#00f2ff]' : 'bg-black text-white hover:bg-[#bc13fe]'}`}>
                          <i className="fas fa-chevron-right"></i>
                      </button>
                  </div>
                </div>
              </div>
              
              {/* Animation Laser au survol */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f2ff] opacity-0 group-hover:opacity-40 animate-scan-slow"></div>
            </div>
          ))}
        </div>
        
        {/* ÉCRAN VIDE */}
        {filtered.length === 0 && (
            <div className="py-20 md:py-40 text-center opacity-20">
                <i className="fas fa-satellite-dish text-4xl md:text-6xl mb-8 block"></i>
                <p className="text-[10px] md:tracking-[1em]">AUCUN_SIGNAL_TROUVÉ_DANS_CETTE_ZONE</p>
            </div>
        )}
      </div>

      <style>{`
        @keyframes scan-slow { 0% { top: 0%; } 100% { top: 100%; } }
        .animate-scan-slow { animation: scan-slow 2.5s infinite linear; }
      `}</style>
    </div>
  );
}