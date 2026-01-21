import { useState } from 'react';

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

export default function Explorer({ detailers, onSelectPro, dark }) {
  // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dispoFilter, setDispoFilter] = useState('');
  
  // NOUVEL ÉTAT POUR LE SWITCH MOBILE
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extraction dynamique des villes
  const cities = [...new Set(detailers.map(pro => pro.adresse?.split(',').pop().trim() || pro.adresse))].filter(Boolean);

  // --- LOGIQUE DE FILTRAGE ---
  const filtered = detailers.filter(pro => {
    const searchString = searchTerm.toLowerCase();
    
    // 1. Recherche Textuelle
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
        
        {/* BARRE DE CONTRÔLE MOBILE (SWITCH FILTRES) */}
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
            {!showMobileFilters && (
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="RECHERCHE_RAPIDE..." 
                      className={`w-full p-5 pl-12 rounded-[25px] text-[10px] outline-none ${dark ? 'bg-white/5' : 'bg-black/5'}`} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-[#00f2ff] text-[10px]"></i>
                 </div>
            )}
        </div>

        {/* TERMINAL DE FILTRES */}
        <div className={`${showMobileFilters ? 'flex animate-in slide-in-from-top-4' : 'hidden'} md:flex flex-col space-y-6 mb-16 p-8 rounded-[40px] md:rounded-[50px] border ${borderClass} ${glassClass}`}>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative group">
                    <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-[#00f2ff] opacity-40"></i>
                    <input 
                      type="text" 
                      placeholder="ID_STUDIO_OU_NOM..." 
                      className={`w-full p-6 pl-14 rounded-[30px] outline-none transition-all text-[11px] tracking-[0.2em] ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>

                <div className="md:col-span-4 relative">
                    <select 
                      value={cityFilter} 
                      onChange={(e) => setCityFilter(e.target.value)} 
                      className={`w-full p-6 rounded-[30px] outline-none cursor-pointer text-[11px] ${dark ? 'bg-white/5' : 'bg-black/5'}`}
                    >
                      <option value="">VILLE_RESEAU (TOUTES)</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* --- FILTRE EXPERTISE : Généré depuis la liste globale --- */}
                <div className="relative">
                    <select 
                      value={filterExpertise}
                      onChange={(e) => setFilterExpertise(e.target.value)}
                      className={`w-full p-5 rounded-[25px] outline-none cursor-pointer text-[10px] font-black uppercase ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
                    >
                      <option value="">TOUTES_EXPERTISES</option>
                      {SPECIALITIES_LIST.map(spec => (
                        <option key={spec} value={spec}>{spec.toUpperCase()}</option>
                      ))}
                    </select>
                </div>

            </div>

            {/* BADGES ACTIFS */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-current/5">
                <span className="text-[8px] font-black opacity-30 tracking-widest italic">Paramètres_actifs :</span>
                <div className="flex gap-2">
                    {searchTerm && <span className="px-3 py-1 bg-[#00f2ff]/10 text-[#00f2ff] rounded-full text-[8px]">SEARCH: {searchTerm}</span>}
                    {cityFilter && <span className="px-3 py-1 bg-[#bc13fe]/10 text-[#bc13fe] rounded-full text-[8px]">LOC: {cityFilter}</span>}
                    {filterExpertise && <span className="px-3 py-1 bg-white/10 rounded-full text-[8px]">TECH: {filterExpertise}</span>}
                </div>
            </div>
        </div>

        {/* GRID CARTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((pro) => (
            <div key={pro.id} onClick={() => onSelectPro(pro)} className={`group relative rounded-[55px] border transition-all duration-700 cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(0,242,255,0.3)] ${glassClass}`}>
              <div className="h-48 md:h-60 overflow-hidden relative">
                <img src={pro.cover_url || "https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=2071"} className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-105 opacity-80" alt="Studio" />
                <div className={`absolute inset-0 bg-gradient-to-t ${dark ? 'from-[#0a0a0b]' : 'from-white/80'} via-transparent to-transparent`}></div>
                <div className="absolute top-6 left-6 px-5 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black text-black dark:text-white shadow-lg border border-white/20">
                   <i className="fas fa-location-dot mr-2 text-[#bc13fe]"></i>{pro.adresse?.split(',').pop() || 'FRANCE'}
                </div>
              </div>

              <div className="p-6 md:p-10 -mt-8 md:-mt-10 relative z-10">
                <div className={`p-6 md:p-8 rounded-[35px] md:rounded-[45px] border border-white/20 shadow-xl transition-all ${dark ? 'bg-white/5' : 'bg-white/90'}`}>
                  
                  {/* BADGES EXPERTISES (Basé sur le nouveau système pro.expertise) */}
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
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f2ff] opacity-0 group-hover:opacity-40 animate-scan-slow"></div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
            <div className="py-20 md:py-40 text-center opacity-20">
                <i className="fas fa-satellite-dish text-4xl md:text-6xl mb-8 block"></i>
                <p className="text-[10px] md:tracking-[1em]">AUCUN_SIGNAL_TROUVÉ</p>
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