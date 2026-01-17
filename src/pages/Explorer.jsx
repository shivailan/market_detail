import { useState } from 'react';

export default function Explorer({ detailers, onSelectPro, dark }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');

  const cities = [...new Set(detailers.map(pro => pro.adresse?.split(',').pop().trim() || pro.adresse))].filter(Boolean);

  const filtered = detailers.filter(pro => {
    const searchString = searchTerm.toLowerCase();
    const matchSearch = pro.nom_commercial?.toLowerCase().includes(searchString) || 
                        pro.adresse?.toLowerCase().includes(searchString);
    const matchCity = cityFilter === '' || pro.adresse?.toLowerCase().includes(cityFilter.toLowerCase());
    const matchExpertise = filterExpertise === '' || 
                           pro.custom_tarifs?.some(t => t.service.toLowerCase().includes(filterExpertise.toLowerCase())) ||
                           pro.bio?.toLowerCase().includes(filterExpertise.toLowerCase());

    return matchSearch && matchCity && matchExpertise;
  });

  // --- NOUVELLES COULEURS PLUS CLAIRES ---
  const glassClass = dark 
    ? 'bg-white/[0.08] border-white/20 backdrop-blur-2xl' // Plus blanc et plus flou en sombre
    : 'bg-white/70 border-black/10 backdrop-blur-xl shadow-lg'; // Fond blanc laiteux en clair
  
  const inputBg = dark ? 'bg-white/10' : 'bg-gray-100';
  const pageBg = dark ? 'bg-[#0a0a0b]' : 'bg-[#f8f9fa]';

  return (
    <div className={`min-h-screen pt-40 pb-20 px-6 md:px-12 animate-in fade-in duration-700 font-black italic uppercase ${pageBg} ${dark ? 'text-white' : 'text-black'}`}>
      
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER : PLUS DE CONTRASTE */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div className="text-left">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]"></span>
                  <span className="text-[#00f2ff] text-[10px] tracking-[0.6em] drop-shadow-md">NETWORK_ACTIVE_NODE</span>
                </div>
                <h2 className="text-6xl md:text-8xl tracking-tighter leading-[0.8] uppercase font-black">
                  EXPLORER_<span className={dark ? 'text-white' : 'text-[#bc13fe]'}>SATELLITE.</span>
                </h2>
            </div>
            
            <div className={`p-6 rounded-[35px] border ${glassClass} flex gap-12`}>
                <div className="text-right">
                    <p className="text-4xl text-[#00f2ff] leading-none tracking-tighter drop-shadow-sm">{filtered.length}</p>
                    <p className="text-[8px] opacity-50 mt-1 tracking-widest">UNITÉS_EN_LIGNE</p>
                </div>
                <div className="text-right border-l border-current/10 pl-12">
                    <p className="text-4xl leading-none tracking-tighter text-[#bc13fe]">{cities.length}</p>
                    <p className="text-[8px] opacity-50 mt-1 tracking-widest">ZONES_TOTALES</p>
                </div>
            </div>
        </div>

        {/* TERMINAL DE FILTRES : PLUS CLAIR ET LISIBLE */}
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 mb-16 p-5 rounded-[40px] border ${glassClass}`}>
          <div className="md:col-span-5 relative">
            <input 
                type="text" 
                placeholder="RECHERCHER UN STUDIO..." 
                className={`w-full p-6 pl-10 rounded-[25px] border-none outline-none focus:ring-2 ring-[#00f2ff] transition-all text-[11px] tracking-[0.2em] font-black uppercase ${inputBg}`}
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="md:col-span-3 relative">
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className={`w-full p-6 rounded-[25px] border-none outline-none cursor-pointer text-[11px] tracking-[0.2em] font-black uppercase ${inputBg}`}
            >
              <option value="">VILLE (TOUTES)</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 relative">
            <select 
              className={`w-full p-6 rounded-[25px] border-none outline-none cursor-pointer text-[11px] tracking-[0.2em] font-black uppercase ${inputBg}`}
              onChange={(e) => setFilterExpertise(e.target.value)}
            >
              <option value="">PROTOCOLE_TECHNIQUE</option>
              <option value="céramique">CÉRAMIQUE</option>
              <option value="polissage">POLISSAGE</option>
              <option value="intérieur">INTÉRIEUR</option>
            </select>
          </div>
        </div>

        {/* GRID CARTES : PLUS DE LUMIÈRE ET DE RELIEF */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((pro) => (
            <div 
                key={pro.id} 
                onClick={() => onSelectPro(pro)}
                className={`group relative rounded-[55px] border transition-all duration-700 cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(0,242,255,0.3)] ${glassClass}`}
            >
              {/* IMAGE PLUS CLAIRE AU SURVOL */}
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

              {/* CONTENU PLUS AÉRÉ */}
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

              {/* SCAN LINE PLUS DISCRÈTE */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f2ff] opacity-0 group-hover:opacity-40 animate-scan-slow"></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scan-slow { 0% { top: 0%; } 100% { top: 100%; } }
        .animate-scan-slow { animation: scan-slow 2.5s infinite linear; }
      `}</style>
    </div>
  );
}