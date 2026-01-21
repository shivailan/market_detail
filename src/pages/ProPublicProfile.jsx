import { useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { supabase } from '../lib/supabase';

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

  // Chargement des avis
  useEffect(() => {
    const fetchReviews = async () => {
      if (!supabase || !pro?.id) return;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('pro_id', pro.id)
        .order('created_at', { ascending: false });
      if (!error) setReviews(data || []);
    };
    fetchReviews();
  }, [pro.id]);

  const cover = pro.cover_url || "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=2070";
  const catalog = pro.catalog_images || [];

  // FONCTION DE MISE EN FORME (Tes chevrons cyans)
  const renderDescription = (desc) => {
    if (!desc) return null;
    const lines = desc.split(/[;.\n]/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return <p className="text-[11px] normal-case font-medium opacity-70 italic border-l-2 border-current/10 pl-4">{desc}</p>;
    return (
      <div className="border-l-2 border-[#00f2ff]/30 pl-4 md:pl-6 space-y-2">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-[#00f2ff] text-[8px] mt-1.5 flex-shrink-0"><i className="fas fa-chevron-right"></i></span>
            <p className="text-[11px] normal-case font-medium opacity-70 italic leading-tight">{line.trim()}</p>
          </div>
        ))}
      </div>
    );
  };

  const getInstaLink = (input) => {
    if (!input) return null;
    return input.startsWith('http') ? input : `https://instagram.com/${input.replace('@', '')}`;
  };

  return (
    <div className={`fixed inset-0 z-[1001] overflow-y-auto overflow-x-hidden font-['Outfit'] animate-in fade-in duration-500 text-left font-black italic uppercase transition-colors ${dark ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      {/* HEADER NAV */}
      <nav className={`fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-[110] transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl border-b py-3 ' + (dark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10') : 'bg-transparent'}`}>
        <button onClick={onClose} className="group flex items-center gap-3 text-[9px] tracking-[0.2em]">
          <div className="w-8 h-8 rounded-full border border-current/20 flex items-center justify-center"><i className="fas fa-arrow-left text-[10px]"></i></div>
          <span className="hidden sm:block">RETOUR</span>
        </button>
        <div className="text-[10px] tracking-[0.3em] truncate max-w-[150px] md:max-w-none">{pro.nom_commercial}</div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[50vh] flex items-center justify-start overflow-hidden w-full">
        <img src={cover} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Banner" />
        <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-t from-[#050505] via-transparent' : 'bg-gradient-to-t from-[#fcfcfc] via-transparent'}`}></div>
        <div className="relative z-10 w-full px-6 md:px-20 mt-10">
          <div className="max-w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-[#bc13fe]"></div>
              <span className="text-[8px] tracking-[0.4em] text-[#bc13fe]">UNIT_PRO</span>
            </div>
            <h1 className="text-4xl md:text-[5vw] font-black italic uppercase leading-[0.9] tracking-tighter break-words">{pro.nom_commercial}</h1>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-[1600px] mx-auto px-6 md:px-20 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        <div className="col-span-1 lg:col-span-8 space-y-24 md:space-y-40 w-full overflow-hidden">
          
          {/* 01. MANIFESTO */}
          <section className="w-full">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-[#bc13fe]/10 flex items-center justify-center text-[#bc13fe] border border-[#bc13fe]/20">01</div>
              <h4 className="text-[10px] tracking-[0.6em] text-[#bc13fe]">STUDIO_MANIFESTO</h4>
            </div>
            <div className="space-y-10">
                <p className="text-3xl md:text-6xl font-black italic leading-[1] tracking-tighter break-words">{pro.about_text || "Maîtrise absolue."}</p>
                <p className="text-[13px] md:text-base opacity-60 normal-case italic leading-relaxed">{pro.bio}</p>
                {pro.instagram_url && (
                    <a href={getInstaLink(pro.instagram_url)} target="_blank" className="inline-flex items-center gap-6 px-10 py-5 rounded-full border-2 border-[#bc13fe] text-[#bc13fe] font-black italic text-[11px] tracking-widest hover:bg-[#bc13fe] hover:text-white transition-all">
                        INSTAGRAM <i className="fab fa-instagram text-lg"></i>
                    </a>
                )}
                <div className="pt-10 flex flex-wrap gap-3">
                   {pro.equipment?.map((item, i) => (
                      <span key={i} className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase ${dark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}>{item}</span>
                   ))}
                </div>
            </div>
          </section>

          {/* 02. SERVICES */}
          <section className="w-full">
            <div className="flex items-center gap-6 mb-16">
              <div className="w-12 h-12 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/30">02</div>
              <h4 className="text-[10px] tracking-[0.6em] text-[#00f2ff]">ENGINEERING_SERVICES</h4>
            </div>
            <div className="space-y-12">
              {pro.services_list?.map((s, i) => (
                <div key={i} className={`group rounded-[40px] md:rounded-[50px] border transition-all duration-700 shadow-xl overflow-hidden ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10 hover:border-[#00f2ff]'}`}>
                  <div className="flex flex-col md:grid md:grid-cols-12">
                    <div className="p-8 md:p-12 md:col-span-7 flex flex-col justify-center space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <span className="text-[7px] tracking-[0.4em] text-[#00f2ff]">PROTOCOL_READY</span>
                          <h5 className="text-2xl md:text-4xl font-black text-[#00f2ff]">{s.titre}</h5>
                        </div>
                        <span className="text-3xl md:text-4xl font-black">{s.price}€</span>
                      </div>
                      {renderDescription(s.desc)}
                    </div>
                    <div className="h-64 md:h-auto md:col-span-5 bg-zinc-800">
                      <img src={s.images?.[0] || cover} className="w-full h-full object-cover" alt="Svc" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 03. CATALOGUE */}
          {catalog.length > 0 && (
            <section className="w-full">
              <div className="flex items-center gap-6 mb-16">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-current/10">03</div>
                <h4 className="text-[10px] tracking-[0.6em]">VISUAL_REPORTS</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {catalog.map((img, i) => (
                  <div key={i} className="aspect-square rounded-[30px] md:rounded-[40px] overflow-hidden border border-current/10 bg-zinc-900 shadow-xl">
                    <img src={img} className="w-full h-full object-cover transition-all group-hover:scale-110" alt="Portfolio" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 04. AVIS CLIENTS (Slider Intégral) */}
          <section className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-16 gap-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#bc13fe]/10 flex items-center justify-center text-[#bc13fe] border border-[#bc13fe]/30">04</div>
                <h4 className="text-[10px] tracking-[0.6em] text-[#bc13fe]">AVIS_CLIENTS</h4>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-2 rounded-full border border-white/10">
                <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center hover:bg-[#00f2ff] hover:text-black transition-all"><i className="fas fa-arrow-left text-xs"></i></button>
                <span className="text-[10px] font-black opacity-40 px-4">{currentPage + 1} / {Math.ceil(reviews.length / reviewsPerPage) || 1}</span>
                <button onClick={() => setCurrentPage(prev => (prev + 1) * reviewsPerPage < reviews.length ? prev + 1 : prev)} className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center hover:bg-[#bc13fe] hover:text-white transition-all"><i className="fas fa-arrow-right text-xs"></i></button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reviews.length > 0 ? (
                reviews.slice(currentPage * reviewsPerPage, (currentPage * reviewsPerPage) + reviewsPerPage).map((r) => (
                  <div key={r.id} className="p-8 rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-sm flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[11px] font-black text-[#00f2ff]">{r.client_name?.split('@')[0]}</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star text-[9px] ${i < r.rating ? 'text-[#00f2ff]' : 'opacity-10'}`}></i>)}
                        </div>
                      </div>
                      <p className="text-xs normal-case italic opacity-80 leading-relaxed font-medium">"{r.comment}"</p>
                    </div>
                    <div className="mt-6 text-[8px] opacity-20 font-black tracking-widest">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20">AUCUN_AVIS_DISPONIBLE</div>
              )}
            </div>
          </section>

        </div>

        {/* SIDEBAR FIXE / RESPONSIVE */}
        <aside className="col-span-1 lg:col-span-4 w-full">
          <div className={`sticky top-32 p-10 rounded-[50px] md:rounded-[60px] border shadow-2xl ${dark ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/10'}`}>
            <h5 className="text-[10px] tracking-[0.5em] mb-12 border-b border-current/10 pb-6 italic font-black uppercase"><span className="text-[#bc13fe]">UNIT</span>_RESERVATION</h5>
            <div className="space-y-6 mb-12">
              {pro.services_list?.slice(0, 4).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] opacity-60">
                  <span className="truncate pr-4">{t.titre}</span>
                  <span className="font-black shrink-0">{t.price}€</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
                <button onClick={onBookingClick} className="w-full py-7 rounded-3xl text-[11px] font-black tracking-[0.4em] bg-[#bc13fe] text-white shadow-xl active:scale-95 transition-all">INITIALISER_RDV</button>
                {session && (
                    <button onClick={() => setShowChat(true)} className="w-full py-7 rounded-3xl text-[11px] font-black tracking-[0.4em] border-2 border-current hover:bg-current hover:text-white transition-all flex items-center justify-center gap-4">
                        <i className="fas fa-comments"></i> CHAT_DIRECT
                    </button>
                )}
            </div>
          </div>
        </aside>
      </main>

      {/* 06. LOCALISATION */}
      <section className="w-full px-6 md:px-20 pb-40">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-12 h-12 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">06</div>
          <h4 className="text-[10px] tracking-[0.6em] text-[#00f2ff] uppercase">STUDIO_LOCALISATION</h4>
        </div>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 h-auto lg:h-[600px]">
          <div className="lg:col-span-8 h-[350px] lg:h-full rounded-[40px] md:rounded-[60px] overflow-hidden border shadow-xl relative">
            <iframe width="100%" height="100%" frameBorder="0" style={{ filter: dark ? 'invert(90%)' : 'grayscale(1)', opacity: 0.8 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(pro.adresse)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
          </div>
          <div className={`lg:col-span-4 p-10 md:p-12 rounded-[40px] md:rounded-[60px] border flex flex-col justify-center gap-10 ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            <h5 className="text-4xl font-black italic tracking-tighter leading-none">ACCÈS_<span className="text-[#00f2ff]">UNIT</span></h5>
            <p className="text-[12px] opacity-60 leading-relaxed italic normal-case">{pro.adresse}</p>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(pro.adresse)}`} target="_blank" className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-[#00f2ff] hover:text-black transition-all">
                <span className="text-[10px] font-black">GOOGLE_MAPS</span><i className="fas fa-location-dot"></i>
            </a>
          </div>
        </div>
      </section>

      {showChat && session && (
        <ChatBox receiverId={pro.id} receiverName={pro.nom_commercial} senderId={session.user.id} onClose={() => setShowChat(false)} dark={dark} />
      )}
    </div>
  );
}