import { useState } from 'react';

export default function Explorer({ detailers, onSelectPro, dark }) {
  // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dispoFilter, setDispoFilter] = useState('');

  // Extraction dynamique des villes
  const cities = [...new Set(detailers.map(pro => pro.adresse?.split(',').pop().trim() || pro.adresse))].filter(Boolean);

  // --- LOGIQUE DE FILTRAGE AMÉLIORÉE ---
  const filtered = detailers.filter(pro => {
    const searchString = searchTerm.toLowerCase();
    
    // 1. Recherche Textuelle
    const matchSearch = pro.nom_commercial?.toLowerCase().includes(searchString) || 
                        pro.adresse?.toLowerCase().includes(searchString);

    // 2. Filtre Ville
    const matchCity = cityFilter === '' || pro.adresse?.toLowerCase().includes(cityFilter.toLowerCase());

    // 3. Filtre Expertise (Scanne les tarifs et la bio)
    const matchExpertise = filterExpertise === '' || 
                           pro.custom_tarifs?.some(t => t.service.toLowerCase().includes(filterExpertise.toLowerCase())) ||
                           pro.bio?.toLowerCase().includes(filterExpertise.toLowerCase());

    // 4. Filtre Prix (Simulé sur le premier tarif disponible)
    const firstPrice = pro.custom_tarifs?.[0]?.price || 0;
    const matchPrice = priceFilter === '' || 
                       (priceFilter === 'eco' && firstPrice < 100) ||
                       (priceFilter === 'premium' && firstPrice >= 100 && firstPrice < 500) ||
                       (priceFilter === 'luxury' && firstPrice >= 500);

    // 5. Filtre Rating (Note moyenne)
    const matchRating = ratingFilter === '' || 
                        (ratingFilter === 'cert' && pro.is_verified) || 
                        (parseFloat(pro.rating || 5) >= parseFloat(ratingFilter));

    return matchSearch && matchCity && matchExpertise && matchPrice && matchRating;
  });

  // --- STYLES ---
  const glassClass = dark 
    ? 'bg-white/[0.08] border-white/20 backdrop-blur-2xl' 
    : 'bg-white/70 border-black/10 backdrop-blur-xl shadow-lg';
  
  const borderClass = dark ? 'border-white/10' : 'border-black/5';
  const pageBg = dark ? 'bg-[#0a0a0b]' : 'bg-[#f8f9fa]';

  return (
    <div className={`min-h-screen pt-40 pb-20 px-6 md:px-12 animate-in fade-in duration-700 font-black italic uppercase ${pageBg} ${dark ? 'text-white' : 'text-black'}`}>
      
      <div className="max-w-[1600px] mx-auto">
        
        {/* TERMINAL DE FILTRES : MULTI-PARAMÈTRES PROTOCOLE */}
        <div className={`space-y-6 mb-16 p-8 rounded-[50px] border ${borderClass} ${glassClass}`}>
            
            {/* LIGNE 1 : RECHERCHE ET VILLE */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative group">
                    <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-[#00f2ff] opacity-40 group-focus-within:opacity-100 transition-opacity"></i>
                    <input 
                        type="text" 
                        placeholder="ID_STUDIO_OU_NOM..." 
                        className={`w-full p-6 pl-14 rounded-[30px] outline-none focus:ring-2 ring-[#00f2ff]/30 transition-all text-[11px] tracking-[0.2em] font-black uppercase ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>

                <div className="md:col-span-4 relative">
                    <select 
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className={`w-full p-6 rounded-[30px] outline-none cursor-pointer text-[11px] tracking-[0.2em] font-black uppercase ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
                    >
                      <option value="">VILLE_RESEAU (TOUTES)</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                </div>
            </div>

            {/* LIGNE 2 : EXPERTISE, PRIX, RATING ET DISPO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <select 
                      onChange={(e) => setFilterExpertise(e.target.value)}
                      className={`w-full p-5 rounded-[25px] outline-none cursor-pointer text-[10px] tracking-[0.1em] font-black uppercase ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
                    >
                      <option value="">PROTOCOLE_TECHNIQUE</option>
                      <option value="céramique">TRAITEMENT_CÉRAMIQUE</option>
                      <option value="ppf">PROTECTION_PPF</option>
                      <option value="polissage">CORRECTION_VERNIS</option>
                      <option value="intérieur">DETAILING_INTERIEUR</option>
                    </select>
                </div>

                <div className="relative">
                    <select 
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className={`w-full p-5 rounded-[25px] outline-none cursor-pointer text-[10px] tracking-[0.1em] font-black uppercase ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
                    >
                      <option value="">FOURCHETTE_PRIX</option>
                      <option value="eco">€ (ACCESSIBLE)</option>
                      <option value="premium">€€ (PREMIUM)</option>
                      <option value="luxury">€€€ (PRESTIGE)</option>
                    </select>
                </div>

                <div className="relative">
                    <select 
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className={`w-full p-5 rounded-[25px] outline-none cursor-pointer text-[10px] tracking-[0.1em] font-black uppercase ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
                    >
                      <option value="">SCORE_MINIMUM</option>
                      <option value="4.5">EXCELLENCE (4.5+ ★)</option>
                      <option value="4.0">QUALITÉ (4.0+ ★)</option>
                      <option value="cert">UNITS_CERTIFIÉS_SEULEMENT</option>
                    </select>
                </div>

                <div className="relative">
                    <select 
                      onChange={(e) => setDispoFilter(e.target.value)}
                      className={`w-full p-5 rounded-[25px] outline-none cursor-pointer text-[10px] tracking-[0.1em] font-black uppercase ${dark ? 'bg-white/5 text-[#00f2ff] border-[#00f2ff]/20' : 'bg-black/5 text-black'}`}
                    >
                      <option value="">DISPONIBILITÉ</option>
                      <option value="urgent">DANS LES 48H</option>
                      <option value="week">CETTE SEMAINE</option>
                      <option value="month">SUR RÉSERVATION</option>
                    </select>
                </div>
            </div>

            {/* BADGES ACTIFS */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-current/5">
                <span className="text-[8px] font-black opacity-30 tracking-widest uppercase italic">Paramètres_actifs :</span>
                <div className="flex gap-2">
                    {searchTerm && <span className="px-3 py-1 bg-[#00f2ff]/10 text-[#00f2ff] rounded-full text-[8px] font-black">SEARCH: {searchTerm}</span>}
                    {cityFilter && <span className="px-3 py-1 bg-[#bc13fe]/10 text-[#bc13fe] rounded-full text-[8px] font-black">LOC: {cityFilter}</span>}
                    {filterExpertise && <span className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black">TECH: {filterExpertise}</span>}
                </div>
            </div>
        </div>

        {/* GRID CARTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((pro) => (
            <div 
                key={pro.id} 
                onClick={() => onSelectPro(pro)}
                className={`group relative rounded-[55px] border transition-all duration-700 cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(0,242,255,0.3)] ${glassClass}`}
            >
              <div className="h-60 overflow-hidden relative">
                <img 
                  src={pro.cover_url || "https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=2071"} 
                  className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                  alt="Studio" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${dark ? 'from-[#0a0a0b]' : 'from-white/80'} via-transparent to-transparent`}></div>
                
                <div className="absolute top-6 left-6 px-5 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black text-black dark:text-white shadow-lg border border-white/20">
                   <i className="fas fa-location-dot mr-2 text-[#bc13fe]"></i>{pro.adresse?.split(',').pop() || 'FRANCE'}
                </div>
              </div>

              <div className="p-10 -mt-10 relative z-10">
                <div className={`p-8 rounded-[45px] border border-white/20 shadow-xl transition-all ${dark ? 'bg-white/5' : 'bg-white/90'}`}>
                    <h3 className="text-2xl leading-[0.9] mb-4 tracking-tighter group-hover:text-[#bc13fe] transition-colors">{pro.nom_commercial}</h3>
                    
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                        <div>
                            <p className="text-[8px] opacity-40 mb-1">À PARTIR DE</p>
                            <p className="text-3xl font-black text-[#00f2ff]">{pro.custom_tarifs?.[0]?.price || '49'}€</p>
                        </div>
                        <button className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${dark ? 'bg-white text-black hover:bg-[#00f2ff]' : 'bg-black text-white hover:bg-[#bc13fe]'}`}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f2ff] opacity-0 group-hover:opacity-40 animate-scan-slow"></div>
            </div>
          ))}
        </div>
        
        {/* AUCUN RÉSULTAT */}
        {filtered.length === 0 && (
            <div className="py-40 text-center opacity-20">
                <i className="fas fa-satellite-dish text-6xl mb-8 block"></i>
                <p className="tracking-[1em]">AUCUN_SIGNAL_TROUVÉ</p>
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