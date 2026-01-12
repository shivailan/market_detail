import { useState } from 'react';

export default function ProPublicProfile({ pro, session, onBookingClick, onClose, dark }) {
  if (!pro) return null;

  // Extraction sécurisée des données
  const cover = pro.cover_url || "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=2070";
  const showcases = pro.showcase_before_after || [];
  const catalog = pro.catalog_images || [];
  const stats = pro.stats_data || { xp: '5', cars: '250', shield: '9H' };
  const services = pro.services_list || [];

  return (
    <div className={`fixed inset-0 z-[1001] overflow-y-auto font-['Outfit'] animate-in slide-in-from-bottom-10 duration-700 text-left font-black italic uppercase ${dark ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      {/* HEADER NAVIGATION INTERNE */}
      <nav className={`fixed top-0 left-0 w-full p-6 flex justify-between items-center z-[110] backdrop-blur-xl border-b ${dark ? 'bg-black/60 border-white/5' : 'bg-white/60 border-black/5 shadow-sm'}`}>
        <button onClick={onClose} className="group flex items-center gap-3 text-[9px] tracking-[0.3em] hover:text-[#bc13fe] transition-all italic">
          <i className="fas fa-arrow-left"></i> Retour
        </button>
        <div className="logo-font text-[11px] tracking-[0.4em] opacity-80 uppercase">{pro.nom_commercial}</div>
        <button onClick={onBookingClick} className={`px-6 py-2 rounded-full text-[8px] transition-all ${dark ? 'bg-[#bc13fe] text-white' : 'bg-black text-white'}`}>
          Reserver_Soin
        </button>
      </nav>

      {/* SECTION HERO DU PRO */}
      <section className="relative h-[45vh] md:h-[50vh] flex items-end pb-12 px-6 md:px-20 overflow-hidden">
        <img src={cover} className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105" alt="Cover" />
        <div className={`absolute inset-0 bg-gradient-to-t ${dark ? 'from-[#050505]' : 'from-[#fcfcfc]'} via-transparent to-transparent`}></div>
        <div className="relative z-10 w-full">
          <h1 className="text-5xl md:text-[7vw] font-black italic uppercase tracking-tighter leading-none mb-4 logo-font">{pro.nom_commercial}</h1>
          <p className={`text-[9px] uppercase tracking-[0.4em] font-black italic ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            <i className="fas fa-location-dot text-[#bc13fe] mr-2"></i>{pro.adresse}
          </p>
        </div>
      </section>

      {/* SECTION STATS IMPACT */}
      <section className={`grid grid-cols-2 md:grid-cols-4 border-y ${dark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'} backdrop-blur-md`}>
        <div className={`p-8 border-r ${dark ? 'border-white/5' : 'border-black/5'} text-center`}>
            <p className="text-3xl text-[#bc13fe] mb-1">{stats.xp}+</p>
            <p className="text-[7px] opacity-40 tracking-widest uppercase italic">Années_Exp</p>
        </div>
        <div className={`p-8 border-r ${dark ? 'border-white/5' : 'border-black/5'} text-center`}>
            <p className="text-3xl text-[#00f2ff] mb-1">{stats.cars}+</p>
            <p className="text-[7px] opacity-40 tracking-widest uppercase italic">Missions</p>
        </div>
        <div className={`p-8 border-r ${dark ? 'border-white/5' : 'border-black/5'} text-center`}>
            <p className="text-3xl mb-1">{stats.shield}</p>
            <p className="text-[7px] opacity-40 tracking-widest uppercase italic">Grade_Protection</p>
        </div>
        <div className="p-8 text-center">
            <p className="text-3xl text-[#bc13fe] mb-1">100%</p>
            <p className="text-[7px] opacity-40 tracking-widest uppercase italic">Satisfaction</p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 md:px-20 py-20 grid grid-cols-12 gap-16 uppercase font-black italic">
        <div className="col-span-12 lg:col-span-8 space-y-32">
          {/* Manifesto */}
          <section>
            <h4 className="text-[9px] tracking-[0.6em] text-[#bc13fe] mb-8 border-l-2 border-[#bc13fe] pl-6 italic font-black">01. Studio_Manifesto</h4>
            <p className="text-2xl md:text-4xl font-light italic leading-tight mb-8 normal-case">{pro.about_text || "Maîtrise absolue du detailing."}</p>
            <p className="text-xs text-slate-500 leading-loose tracking-widest normal-case italic">{pro.bio}</p>
          </section>

          {/* Services */}
          <section>
            <h4 className={`text-[9px] tracking-[0.6em] mb-12 border-l-2 pl-6 italic font-black ${dark?'text-[#00f2ff] border-[#00f2ff]':'text-cyan-600 border-cyan-600'}`}>02. Engineering_Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((s, i) => (
                <div key={i} className={`p-10 border rounded-[40px] transition-all group ${dark?'bg-white/5 border-white/5 hover:border-[#00f2ff]/30':'bg-black/5 border-black/5 hover:border-[#00f2ff]'}`}>
                  <h5 className="text-sm text-[#00f2ff] mb-4 font-black italic">{s.titre}</h5>
                  <p className="text-[10px] normal-case leading-loose font-black italic opacity-60">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Catalogue */}
          {catalog.length > 0 && (
            <section>
              <h4 className="text-[9px] tracking-[0.6em] text-white mb-8 border-l-2 border-white pl-6 italic font-black">03. Visual_Catalog</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {catalog.map((img, i) => (
                  <div key={i} className={`aspect-square rounded-3xl overflow-hidden border group ${dark?'border-white/10':'border-black/10'}`}>
                    <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Portfolio work" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* COLONNE RÉSERVATION / TARIFS */}
        <aside className="col-span-12 lg:col-span-4">
          <div className={`sticky top-32 p-10 rounded-[50px] shadow-2xl border ${dark?'bg-white text-black border-white/5':'bg-black text-white border-black/5'}`}>
            <h5 className="text-[9px] tracking-[0.4em] mb-8 border-b pb-4 italic uppercase font-black">Protocol_Pricing</h5>
            <div className="space-y-5 mb-10">
              {pro.custom_tarifs?.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] border-b pb-2 uppercase border-current/10 font-black">
                  <span className="opacity-40 italic">{t.service}</span>
                  <span className="text-xl tracking-tighter">{t.price}€</span>
                </div>
              ))}
            </div>
            <button onClick={onBookingClick} className={`w-full py-6 rounded-3xl text-[9px] tracking-[0.4em] transition-all shadow-xl font-black uppercase ${dark?'bg-black text-white hover:bg-[#bc13fe]':'bg-[#bc13fe] text-white hover:bg-white hover:text-black'}`}>
              Initier RDV
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}