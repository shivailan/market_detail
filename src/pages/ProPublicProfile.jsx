import { useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { supabase } from '../lib/supabase'; // Assure-toi que le chemin est correct

export default function ProPublicProfile({ pro, session, onBookingClick, onClose, dark }) {
  if (!pro) return null;

  const [showChat, setShowChat] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reviews, setReviews] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
const reviewsPerPage = 4;
  

  // Effet de scroll pour le header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cover = pro.cover_url || "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=2070";
  const catalog = pro.catalog_images || [];
  const stats = pro.stats_data || { xp: '5', cars: '250', shield: '9H' };

  const renderDescription = (desc) => {
  if (!desc) return null;
  
  // On sépare le texte par les points, points-virgules ou retours à la ligne
  const lines = desc.split(/[;.\n]/).filter(line => line.trim().length > 0);
  
  if (lines.length <= 1) return <p className="text-xs normal-case leading-relaxed font-medium opacity-60 italic border-l-2 border-current/10 pl-6">{desc}</p>;

  return (
    <div className="border-l-2 border-[#00f2ff]/30 pl-6 space-y-2">
      {lines.map((line, index) => (
        <div key={index} className="flex items-start gap-3">
          <span className="text-[#00f2ff] text-[8px] mt-1.5 flex-shrink-0">
             <i className="fas fa-chevron-right"></i>
          </span>
          <p className="text-[11px] normal-case font-medium opacity-70 italic leading-tight">
            {line.trim()}
          </p>
        </div>
      ))}
    </div>
  );
};
useEffect(() => {
  const fetchReviews = async () => {
    // Si supabase n'est pas défini, on arrête tout
    if (!supabase) return;

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('pro_id', pro.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur lors du chargement des avis:", error.message);
    } else {
      setReviews(data || []);
    }
  };

  if (pro?.id) {
    fetchReviews();
  }
}, [pro.id]);
  const getInstaLink = (input) => {
    if (!input) return null;
    return input.startsWith('http') ? input : `https://instagram.com/${input.replace('@', '')}`;
  };

  return (
    <div className={`fixed inset-0 z-[1001] overflow-y-auto font-['Outfit'] animate-in fade-in duration-500 text-left font-black italic uppercase transition-colors ${dark ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      {/* HEADER NAV ULTRA-MODERNE */}
      <nav className={`fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-[110] transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl border-b py-3 ' + (dark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10 shadow-lg') : 'bg-transparent border-transparent'}`}>
        <button onClick={onClose} className={`group flex items-center gap-3 text-[9px] tracking-[0.3em] transition-all hover:text-[#bc13fe] ${!scrolled && 'drop-shadow-md'}`}>
          <div className="w-8 h-8 rounded-full border border-current/20 flex items-center justify-center group-hover:border-[#bc13fe]">
            <i className="fas fa-arrow-left text-[10px]"></i>
          </div>
          <span className="hidden md:block">RETOUR_UNIT</span>
        </button>
        
        <div className={`logo-font text-[12px] tracking-[0.5em] transition-all duration-500 ${scrolled ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          {pro.nom_commercial}
        </div>


      </nav>

{/* HERO SECTION : CINEMATIC WIDE (55vh) */}
<section className="relative h-[55vh] flex items-center justify-start overflow-hidden">
  {/* Image de fond : Opacité augmentée pour plus de visibilité */}
  <img 
    src={cover} 
    className="absolute inset-0 w-full h-full object-cover scale-105 opacity-80" 
    alt="Studio Banner" 
  />
  
  {/* Overlays : On utilise un dégradé radial plus subtil pour laisser le centre/droit de l'image libre */}
  <div className={`absolute inset-0 ${dark ? 
    'bg-[radial-gradient(circle_at_20%_50%,rgba(5,5,5,1)_0%,rgba(5,5,5,0.4)_50%,rgba(5,5,5,0.1)_100%)]' : 
    'bg-[radial-gradient(circle_at_20%_50%,rgba(252,252,252,1)_0%,rgba(252,252,252,0.4)_50%,rgba(252,252,252,0.1)_100%)]'}`}>
  </div>

  {/* Contenu textuel : Plus aéré et décalé vers le bas/gauche */}
  <div className="relative z-10 w-full px-6 md:px-20 mt-20">
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center gap-3 animate-in slide-in-from-left-8 duration-700">
        <div className="w-8 h-[1px] bg-[#bc13fe]"></div>
        <span className="text-[8px] tracking-[0.4em] text-[#bc13fe] font-black italic uppercase">Operations_Center</span>
      </div>
      
      {/* Titre avec ombre portée pour décoller de l'image si elle est claire */}
      <h1 className="text-4xl md:text-[5vw] font-black italic uppercase tracking-tighter leading-[0.9] drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
        {pro.nom_commercial}
      </h1>
      
      <div className="flex flex-wrap items-center gap-4 pt-2 animate-in slide-in-from-bottom-4 duration-1000">
        <p className="flex items-center gap-2 text-[8px] tracking-[0.2em] font-black italic opacity-60 uppercase">
          <i className="fas fa-location-dot text-[#00f2ff]"></i> {pro.adresse}
        </p>
        <span className="hidden md:block w-1 h-1 rounded-full bg-current opacity-20"></span>
        <p className="text-[8px] tracking-[0.2em] font-black italic opacity-60 uppercase">
          <i className="fas fa-circle text-green-500 text-[6px] animate-pulse"></i> Ready_For_Service
        </p>
      </div>
    </div>
  </div>

  {/* Indicateur de scroll minimaliste pour ne pas charger le visuel */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-20 md:translate-x-0 opacity-20">
    <div className="w-[1px] h-10 bg-current"></div>
  </div>
</section>


<main className="max-w-[1600px] mx-auto px-6 md:px-20 py-32 grid grid-cols-12 gap-16">
        
        {/* GAUCHE: CONTENU PRINCIPAL (8 colonnes flexibles) */}
        <div className="col-span-12 lg:col-span-8 space-y-40">
          
          {/* 01. MANIFESTO */}
          <section className="animate-in fade-in duration-1000">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-[#bc13fe]/10 flex items-center justify-center text-[#bc13fe] border border-[#bc13fe]/20">
                <i className="fas fa-terminal"></i>
              </div>
              <h4 className="text-[10px] tracking-[0.6em] text-[#bc13fe] uppercase">01. Studio_Manifesto</h4>
            </div>
            
            {/* Suppression de la grille md:grid-cols-2 pour laisser le texte prendre la place */}
            <div className="space-y-10 w-full">
                <p className="text-4xl md:text-6xl font-black italic leading-[0.9] tracking-tighter normal-case">
                  {pro.about_text || "Maîtrise absolue du detailing."}
                </p>
                
                <p className="text-sm md:text-base text-slate-500 leading-loose tracking-widest normal-case italic opacity-80 w-full">
                  {pro.bio}
                </p>
                
                {pro.instagram_url && (
                    <a href={getInstaLink(pro.instagram_url)} target="_blank" className="group inline-flex items-center gap-6 px-10 py-5 rounded-full border-2 border-[#bc13fe] text-[#bc13fe] font-black italic text-[11px] tracking-widest hover:bg-[#bc13fe] hover:text-white transition-all">
                        INSTAGRAM <i className="fab fa-instagram text-lg group-hover:rotate-12 transition-transform"></i>
                    </a>
                )}

                {/* Ajout des équipements ici en ligne flexible en dessous du texte */}
                <div className="pt-10 flex flex-wrap gap-3">
                   {pro.equipment?.map((item, i) => (
                      <span key={i} className={`px-4 py-2 rounded-xl border text-[9px] font-black italic uppercase ${dark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}>
                        {item}
                      </span>
                   ))}
                </div>
            </div>
          </section>

     
{/* 02. SERVICES AVEC BORDURES NÉON PERMANENTES */}
<section>
  <div className="flex items-center gap-6 mb-16">
    <div className="w-12 h-12 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,242,255,0.2)]">
      <i className="fas fa-layer-group"></i>
    </div>
    <h4 className="text-[10px] tracking-[0.6em] text-[#00f2ff] uppercase font-black">02. Engineering_Services</h4>
  </div>
  
  <div className="space-y-12">
    {pro.services_list?.map((s, i) => (
      /* La bordure est maintenant colorée par défaut (border-[#00f2ff]/30) */
      <div key={i} className={`group p-1 rounded-[50px] border transition-all duration-700 shadow-xl ${dark ? 'bg-white/5 border-[#00f2ff]/30 shadow-[#00f2ff]/5' : 'bg-black/5 border-[#00f2ff]/20 shadow-black/5'} hover:border-[#00f2ff] hover:shadow-[#00f2ff]/10`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-8 p-4">
          
          {/* GAUCHE : TEXTE TECHNIQUE */}
          <div className="lg:col-span-7 p-8 space-y-8 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-[7px] tracking-[0.4em] text-[#00f2ff] font-black uppercase">PROTOCOL_READY</span>
                <h5 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-[#00f2ff]">{s.titre}</h5>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black italic tracking-tighter">{s.price}€</span>
                <p className="text-[7px] opacity-30 mt-1 uppercase">Price_Unit</p>
              </div>
            </div>

            <div className="border-l-2 border-[#00f2ff] pl-8 space-y-4 py-2">
                {s.desc?.split(/[;.\n]/).filter(line => line.trim().length > 0).map((line, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <i className="fas fa-caret-right text-[#00f2ff] text-[9px] mt-1 shadow-[0_0_5px_#00f2ff]"></i>
                    <p className="text-[11px] md:text-xs normal-case font-medium opacity-80 italic tracking-wide">
                      {line.trim()}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* DROITE : VISUELS (Image déjà en couleurs) */}
          <div className="lg:col-span-5 grid grid-cols-4 gap-3 h-[400px] py-4 pr-4">
            {/* IMAGE MAÎTRESSE - Couleur active immédiatement */}
            <div className="col-span-3 relative rounded-[40px] overflow-hidden border border-[#00f2ff]/30 shadow-2xl group/img">
              <img 
                src={s.images?.[0] || cover} 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                alt="Main Service View"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00f2ff]/20 via-transparent to-transparent opacity-40"></div>
            </div>

            {/* MINIATURES SUR LE CÔTÉ */}
            <div className="col-span-1 flex flex-col gap-3">
              {s.images?.slice(1, 3).map((img, imgIdx) => (
                <div key={imgIdx} className="flex-1 relative rounded-[20px] overflow-hidden border border-[#00f2ff]/20 shadow-lg">
                  <img 
                    src={img} 
                    className="w-full h-full object-cover" 
                    alt="Detail view"
                  />
                </div>
              ))}
              {(!s.images || s.images.length < 3) && (
                <div className="flex-1 rounded-[20px] border border-dashed border-[#00f2ff]/10 flex items-center justify-center opacity-10">
                   <i className="fas fa-microchip text-[10px]"></i>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    ))}
  </div>
</section>

          {/* 03. CATALOGUE FLOTTANT */}
          {catalog.length > 0 && (
            <section>
              <div className="flex items-center gap-6 mb-16">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-current border border-current/10">
                  <i className="fas fa-images"></i>
                </div>
                <h4 className="text-[10px] tracking-[0.6em] uppercase">03. Visual_Catalog</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {catalog.map((img, i) => (
                  <div key={i} className="group relative aspect-square rounded-[40px] overflow-hidden border border-current/10 shadow-xl">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" alt="Portfolio" />
                    <div className="absolute inset-0 bg-[#bc13fe]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]"></div>
                  </div>
                ))}
              </div>
            </section>
          )}

{/* 04. Avis Clients - Système de Slider */}{/* 04. Avis Clients - Système de Slider */}
<section className="animate-in fade-in duration-700">
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 rounded-2xl bg-[#bc13fe]/10 flex items-center justify-center text-[#bc13fe] border border-[#bc13fe]/30 shadow-[0_0_15px_rgba(188,19,254,0.1)]">
        <i className="fa-regular fa-message text-xl"></i>
      </div>
      <div>
        <h4 className="text-[11px] tracking-[0.6em] uppercase font-black text-[#bc13fe]">04. AvisClients</h4>
      </div>
    </div>

    {/* NAVIGATION VISIBLE */}
    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-md">
      <button 
        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
        disabled={currentPage === 0}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
          currentPage === 0 
          ? 'opacity-20 border-white/10 cursor-not-allowed' 
          : 'bg-white/10 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:bg-[#00f2ff] hover:text-black'
        }`}
      >
        <i className="fas fa-arrow-left text-xs"></i>
      </button>

      <div className="px-4 text-[10px] font-black opacity-40 tracking-widest border-x border-white/10">
        {currentPage + 1} / {Math.ceil(reviews.length / reviewsPerPage) || 1}
      </div>

      <button 
        onClick={() => setCurrentPage(prev => (prev + 1) * reviewsPerPage < reviews.length ? prev + 1 : prev)}
        disabled={(currentPage + 1) * reviewsPerPage >= reviews.length}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
          (currentPage + 1) * reviewsPerPage >= reviews.length 
          ? 'opacity-20 border-white/10 cursor-not-allowed' 
          : 'bg-white/10 border-[#bc13fe] text-[#bc13fe] shadow-[0_0_15px_rgba(188,19,254,0.2)] hover:bg-[#bc13fe] hover:text-white'
        }`}
      >
        <i className="fas fa-arrow-right text-xs"></i>
      </button>
    </div>
  </div>

  <div className="relative">
    {/* GRILLE D'AVIS */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reviews.length > 0 ? (
        reviews.slice(currentPage * reviewsPerPage, (currentPage * reviewsPerPage) + reviewsPerPage).map((r, index) => (
          <div 
            key={r.id} 
            className="p-8 rounded-[45px] border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-[#00f2ff]/30 transition-all duration-500 group flex flex-col justify-between min-h-[200px] animate-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f2ff]/20 to-[#bc13fe]/20 flex items-center justify-center border border-white/10 font-black text-[12px]">
                    {r.client_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase italic">{r.client_name?.split('@')[0]}</p>
                    <p className="text-[8px] opacity-30 mt-0.5 tracking-tighter">CLIENT_VÉRIFIÉ</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({length: 5}).map((_, i) => (
                    <i key={i} className={`fas fa-star text-[9px] ${i < r.rating ? 'text-[#00f2ff] drop-shadow-[0_0_5px_#00f2ff]' : 'opacity-10'}`}></i>
                  ))}
                </div>
              </div>
              <p className="text-sm normal-case italic opacity-80 leading-relaxed font-medium group-hover:opacity-100 transition-opacity">
                "{r.comment}"
              </p>
            </div>
            <div className="mt-6 flex justify-between items-center opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="text-[8px] font-black tracking-widest">UNIT_ID: #{r.id.slice(0,6)}</span>
              <span className="text-[8px] font-black tracking-widest">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-2 py-24 text-center border-2 border-dashed border-white/5 rounded-[50px] opacity-20">
            <i className="fa-regular fa-message text-4xl mb-6 block"></i>
            <p className="text-[11px] tracking-[0.6em] font-black italic">DATABASE_EMPTY: ATTENTE_AVIS_CLIENTS</p>
        </div>
      )}
    </div>
  </div>
</section>
          {/* 05. FAQ STYLE ACCORDÉON */}
          {pro.faq && pro.faq.length > 0 && (
            <section className="animate-in fade-in">
              <div className="flex items-center gap-6 mb-16">
                <div className="w-12 h-12 rounded-2xl bg-[#bc13fe]/10 flex items-center justify-center text-[#bc13fe] border border-[#bc13fe]/20">
                  <i className="fas fa-question"></i>
                </div>
                <h4 className="text-[10px] tracking-[0.6em] text-[#bc13fe] uppercase">05. F.A.Q</h4>
              </div>

              <div className="space-y-4">
                {pro.faq.map((item, i) => (
                  <details key={i} className="group border border-current/5 rounded-[30px] overflow-hidden transition-all duration-500 open:bg-current/[0.02] open:border-[#bc13fe]/30">
                    <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                      <span className="text-lg font-black italic uppercase tracking-tighter pr-8">{item.question}</span>
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-current transition-transform duration-500 group-open:rotate-180"></div>
                        <div className="absolute top-0 left-1/2 w-[2px] h-full bg-current transition-transform duration-500 group-open:rotate-90"></div>
                      </div>
                    </summary>
                    <div className="px-8 pb-8 animate-in slide-in-from-top-2">
                      <p className="text-sm normal-case font-medium opacity-60 leading-loose italic">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* DROITE: SIDEBAR FIXE */}
        <aside className="col-span-12 lg:col-span-4">
          <div className={`sticky top-32 p-10 rounded-[60px] shadow-2xl border overflow-hidden ${dark ? 'bg-zinc-900 border-white/5' : 'bg-white border-black/5'}`}>
            {/* Effet décoratif en fond */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#bc13fe]/10 blur-[80px] rounded-full"></div>
            
            <h5 className="relative z-10 text-[10px] tracking-[0.5em] mb-12 border-b border-current/10 pb-6 italic uppercase font-black">
              <span className="text-[#bc13fe]">RESERVATION</span>
            </h5>
            
            <div className="relative z-10 space-y-6 mb-12">
              {pro.services_list?.slice(0, 4).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] group cursor-default">
                  <span className="opacity-40 italic group-hover:opacity-100 group-hover:text-[#00f2ff] transition-all">{t.titre}</span>
                  <span className="text-xl tracking-tighter font-black">{t.price}€</span>
                </div>
              ))}
            </div>
            
            <div className="relative z-10 space-y-4">
                <button onClick={onBookingClick} className={`w-full py-7 rounded-3xl text-[11px] font-black tracking-[0.4em] transition-all shadow-2xl active:scale-95 ${dark ? 'bg-[#bc13fe] text-white hover:bg-[#bc13fe]/80' : 'bg-black text-white hover:bg-[#bc13fe]'}`}>
                  Prendre un RDV
                </button>

                {session && (
                    <button onClick={() => setShowChat(true)} className="w-full py-7 rounded-3xl text-[11px] font-black tracking-[0.4em] border-2 border-current transition-all hover:bg-current hover:text-white flex items-center justify-center gap-4">
                        <i className="fas fa-comments"></i> CHAT_DIRECT
                    </button>
                )}
            </div>

            <div className="mt-10 pt-10 border-t border-current/5 flex items-center justify-between text-[8px] opacity-40">
              <span className="flex items-center gap-2"><i className="fas fa-lock"></i> SECURE_SYNC</span>
              <span>VER_2.0.4</span>
            </div>
          </div>
        </aside>
      </main>

      {/* 06. LOCALISATION FULL WIDTH */}
      <section className="px-6 md:px-20 pb-40">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-12 h-12 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <h4 className="text-[10px] tracking-[0.6em] text-[#00f2ff] uppercase">06. Localisation</h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
          <div className={`lg:col-span-8 rounded-[60px] overflow-hidden border shadow-2xl relative group ${dark ? 'border-white/10' : 'border-black/10'}`}>
            <iframe
              width="100%" height="100%" frameBorder="0" scrolling="no" title="map"
              style={{ filter: dark ? 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'grayscale(1) contrast(1.2)', opacity: 0.8 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(pro.adresse)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
            <div className="absolute inset-0 pointer-events-none border-[30px] border-transparent group-hover:border-current/5 transition-all duration-700 rounded-[60px]"></div>
          </div>

          <div className={`lg:col-span-4 p-12 rounded-[60px] border flex flex-col justify-center gap-10 ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            <div className="space-y-4">
              <h5 className="text-4xl font-black italic tracking-tighter leading-none"><br/><span className="text-[#00f2ff]">ACCÈS</span></h5>
              <p className="text-[12px] opacity-60 leading-relaxed normal-case italic">{pro.adresse}</p>
            </div>
            
            <div className="grid gap-3">
              <a href={`https://maps.google.com/?q=${encodeURIComponent(pro.adresse)}`} target="_blank" className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-[#00f2ff] hover:text-black transition-all group">
                <span className="text-[10px] font-black tracking-widest">GOOGLE_MAPS</span>
                <i className="fas fa-location-dot transition-transform group-hover:translate-x-1"></i>
              </a>
              <a href={`https://waze.com/ul?q=${encodeURIComponent(pro.adresse)}&navigate=yes`} target="_blank" className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-[#33CCFF] hover:text-black transition-all group">
                <span className="text-[10px] font-black tracking-widest">WAZE_NAV</span>
                <i className="fas fa-navigation transition-transform group-hover:translate-x-1"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {showChat && session && (
        <ChatBox receiverId={pro.id} receiverName={pro.nom_commercial} senderId={session.user.id} onClose={() => setShowChat(false)} dark={dark} />
      )}

      {/* Styles globaux injectés pour les animations spécifiques */}
      <style>{`
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
        .animate-scan { animation: scan 4s linear infinite; }
        .animate-pulse-slow { animation: pulse 8s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

