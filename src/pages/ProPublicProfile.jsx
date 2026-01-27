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

  // FONCTION DE MISE EN FORME (Texte agrandi et plus lisible)
  const renderDescription = (desc) => {
    if (!desc) return null;
    const lines = desc.split(/[;.\n]/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return <p className="text-[14px] md:text-[16px] normal-case font-medium opacity-90 italic border-l-2 border-[#00f2ff] pl-4">{desc}</p>;
    return (
      <div className="border-l-2 border-[#00f2ff] pl-4 md:pl-6 space-y-3">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-[#00f2ff] text-[10px] mt-2 flex-shrink-0"><i className="fas fa-chevron-right"></i></span>
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
    <div className={`fixed inset-0 z-[1001] overflow-y-auto overflow-x-hidden font-['Outfit'] animate-in fade-in duration-500 text-left font-black italic uppercase transition-colors ${dark ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'}`}>
      
      {/* HEADER NAV */}
      <nav className={`fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-[110] transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl border-b py-3 ' + (dark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10') : 'bg-transparent'}`}>
        <button onClick={onClose} className="group flex items-center gap-3 text-[11px] tracking-[0.2em]">
          <div className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center transition-all group-hover:bg-[#bc13fe] group-hover:text-white"><i className="fas fa-arrow-left text-[12px]"></i></div>
          <span className="hidden sm:block">RETOUR</span>
        </button>
        <div className="text-[12px] md:text-[14px] tracking-[0.3em] truncate max-w-[150px] md:max-w-none font-black">{pro.nom_commercial}</div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[60vh] flex items-center justify-start overflow-hidden w-full">
        <img src={cover} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Banner" />
        <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-t from-[#050505] via-transparent' : 'bg-gradient-to-t from-[#fcfcfc] via-transparent'}`}></div>
        <div className="relative z-10 w-full px-6 md:px-20 mt-10">
          <div className="max-w-full space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[2px] bg-[#bc13fe]"></div>
              <span className="text-[10px] md:text-[12px] tracking-[0.5em] text-[#bc13fe]">UNIT_PRO_ACTIVE</span>
            </div>
            <h1 className="text-5xl md:text-[6vw] font-black italic uppercase leading-[0.85] tracking-tighter break-words">{pro.nom_commercial}</h1>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-[1600px] mx-auto px-6 md:px-20 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        <div className="col-span-1 lg:col-span-8 space-y-32 md:space-y-48 w-full overflow-hidden">
          
          {/* 01. MANIFESTO */}
          <section className="w-full">
            <div className="flex items-center gap-6 mb-16">
              <div className="w-14 h-14 rounded-2xl bg-[#bc13fe]/10 flex items-center justify-center text-[#bc13fe] border border-[#bc13fe]/20 text-xl">01</div>
              <h4 className="text-[12px] md:text-[14px] tracking-[0.6em] text-[#bc13fe] font-black">STUDIO_MANIFESTO</h4>
            </div>
            <div className="space-y-12">
                <p className="text-4xl md:text-7xl font-black italic leading-[1] tracking-tighter break-words">{pro.about_text || "Maîtrise absolue."}</p>
                <p className="text-[16px] md:text-[20px] opacity-90 normal-case italic leading-relaxed font-medium max-w-4xl">{pro.bio}</p>
                {pro.instagram_url && (
                    <a href={getInstaLink(pro.instagram_url)} target="_blank" className="inline-flex items-center gap-6 px-12 py-6 rounded-full border-2 border-[#bc13fe] text-[#bc13fe] font-black italic text-[13px] tracking-widest hover:bg-[#bc13fe] hover:text-white transition-all">
                        EXPLORER INSTAGRAM <i className="fab fa-instagram text-xl"></i>
                    </a>
                )}
                <div className="pt-10 flex flex-wrap gap-4">
                   {pro.equipment?.map((item, i) => (
                      <span key={i} className={`px-6 py-3 rounded-2xl border text-[11px] md:text-[13px] font-black uppercase ${dark ? 'border-white/20 bg-white/5' : 'border-black/10 bg-black/5'}`}>{item}</span>
                   ))}
                </div>
            </div>
          </section>

          {/* 02. SERVICES */}
          <section className="w-full">
            <div className="flex items-center gap-6 mb-20">
              <div className="w-14 h-14 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/30 text-xl">02</div>
              <h4 className="text-[12px] md:text-[14px] tracking-[0.6em] text-[#00f2ff] font-black">ENGINEERING_SERVICES</h4>
            </div>
            <div className="space-y-16">
              {pro.services_list?.map((s, i) => (
                <div key={i} className={`group rounded-[50px] border transition-all duration-700 shadow-2xl overflow-hidden ${dark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/10 hover:border-[#00f2ff]'}`}>
                  <div className="flex flex-col md:grid md:grid-cols-12">
                    <div className="p-10 md:p-16 md:col-span-7 flex flex-col justify-center space-y-10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <span className="text-[9px] tracking-[0.5em] text-[#00f2ff] font-black">PROTOCOL_READY</span>
                          <h5 className="text-3xl md:text-5xl font-black text-[#00f2ff] leading-none">{s.titre}</h5>
                        </div>
                        <span className="text-4xl md:text-6xl font-black tracking-tighter">{s.price}€</span>
                      </div>
                      {renderDescription(s.desc)}
                    </div>
                    <div className="h-80 md:h-auto md:col-span-5 bg-zinc-800">
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
              <div className="flex items-center gap-6 mb-20">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-current/10 text-xl">03</div>
                <h4 className="text-[12px] md:text-[14px] tracking-[0.6em] font-black">VISUAL_REPORTS</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {catalog.map((img, i) => (
                  <div key={i} className="aspect-square rounded-[40px] overflow-hidden border border-current/10 bg-zinc-900 shadow-2xl group">
                    <img src={img} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="Portfolio" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 04. AVIS CLIENTS */}
          <section className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-20 gap-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#bc13fe]/10 flex items-center justify-center text-[#bc13fe] border border-[#bc13fe]/30 text-xl">04</div>
                <h4 className="text-[12px] md:text-[14px] tracking-[0.6em] text-[#bc13fe] font-black">AVIS_CLIENTS</h4>
              </div>
              <div className="flex items-center gap-6 bg-white/5 p-3 rounded-full border border-white/10">
                <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} className="w-12 h-12 rounded-full border border-current/20 flex items-center justify-center hover:bg-[#00f2ff] hover:text-black transition-all"><i className="fas fa-arrow-left text-sm"></i></button>
                <span className="text-[12px] font-black opacity-60 px-4">{currentPage + 1} / {Math.ceil(reviews.length / reviewsPerPage) || 1}</span>
                <button onClick={() => setCurrentPage(prev => (prev + 1) * reviewsPerPage < reviews.length ? prev + 1 : prev)} className="w-12 h-12 rounded-full border border-current/20 flex items-center justify-center hover:bg-[#bc13fe] hover:text-white transition-all"><i className="fas fa-arrow-right text-sm"></i></button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {reviews.length > 0 ? (
                reviews.slice(currentPage * reviewsPerPage, (currentPage * reviewsPerPage) + reviewsPerPage).map((r) => (
                  <div key={r.id} className="p-10 rounded-[50px] border border-white/10 bg-white/[0.04] backdrop-blur-md flex flex-col justify-between min-h-[280px] shadow-xl">
                    <div>
                      <div className="flex justify-between items-start mb-8">
                        <span className="text-[14px] font-black text-[#00f2ff] tracking-wider">{r.client_name?.split('@')[0]}</span>
                        <div className="flex gap-1.5">
                          {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star text-[11px] ${i < r.rating ? 'text-[#00f2ff]' : 'opacity-10'}`}></i>)}
                        </div>
                      </div>
                      <p className="text-[16px] normal-case italic opacity-90 leading-relaxed font-medium">"{r.comment}"</p>
                    </div>
                    <div className="mt-8 text-[10px] opacity-30 font-black tracking-[0.2em]">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-32 text-center border-2 border-dashed border-white/10 rounded-[50px] opacity-30 font-black tracking-widest text-sm">AUCUN_AVIS_DISPONIBLE</div>
              )}
            </div>
          </section>

        </div>

        {/* SIDEBAR */}
        <aside className="col-span-1 lg:col-span-4 w-full">
          <div className={`sticky top-32 p-12 rounded-[60px] border shadow-2xl ${dark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-black/10'}`}>
            <h5 className="text-[12px] tracking-[0.5em] mb-12 border-b border-current/10 pb-8 italic font-black uppercase"><span className="text-[#bc13fe]">UNIT</span>_RESERVATION_PANEL</h5>
            <div className="space-y-8 mb-16">
              {pro.services_list?.slice(0, 5).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-[13px] md:text-[15px] font-black">
                  <span className="truncate pr-4 opacity-70">{t.titre}</span>
                  <span className="text-[#00f2ff] shrink-0">{t.price}€</span>
                </div>
              ))}
            </div>
            <div className="space-y-6">
                <button onClick={onBookingClick} className="w-full py-8 rounded-[30px] text-[13px] font-black tracking-[0.4em] bg-[#bc13fe] text-white shadow-[0_15px_30px_rgba(188,19,254,0.3)] hover:scale-[1.02] active:scale-95 transition-all">INITIALISER_RDV</button>
                {session && (
                    <button onClick={() => setShowChat(true)} className="w-full py-8 rounded-[30px] text-[13px] font-black tracking-[0.4em] border-2 border-current hover:bg-current hover:text-white transition-all flex items-center justify-center gap-4">
                        <i className="fas fa-comments"></i> CHAT_DIRECT
                    </button>
                )}
            </div>
          </div>
        </aside>
      </main>

      {/* 05. FAQ ACCORDÉON */}
      {pro.faq && pro.faq.length > 0 && (
        <section className="w-full px-6 md:px-20 py-20">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-current/10 text-xl">05</div>
            <h4 className="text-[12px] md:text-[14px] tracking-[0.6em] font-black uppercase">QUESTIONS_FRÉQUENTES</h4>
          </div>

          <div className="space-y-6 max-w-5xl">
            {pro.faq.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className={`rounded-[40px] border transition-all duration-500 overflow-hidden ${isOpen ? (dark ? 'bg-white/[0.07] border-[#bc13fe]' : 'bg-black/[0.03] border-[#bc13fe]') : (dark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.01] border-black/5')}`}>
                  <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full p-10 md:p-12 flex justify-between items-center text-left transition-all">
                    <div className="flex gap-8 items-center">
                      <span className={`text-[12px] font-black italic transition-colors ${isOpen ? 'text-[#bc13fe]' : 'opacity-20'}`}>{String(i + 1).padStart(2, '0')}</span>
                      <h5 className="text-[16px] md:text-[18px] font-black italic uppercase leading-tight tracking-tight">{item.question}</h5>
                    </div>
                    <div className={`w-10 h-10 rounded-full border border-current/20 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180 bg-[#bc13fe] border-[#bc13fe] text-white' : 'opacity-40'}`}><i className="fas fa-chevron-down text-[10px]"></i></div>
                  </button>
                  <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-10 md:px-28 pb-12">
                      <div className="h-[2px] w-16 bg-[#00f2ff] mb-8"></div>
                      <p className="text-[16px] md:text-[18px] opacity-90 normal-case italic leading-relaxed font-medium">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 06. LOCALISATION */}
      <section className="w-full px-6 md:px-20 pb-40 py-20">
        <div className="flex items-center gap-6 mb-20">
          <div className="w-14 h-14 rounded-2xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20 text-xl">06</div>
          <h4 className="text-[12px] md:text-[14px] tracking-[0.6em] text-[#00f2ff] font-black uppercase">STUDIO_LOCALISATION</h4>
        </div>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 h-auto lg:h-[700px]">
          <div className="lg:col-span-8 h-[400px] lg:h-full rounded-[60px] overflow-hidden border shadow-2xl relative">
            <iframe width="100%" height="100%" frameBorder="0" style={{ filter: dark ? 'invert(90%)' : 'grayscale(1)', opacity: 0.85 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(pro.adresse)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
          </div>
          <div className={`lg:col-span-4 p-12 md:p-16 rounded-[60px] border flex flex-col justify-center gap-12 ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            <h5 className="text-5xl font-black italic tracking-tighter leading-none">ACCÈS_<span className="text-[#00f2ff]">UNIT</span></h5>
            <p className="text-[18px] md:text-[20px] opacity-90 leading-relaxed italic normal-case font-medium">{pro.adresse}</p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pro.adresse)}`} target="_blank" className="flex items-center justify-between p-8 rounded-[30px] bg-white/5 border border-white/10 hover:bg-[#00f2ff] hover:text-black transition-all shadow-xl group">
                <span className="text-[14px] font-black">LANCER_NAVIGATION</span><i className="fas fa-location-arrow group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform"></i>
            </a>
          </div>
        </div>
      </section>

      {showChat && session && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="w-full max-w-lg h-[600px] relative">
             <ChatBox receiverId={pro.id} receiverName={pro.nom_commercial} senderId={session.user.id} onClose={() => setShowChat(false)} dark={dark} />
           </div>
        </div>
      )}
    </div>
  );
}