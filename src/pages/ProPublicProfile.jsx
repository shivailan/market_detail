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
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const renderDescription = (desc) => {
    if (!desc) return null;
    const lines = desc.split(/[;.\n]/).filter(line => line.trim().length > 0);
    return (
      <div className="border-l-2 border-[#00f2ff] pl-3 md:pl-6 space-y-3">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-[#00f2ff] text-[8px] md:text-[10px] mt-1.5 md:mt-2 flex-shrink-0"><i className="fas fa-chevron-right"></i></span>
            <p className="text-[14px] md:text-[16px] normal-case font-medium opacity-90 italic leading-snug">{line.trim()}</p>
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
    <div className={`fixed inset-0 z-[1001] overflow-y-auto overflow-x-hidden font-['Outfit'] animate-in fade-in duration-500 text-left font-black italic uppercase transition-colors pb-24 md:pb-0 ${dark ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      {/* HEADER NAV */}
      <nav className={`fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-[110] transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl border-b py-3 ' + (dark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10') : 'bg-transparent'}`}>
        <button onClick={onClose} className="group flex items-center gap-3 text-[11px] tracking-[0.2em]">
          <div className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center transition-all bg-black/20 backdrop-blur-md group-hover:bg-[#bc13fe] group-hover:text-white"><i className="fas fa-arrow-left text-[12px]"></i></div>
          <span className="hidden sm:block">RETOUR</span>
        </button>
        <div className={`text-[12px] md:text-[14px] tracking-[0.3em] font-black truncate max-w-[150px] transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
          {pro.nom_commercial}
        </div>
        <div className="w-10 sm:hidden"></div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[50vh] md:h-[65vh] flex items-end justify-start overflow-hidden w-full">
        <img src={cover} className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" alt="Banner" />
        <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-t from-[#050505] via-transparent' : 'bg-gradient-to-t from-[#fcfcfc] via-transparent'}`}></div>
        <div className="relative z-10 w-full px-4 md:px-20 pb-12">
          <div className="max-w-full space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-[#bc13fe]"></div>
              <span className="text-[10px] md:text-[12px] tracking-[0.4em] text-[#bc13fe]">UNIT_PRO_ACTIVE</span>
            </div>
            <h1 className="text-4xl md:text-[7vw] font-black italic uppercase leading-[0.85] tracking-tighter break-words">{pro.nom_commercial}</h1>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-[1600px] mx-auto px-4 md:px-20 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        <div className="col-span-1 lg:col-span-8 space-y-24 md:space-y-48">
          
          {/* 01. MANIFESTO */}
          <section className="w-full">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-[#bc13fe] font-mono text-sm">01//</span>
              <h4 className="text-[11px] md:text-[14px] tracking-[0.5em] text-[#bc13fe] font-black uppercase">MANIFESTO</h4>
            </div>
            <div className="space-y-8 md:space-y-12">
                <p className="text-3xl md:text-7xl font-black italic leading-[1] tracking-tighter">{pro.about_text || "Maîtrise absolue."}</p>
                <p className="text-[15px] md:text-[20px] opacity-90 normal-case italic font-medium">{pro.bio}</p>
                {pro.instagram_url && (
                    <a href={getInstaLink(pro.instagram_url)} target="_blank" className="inline-flex items-center gap-4 px-10 py-5 rounded-full border-2 border-[#bc13fe] text-[#bc13fe] font-black italic text-[12px] tracking-widest hover:bg-[#bc13fe] hover:text-white transition-all">
                        EXPLORER INSTAGRAM <i className="fab fa-instagram text-lg"></i>
                    </a>
                )}
            </div>
          </section>

          {/* 02. SERVICES */}
          <section className="w-full">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-[#00f2ff] font-mono text-sm">02//</span>
              <h4 className="text-[11px] md:text-[14px] tracking-[0.5em] text-[#00f2ff] font-black uppercase">SERVICES</h4>
            </div>
            <div className="space-y-8 md:space-y-16">
              {pro.services_list?.map((s, i) => (
                <div key={i} className={`group rounded-[40px] md:rounded-[50px] border transition-all duration-700 overflow-hidden ${dark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}>
                  <div className="flex flex-col lg:grid lg:grid-cols-12">
                    <div className="order-2 lg:order-1 p-8 md:p-16 lg:col-span-7 flex flex-col justify-center space-y-6 md:space-y-10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <span className="text-[9px] tracking-[0.4em] text-[#00f2ff] font-black uppercase">Protocol_Svc</span>
                          <h5 className="text-2xl md:text-5xl font-black text-[#00f2ff] leading-none">{s.titre}</h5>
                        </div>
                        <span className="text-3xl md:text-6xl font-black tracking-tighter">{s.price}€</span>
                      </div>
                      {renderDescription(s.desc)}
                    </div>
                    <div className="order-1 lg:order-2 h-64 md:h-80 lg:h-auto lg:col-span-5 relative overflow-hidden">
                      <img src={s.images?.[0] || cover} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Svc" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 03. CATALOGUE */}
          {catalog.length > 0 && (
            <section className="w-full">
              <div className="flex items-center gap-4 mb-10">
                <span className="opacity-30 font-mono text-sm">03//</span>
                <h4 className="text-[11px] md:text-[14px] tracking-[0.5em] font-black uppercase">PORTFOLIO</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {catalog.map((img, i) => (
                  <div key={i} className="aspect-square rounded-[30px] md:rounded-[40px] overflow-hidden border border-current/10 bg-zinc-900 group">
                    <img src={img} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="Portfolio" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 04. AVIS CLIENTS */}
          <section className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div className="flex items-center gap-4">
                <span className="text-[#bc13fe] font-mono text-sm">04//</span>
                <h4 className="text-[11px] md:text-[14px] tracking-[0.5em] text-[#bc13fe] font-black uppercase">REVIEWS</h4>
              </div>
              <div className="flex items-center gap-4 self-end md:self-auto bg-white/5 p-2 rounded-full border border-white/10">
                <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center"><i className="fas fa-arrow-left text-xs"></i></button>
                <span className="text-[10px] font-black opacity-60">{currentPage + 1} / {Math.ceil(reviews.length / reviewsPerPage) || 1}</span>
                <button onClick={() => setCurrentPage(prev => (prev + 1) * reviewsPerPage < reviews.length ? prev + 1 : prev)} className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center"><i className="fas fa-arrow-right text-xs"></i></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {reviews.length > 0 ? (
                reviews.slice(currentPage * reviewsPerPage, (currentPage * reviewsPerPage) + reviewsPerPage).map((r) => (
                  <div key={r.id} className="p-8 md:p-10 rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-md flex flex-col justify-between min-h-[250px] shadow-xl">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[12px] font-black text-[#00f2ff] tracking-wider uppercase">{r.client_name?.split('@')[0]}</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star text-[9px] ${i < r.rating ? 'text-[#00f2ff]' : 'opacity-10'}`}></i>)}
                        </div>
                      </div>
                      <p className="text-[15px] normal-case italic opacity-90 leading-relaxed font-medium">"{r.comment}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[40px] opacity-30 font-black tracking-widest text-xs uppercase">Aucun avis disponible</div>
              )}
            </div>
          </section>

        </div>

        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:block lg:col-span-4 w-full">
          <div className={`sticky top-32 p-10 rounded-[50px] border shadow-2xl ${dark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-black/10'}`}>
            <h5 className="text-[11px] tracking-[0.4em] mb-10 border-b border-current/10 pb-6 italic font-black uppercase">RÉSERVATION_<span className="text-[#bc13fe]">UNIT</span></h5>
            <div className="space-y-4">
                <button onClick={onBookingClick} className="w-full py-7 rounded-[25px] text-[12px] font-black tracking-[0.3em] bg-[#bc13fe] text-white shadow-lg active:scale-95 transition-all">INITIALISER_RDV</button>
                {session && (
                    <button onClick={() => setShowChat(true)} className="w-full py-7 rounded-[25px] text-[12px] font-black tracking-[0.3em] border-2 border-current transition-all flex items-center justify-center gap-3">
                        <i className="fas fa-comments"></i> MESSAGERIE
                    </button>
                )}
            </div>
          </div>
        </aside>
      </main>

      {/* 05. FAQ */}
      {pro.faq && pro.faq.length > 0 && (
        <section className="w-full px-4 md:px-20 py-20">
          <div className="flex items-center gap-4 mb-12">
            <span className="opacity-30 font-mono text-sm">05//</span>
            <h4 className="text-[11px] md:text-[14px] tracking-[0.5em] font-black uppercase">FAQ</h4>
          </div>
          <div className="space-y-4 max-w-4xl">
            {pro.faq.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className={`rounded-[30px] border transition-all duration-500 overflow-hidden ${isOpen ? (dark ? 'bg-white/[0.07] border-[#bc13fe]' : 'bg-black/[0.03] border-[#bc13fe]') : (dark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.01] border-black/5')}`}>
                  <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full p-8 md:p-10 flex justify-between items-center text-left">
                    <h5 className="text-[15px] md:text-[17px] font-black italic uppercase leading-tight">{item.question}</h5>
                    <i className={`fas fa-chevron-down text-[10px] transition-transform duration-500 ${isOpen ? 'rotate-180 text-[#bc13fe]' : 'opacity-30'}`}></i>
                  </button>
                  <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-8 md:px-24 pb-10">
                      <p className="text-[15px] md:text-[17px] opacity-90 normal-case italic font-medium">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 06. LOCALISATION (REMISE ET OPTIMISÉE) */}
      <section className="w-full px-4 md:px-20 pb-40 py-20">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[#00f2ff] font-mono text-sm">06//</span>
          <h4 className="text-[11px] md:text-[14px] tracking-[0.5em] text-[#00f2ff] font-black uppercase">LOCATION</h4>
        </div>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-10">
          <div className="lg:col-span-8 h-[350px] md:h-[600px] rounded-[40px] md:rounded-[60px] overflow-hidden border shadow-2xl relative">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ filter: dark ? 'invert(90%) hue-rotate(180deg)' : 'grayscale(1)', opacity: 0.8 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(pro.adresse)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
          <div className={`lg:col-span-4 p-8 md:p-16 rounded-[40px] md:rounded-[60px] border flex flex-col justify-center gap-8 ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            <h5 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none uppercase">ACCÈS_<span className="text-[#00f2ff]">STUDIO</span></h5>
            <p className="text-[16px] md:text-[18px] opacity-90 leading-relaxed italic normal-case font-medium">{pro.adresse}</p>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pro.adresse)}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-6 md:p-8 rounded-[25px] bg-[#00f2ff] text-black hover:scale-[1.02] transition-all shadow-xl font-black italic text-[13px]"
            >
              NAVIGUER_ICI <i className="fas fa-location-arrow"></i>
            </a>
          </div>
        </div>
      </section>

      {/* MOBILE BOOKING BAR */}
      <div className={`fixed bottom-0 left-0 w-full p-4 lg:hidden z-[120] border-t backdrop-blur-2xl ${dark ? 'bg-black/80 border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]' : 'bg-white/80 border-black/10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]'}`}>
        <div className="flex gap-3 max-w-md mx-auto">
          {session && (
            <button onClick={() => setShowChat(true)} className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <i className="fas fa-comments text-lg"></i>
            </button>
          )}
          <button onClick={onBookingClick} className="flex-1 bg-[#bc13fe] text-white py-4 rounded-2xl font-black italic tracking-[0.2em] text-[13px] shadow-lg active:scale-95 transition-all">
            RÉSERVER MAINTENANT
          </button>
        </div>
      </div>

      {/* CHATBOX MODAL */}
      {showChat && session && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
           <div className="w-full max-w-lg h-[80vh] md:h-[600px] relative shadow-2xl">
             <ChatBox receiverId={pro.id} receiverName={pro.nom_commercial} senderId={session.user.id} onClose={() => setShowChat(false)} dark={dark} />
           </div>
        </div>
      )}
    </div>
  );
}