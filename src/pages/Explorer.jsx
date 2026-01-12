import { useState } from 'react';

export default function Explorer({ detailers, onSelectPro, dark }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');

  const filtered = detailers.filter(pro => {
    const matchSearch = pro.nom_commercial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        pro.adresse?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchExpertise = filterExpertise === '' || 
                           pro.services_list?.some(s => s.titre.toLowerCase().includes(filterExpertise.toLowerCase()));
    return matchSearch && matchExpertise;
  });

  const glassClass = dark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.02] border-black/10';
  const inputBg = dark ? 'bg-black/40' : 'bg-white';

  return (
    <div className={`min-h-screen pt-40 pb-20 px-6 md:px-12 animate-in fade-in duration-700 font-['Outfit'] font-black italic uppercase ${dark ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- HEADER & STATS --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="text-left">
                <span className="text-[#bc13fe] text-[10px] tracking-[0.6em] mb-2 block">DATABASE_ACCESS</span>
                <h2 className="text-6xl md:text-8xl tracking-tighter leading-none uppercase">RÉSEAU_<span className="text-transparent" style={{ WebkitTextStroke: dark ? '1px white' : '1px black' }}>GLOBAL.</span></h2>
            </div>
            <div className="flex gap-10">
                <div className="text-right">
                    <p className="text-3xl text-[#00f2ff] leading-none">{filtered.length}</p>
                    <p className="text-[8px] opacity-40 tracking-[0.3em]">UNITÉS_ACTIVES</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl text-[#bc13fe] leading-none">V.4.0</p>
                    <p className="text-[8px] opacity-40 tracking-[0.3em]">VERSION_CORE</p>
                </div>
            </div>
        </div>

        {/* --- RECHERCHE & FILTRES (Look Terminal) --- */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-20 p-4 rounded-[30px] border ${glassClass}`}>
          <div className="md:col-span-3 relative">
            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 opacity-20 text-[12px]"></i>
            <input 
                type="text" 
                placeholder="RECHERCHER PAR NOM OU VILLE (ID_ZONE)..." 
                className={`w-full p-6 pl-16 rounded-[20px] border-none outline-none focus:ring-2 ring-[#bc13fe]/40 transition-all text-[11px] tracking-[0.2em] font-black uppercase ${inputBg}`}
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <select 
            className={`p-6 rounded-[20px] border-none outline-none cursor-pointer text-[11px] tracking-[0.2em] font-black uppercase ${inputBg}`}
            onChange={(e) => setFilterExpertise(e.target.value)}
          >
            <option value="">FILTRER_EXPERTISE</option>
            <option value="céramique">CÉRAMIQUE</option>
            <option value="polissage">POLISSAGE</option>
            <option value="intérieur">INTÉRIEUR</option>
          </select>
        </div>

        {/* --- GRID DES CARTES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((pro) => (
            <div 
                key={pro.id} 
                className={`group relative rounded-[45px] border overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(188,19,254,0.15)] ${glassClass}`}
            >
              {/* Image de fond / Cover minimaliste */}
              <div className="h-40 overflow-hidden relative opacity-40 group-hover:opacity-100 transition-opacity">
                <img src={pro.cover_url || "https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=2071"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Studio" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              </div>

              {/* Contenu */}
              <div className="p-10 text-left relative">
                {/* Status Badge */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[8px] bg-[#00f2ff]/10 text-[#00f2ff] px-3 py-1 rounded-full tracking-[0.3em]">ACTIVE_UNIT</span>
                    <span className="text-[10px] opacity-40 font-black">ID_{pro.id.slice(0,4)}</span>
                </div>

                <h3 className="text-2xl uppercase leading-none mb-2 font-black group-hover:text-[#bc13fe] transition-colors">{pro.nom_commercial}</h3>
                <p className="text-[10px] opacity-40 mb-10 tracking-[0.2em] flex items-center gap-2 italic">
                    <i className="fas fa-location-dot text-[#bc13fe]"></i>{pro.adresse}
                </p>

                {/* Footer Carte */}
                <div className="flex items-center justify-between pt-8 border-t border-current/5">
                    <div>
                        <p className="text-[7px] opacity-30 tracking-widest uppercase">Start_Price</p>
                        <p className="text-xl font-black">{pro.custom_tarifs?.[0]?.price || '??'}€</p>
                    </div>
                    <button 
                        onClick={() => onSelectPro(pro)} 
                        className={`px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 ${dark ? 'bg-white text-black hover:bg-[#bc13fe] hover:text-white' : 'bg-black text-white hover:bg-[#bc13fe]'}`}
                    >
                        ACCESS_PROFILE
                    </button>
                </div>
              </div>

              {/* Effet Laser sur hover */}
              <div className="absolute top-0 left-[-100%] w-full h-[2px] bg-gradient-to-r from-transparent via-[#bc13fe] to-transparent group-hover:left-[100%] transition-all duration-[1.5s] ease-in-out"></div>
            </div>
          ))}
        </div>

        {/* --- EMPTY STATE --- */}
        {filtered.length === 0 && (
            <div className="py-40 text-center">
                <i className="fas fa-radar text-6xl opacity-10 mb-8 animate-pulse"></i>
                <h3 className="text-2xl opacity-20 tracking-[0.5em]">AUCUNE_UNITÉ_DÉTECTÉE</h3>
                <button onClick={() => {setSearchTerm(''); setFilterExpertise('')}} className="mt-8 text-[10px] text-[#00f2ff] underline tracking-widest">RÉINITIALISER_SCAN</button>
            </div>
        )}
      </div>
    </div>
  );
}