import {
    addDays,
    addWeeks,
    format,
    isSameDay,
    startOfWeek,
    subWeeks
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../utils/storage';

export default function ProDashboard({ session, dark }) {
  const [profile, setProfile] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const scrollContainerRef = useRef(null);

  const [viewMode, setViewMode] = useState('workWeek');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const hours = Array.from({ length: 15 }, (_, i) => (i + 7).toString().padStart(2, '0') + ':00');

  // Calcul des jours à afficher (FIX: Déclaration correcte)
  const displayedDays = (() => {
    if (viewMode === 'day') return [currentDate];
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const daysCount = viewMode === 'workWeek' ? 5 : 7;
    return Array.from({ length: daysCount }, (_, i) => addDays(start, i));
  })();

  const fetchAppointments = useCallback(async () => {
    const { data: apps, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('pro_id', session.user.id)
        .order('appointment_date', { ascending: true });
    if (!error) setAppointments(apps || []);
  }, [session.user.id]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: prof } = await supabase.from('profiles_pro').select('*').eq('id', session.user.id).maybeSingle();
    if (prof) setProfile(prof);
    else setIsConfiguring(true);
    await fetchAppointments();
    setLoading(false);
  }, [session.user.id, fetchAppointments]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (appId, newStatus) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', appId);
    if (!error) fetchAppointments();
  };

  const glass = dark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.03] border-black/10';

  if (loading) return <div className="pt-40 text-center animate-pulse font-black italic uppercase tracking-widest text-[#00f2ff]">Sync_Command_Center...</div>;

  return (
    <div className={`pt-40 pb-20 px-6 md:px-12 max-w-[1800px] mx-auto font-black italic uppercase ${dark ? 'text-white' : 'text-black'}`}>
      
      {isConfiguring ? (
        <ProCMS profile={profile} session={session} dark={dark} onComplete={() => { setIsConfiguring(false); fetchData(); }} />
      ) : (
        <div className="animate-in fade-in duration-700">
          
          {/* HEADER DASHBOARD */}
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#bc13fe] flex items-center justify-center shadow-lg shadow-[#bc13fe]/30">
                  <i className="fas fa-terminal text-white"></i>
                </div>
                <h2 className="text-6xl font-black tracking-tighter italic leading-none">COMMAND_<span className="text-[#bc13fe]">UNIT</span></h2>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center p-1 rounded-full border ${glass} backdrop-blur-md`}>
                   <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="w-10 h-10 flex items-center justify-center hover:text-[#00f2ff] transition-all text-xl">←</button>
                   <button onClick={() => setCurrentDate(new Date())} className="px-4 text-[9px] opacity-50 hover:opacity-100 uppercase">Aujourd'hui</button>
                   <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="w-10 h-10 flex items-center justify-center hover:text-[#00f2ff] transition-all">→</button>
                </div>
                <span className="text-xl lowercase first-letter:uppercase">{format(currentDate, 'MMMM yyyy', { locale: fr })}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-end">
                <div className={`p-1 rounded-full border ${glass} flex backdrop-blur-xl`}>
                    <button onClick={() => setViewMode('day')} className={`px-6 py-2 rounded-full text-[9px] transition-all ${viewMode === 'day' ? 'bg-[#00f2ff] text-black' : 'opacity-40'}`}>Jour</button>
                    <button onClick={() => setViewMode('workWeek')} className={`px-6 py-2 rounded-full text-[9px] transition-all ${viewMode === 'workWeek' ? 'bg-[#00f2ff] text-black' : 'opacity-40'}`}>Semaine_Pro</button>
                    <button onClick={() => setViewMode('fullWeek')} className={`px-6 py-2 rounded-full text-[9px] transition-all ${viewMode === 'fullWeek' ? 'bg-[#00f2ff] text-black' : 'opacity-40'}`}>Semaine_7j</button>
                </div>
                <div className={`p-1 rounded-full border ${glass} flex backdrop-blur-xl`}>
                    <button onClick={() => setActiveTab('missions')} className={`px-8 py-3 rounded-full text-[9px] transition-all ${activeTab === 'missions' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>Missions_List</button>
                    <button onClick={() => setActiveTab('agenda')} className={`px-8 py-3 rounded-full text-[9px] transition-all ${activeTab === 'agenda' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>Master_Agenda</button>
                    <button onClick={() => setIsConfiguring(true)} className="px-8 py-3 rounded-full text-[9px] border border-white/10 hover:bg-white hover:text-black transition-all">Studio_Settings</button>
                </div>
            </div>
          </div>

          {/* TAB: AGENDA */}
          {activeTab === 'agenda' && (
            <div ref={scrollContainerRef} className={`p-4 rounded-[60px] border ${glass} overflow-hidden flex flex-col h-[700px] shadow-2xl backdrop-blur-3xl animate-in slide-in-from-right-8`}>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="sticky top-0 z-30">
                      <th className={`p-4 border-b ${glass} text-left w-24 sticky left-0 z-50 ${dark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}><span className="text-[9px] opacity-40">TIME</span></th>
                      {displayedDays.map(day => (
                        <th key={day.toString()} className={`p-4 border-b ${glass} min-w-[200px] text-center ${isSameDay(day, new Date()) ? 'bg-[#00f2ff]/10' : ''}`}>
                          <p className="text-[11px] tracking-widest text-[#00f2ff]">{format(day, 'EEE dd', { locale: fr })}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hours.map((hour) => (
                      <tr key={hour} data-hour={hour}>
                        <td className={`p-4 border-b border-white/5 sticky left-0 z-20 font-black text-[11px] opacity-30 ${dark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>{hour}</td>
                        {displayedDays.map(day => {
                          const rdv = appointments.find(a => a.appointment_date === format(day, 'yyyy-MM-dd') && a.appointment_time.startsWith(hour.split(':')[0]) && a.status === 'confirmé');
                          return (
                            <td key={day.toString()} className={`border-b border-white/5 border-l h-24 relative ${isSameDay(day, new Date()) ? 'bg-[#00f2ff]/5' : ''}`}>
                               {rdv && (
                                 <div className="absolute inset-1 bg-white text-black p-3 rounded-[20px] shadow-xl flex flex-col justify-between hover:bg-[#00f2ff] transition-all cursor-pointer overflow-hidden">
                                    <div className="text-left"><p className="text-[10px] font-black leading-tight truncate">{rdv.client_name}</p><p className="text-[7px] opacity-60 uppercase font-bold truncate">{rdv.service_type}</p></div>
                                    <span className="text-[8px] font-black opacity-40 self-end">@{rdv.appointment_time}</span>
                                 </div>
                               )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MISSIONS (Avec Terminal de paiement intégré) */}
          {activeTab === 'missions' && (
            <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-8">
              {appointments.map((app) => (
                <MissionCard 
                    key={app.id} 
                    app={app} 
                    dark={dark} 
                    glass={glass} 
                    updateStatus={updateStatus} 
                    setActiveChat={setActiveChat}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeChat && <ChatBox receiverId={activeChat.id} receiverName={activeChat.name} senderId={session.user.id} onClose={() => setActiveChat(null)} dark={dark} />}
    </div>
  );
}

// COMPOSANT MISSION AVEC LOGIQUE DE VALIDATION CODE
function MissionCard({ app, dark, glass, updateStatus, setActiveChat }) {
    const [vCode, setVCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

const handleVerify = async () => {
    // On nettoie les deux valeurs avant de comparer
    const inputCode = vCode.trim().toUpperCase();
    const serverCode = app.validation_code ? app.validation_code.trim().toUpperCase() : '';

    if(inputCode === serverCode && serverCode !== '') {
        setIsVerifying(true);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ 
                    status: 'terminé', 
                    payment_status: 'released' // On libère l'argent
                })
                .eq('id', app.id);

            if (error) throw error;
            
            alert("PAIEMENT LIBÉRÉ : Mission terminée avec succès.");
            await updateStatus(app.id, 'terminé'); // Sync avec le reste de l'UI
        } catch (err) {
            alert("Erreur lors de la mise à jour : " + err.message);
        } finally {
            setIsVerifying(false);
        }
    } else {
        alert("CODE INVALIDE : Vérifiez le code fourni par le client.");
        console.log("Debug - Saisi:", inputCode, "Attendu:", serverCode); // Regarde dans ta console F12
    }
};
    return (
        <div className={`p-8 md:p-10 rounded-[50px] border ${glass} flex flex-col gap-8 group hover:border-[#00f2ff]/50 transition-all duration-500 text-left`}>
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#bc13fe] to-[#00f2ff] flex items-center justify-center text-black font-black text-xl shadow-lg">
                {app.client_name ? app.client_name[0] : 'U'}
              </div>
              <div>
                <p className="text-[20px] mb-1 font-black tracking-tighter">{app.client_name}</p>
                <p className="text-[10px] text-[#00f2ff] tracking-[0.3em] font-bold uppercase">{app.service_type || 'CUSTOM_PROTOCOL'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-black tracking-tighter">{app.appointment_date}</p>
              <p className="text-[11px] opacity-40 italic">H_START: {app.appointment_time}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setActiveChat({ id: app.client_id, name: app.client_name })} className="w-14 h-14 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <i className="fas fa-comment-dots"></i>
              </button>
              {app.status === 'en attente' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(app.id, 'confirmé')} className="w-14 h-14 bg-[#00f2ff] text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"><i className="fas fa-check"></i></button>
                  <button onClick={() => updateStatus(app.id, 'refusé')} className="w-14 h-14 border border-white/20 rounded-full flex items-center justify-center hover:bg-red-500 transition-all"><i className="fas fa-times"></i></button>
                </div>
              )}
            </div>
          </div>

          {app.status === 'confirmé' && (
            <div className={`mt-4 p-8 rounded-[35px] border-2 border-dashed ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} flex flex-col md:flex-row items-center gap-6 animate-in zoom-in-95`}>
              <div className="text-left flex-1">
                <h5 className="text-[10px] font-black tracking-[0.4em] text-[#00f2ff] mb-2 uppercase italic">Paiement_Escrow_Sécurisé</h5>
                <p className="text-[9px] opacity-40 normal-case italic">Saisissez le code de validation client pour débloquer les fonds.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <input 
                  type="text" maxLength="6" placeholder="CODE"
                  value={vCode} onChange={(e) => setVCode(e.target.value.toUpperCase())}
                  className="w-32 bg-black border border-white/10 p-4 rounded-2xl text-center font-mono tracking-[0.4em] text-[#00f2ff] outline-none"
                />
                <button 
                  onClick={handleVerify}
                  disabled={vCode.length !== 6 || isVerifying}
                  className={`px-8 py-4 rounded-2xl font-black italic text-[10px] transition-all ${vCode.length === 6 ? 'bg-[#00f2ff] text-black shadow-lg shadow-[#00f2ff]/20' : 'bg-white/5 opacity-20'}`}
                >VALIDER</button>
              </div>
            </div>
          )}

          {app.status === 'terminé' && (
            <div className="flex items-center justify-center gap-4 p-6 rounded-[30px] bg-green-500/10 border border-green-500/20 text-green-500">
               <i className="fas fa-check-double animate-pulse"></i>
               <span className="text-[10px] font-black tracking-[0.5em] uppercase italic">Paiement_Libéré_Mission_OK</span>
            </div>
          )}
        </div>
    );
}


function ProCMS({ supabase, profile, session, dark, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const initialServices = Array.isArray(profile?.services_list) 
    ? profile.services_list 
    : [{ titre: '', desc: '', price: '', images: [] }];

  const [formData, setFormData] = useState({
    nom_commercial: profile?.nom_commercial || '',
    adresse: profile?.adresse || '',
    instagram_url: profile?.instagram_url || '',
    about_text: profile?.about_text || '',
    bio: profile?.bio || '',
    cover_url: profile?.cover_url || '',
    catalog_images: Array.isArray(profile?.catalog_images) ? profile.catalog_images : [],
    services_list: initialServices,
    working_days: Array.isArray(profile?.working_days) ? profile.working_days : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    working_hours: profile?.working_hours || { start: "08:00", end: "18:00" },
    equipment: Array.isArray(profile?.equipment) ? profile.equipment : [],
    certifications: Array.isArray(profile?.certifications) ? profile.certifications : [],
    faq: Array.isArray(profile?.faq) ? profile.faq : [{ question: '', answer: '' }],
  });

  // --- HANDLERS FAQ ---
  const addFaq = () => {
    setFormData(prev => ({ ...prev, faq: [...prev.faq, { question: '', answer: '' }] }));
  };

  const updateFaq = (index, field, value) => {
    const newFaq = [...formData.faq];
    newFaq[index][field] = value;
    setFormData(prev => ({ ...prev, faq: newFaq }));
  };

  const removeFaq = (index) => {
    setFormData(prev => ({ ...prev, faq: prev.faq.filter((_, i) => i !== index) }));
  };

  // --- HANDLERS SERVICES ---
  const addService = () => {
    setFormData(prev => ({ ...prev, services_list: [...prev.services_list, { titre: '', desc: '', price: '', images: [] }] }));
  };

  const updateService = (index, field, value) => {
    const newList = [...formData.services_list];
    newList[index][field] = value;
    setFormData(prev => ({ ...prev, services_list: newList }));
  };

  const removeService = (index) => {
    setFormData(prev => ({ ...prev, services_list: prev.services_list.filter((_, i) => i !== index) }));
  };

  const handleServiceImage = async (serviceIndex, imgIndex, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      const newList = [...formData.services_list];
      const serviceImages = Array.isArray(newList[serviceIndex].images) ? [...newList[serviceIndex].images] : [];
      serviceImages[imgIndex] = url;
      newList[serviceIndex].images = serviceImages;
      setFormData(prev => ({ ...prev, services_list: newList }));
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  // --- HANDLERS GENERAUX ---
  const handleFile = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      if (field === 'catalog_images') {
        setFormData(prev => ({...prev, catalog_images: [...prev.catalog_images, url]}));
      } else {
        setFormData(prev => ({...prev, [field]: url}));
      }
    } catch (err) { alert(err.message); }
    setLoading(false);
    e.target.value = ""; 
  };

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles_pro').upsert({ 
        id: session.user.id, 
        ...formData, 
        is_visible: true, 
        updated_at: new Date() 
    });
    if (error) alert(error.message);
    else onComplete();
    setLoading(false);
  };

  const inputStyle = `w-full border p-6 rounded-[25px] mb-4 outline-none font-black italic uppercase transition-all ${dark ? 'bg-black text-white border-white/10 focus:border-[#bc13fe]' : 'bg-slate-50 text-black border-black/10 focus:border-[#bc13fe]'}`;

  return (
    <div className={`p-12 rounded-[60px] border shadow-2xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'} max-w-4xl mx-auto`}>
      
      <div className="mb-12 flex flex-wrap justify-between text-[7px] opacity-40 font-black tracking-[0.5em] italic gap-4 uppercase">
        {["Identité", "Visuels", "Manifesto", "Services", "Planning", "FAQ"].map((n, i) => (
          <span key={i} className={step === i + 1 ? "text-[#bc13fe] border-b-2 border-[#bc13fe] pb-2" : ""}>{n}</span>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-in slide-in-from-right-4 text-left">
          <h2 className="text-4xl mb-10 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">01_CORE_IDENTITY</h2>
          <input className={inputStyle} value={formData.nom_commercial || ''} placeholder="NOM DU STUDIO" onChange={e => setFormData({...formData, nom_commercial: e.target.value})} />
          <input className={inputStyle} value={formData.adresse || ''} placeholder="ADRESSE PRÉCISE (POUR LA CARTE GPS)" onChange={e => setFormData({...formData, adresse: e.target.value})} />
          <input className={inputStyle} value={formData.instagram_url || ''} placeholder="INSTAGRAM (@UTILISATEUR)" onChange={e => setFormData({...formData, instagram_url: e.target.value})} />
        </div>
      )}

      {step === 2 && (
        <div className="animate-in slide-in-from-right-4 space-y-12 text-left">
          <h2 className="text-4xl mb-10 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">02_VISUAL_ASSETS</h2>
          <div>
            <p className="text-[8px] mb-4 opacity-40 uppercase tracking-widest font-black">Bannière Principale</p>
            <label htmlFor="cover-up" className="w-full h-48 border-2 border-dashed border-current/10 rounded-[40px] flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-[#bc13fe] transition-all">
              {formData.cover_url ? <img src={formData.cover_url} className="w-full h-full object-cover" /> : <span className="opacity-20 group-hover:opacity-100 uppercase text-[10px]">UPLOAD_COVER</span>}
              <input id="cover-up" type="file" className="hidden" onChange={e => handleFile(e, 'cover_url')} />
            </label>
          </div>
          <div>
            <p className="text-[8px] mb-4 opacity-40 uppercase tracking-widest font-black">Galerie Portfolio (Max 5)</p>
            <div className="grid grid-cols-5 gap-4">
              {formData.catalog_images.map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData(prev => ({...prev, catalog_images: prev.catalog_images.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center font-black">✕</button>
                </div>
              ))}
              {formData.catalog_images.length < 5 && (
                <>
                    <label htmlFor="catalog-add" className="aspect-square border-2 border-dashed border-current/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-[#bc13fe] transition-all">+</label>
                    <input id="catalog-add" type="file" className="hidden" onChange={e => handleFile(e, 'catalog_images')} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in slide-in-from-right-4 text-left">
          <h2 className="text-4xl mb-10 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">03_MANIFESTO</h2>
          <input className={inputStyle} value={formData.about_text || ''} placeholder="TON SLOGAN (ACCROCHE)" onChange={e => setFormData({...formData, about_text: e.target.value})} />
          <textarea className={`${inputStyle} h-48 normal-case`} value={formData.bio || ''} placeholder="TA BIO / TON HISTOIRE..." onChange={e => setFormData({...formData, bio: e.target.value})} />
        </div>
      )}

      {step === 4 && (
        <div className="animate-in slide-in-from-right-4 text-left">
          <h2 className="text-4xl mb-10 italic font-black uppercase tracking-tighter decoration-[#00f2ff] underline underline-offset-8">04_SERVICES</h2>
          <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {formData.services_list.map((service, index) => (
              <div key={index} className="p-8 rounded-[40px] border border-current/10 mb-6 bg-current/[0.02] relative group">
                <button type="button" onClick={() => removeService(index)} className="absolute -top-3 -right-3 w-10 h-10 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg z-10">
                  <i className="fas fa-trash-can text-xs"></i>
                </button>
                <div className="flex gap-4 mb-4">
                  <input className={inputStyle} placeholder="SERVICE" value={service.titre} onChange={(e) => updateService(index, 'titre', e.target.value)} />
                  <input className={`${inputStyle} w-32`} placeholder="€" type="number" value={service.price} onChange={(e) => updateService(index, 'price', e.target.value)} />
                </div>
                <textarea className={`${inputStyle} h-24 normal-case mb-4`} placeholder="EXPLICATION TECHNIQUE..." value={service.desc} onChange={(e) => updateService(index, 'desc', e.target.value)} />
                <div className="flex gap-4">
                  {[0, 1, 2].map((imgIdx) => (
                    <div key={imgIdx} className="w-20 h-20 rounded-xl border-2 border-dashed border-current/10 overflow-hidden relative group">
                      {service.images?.[imgIdx] ? <img src={service.images[imgIdx]} className="w-full h-full object-cover" /> : <label htmlFor={`service-${index}-img-${imgIdx}`} className="absolute inset-0 flex items-center justify-center opacity-20 cursor-pointer hover:opacity-100 transition-all italic text-[8px] font-black uppercase">ADD_IMG</label>}
                      <input id={`service-${index}-img-${imgIdx}`} type="file" className="hidden" onChange={(e) => handleServiceImage(index, imgIdx, e.target.files[0])} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addService} className="w-full py-4 border-2 border-dashed border-current/10 rounded-3xl opacity-50 hover:opacity-100 transition-all">+ AJOUTER_SERVICE</button>
        </div>
      )}

      {step === 5 && (
        <div className="animate-in slide-in-from-right-4 text-left space-y-10">
          <h2 className="text-4xl mb-10 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">05_PLANNING</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => (
                <button key={day} type="button" onClick={() => {
                    const cur = [...formData.working_days];
                    const i = cur.indexOf(day);
                    if (i > -1) cur.splice(i, 1); else cur.push(day);
                    setFormData({...formData, working_days: cur});
                }} className={`p-6 rounded-3xl border transition-all text-[10px] font-black italic ${formData.working_days.includes(day) ? 'bg-[#bc13fe] border-[#bc13fe] text-white shadow-lg' : 'opacity-20'}`}>
                    {day}
                </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-10">
                <input type="time" className={inputStyle} value={formData.working_hours.start} onChange={e => setFormData({...formData, working_hours: {...formData.working_hours, start: e.target.value}})} />
                <input type="time" className={inputStyle} value={formData.working_hours.end} onChange={e => setFormData({...formData, working_hours: {...formData.working_hours, end: e.target.value}})} />
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="animate-in slide-in-from-right-4 text-left">
          <h2 className="text-4xl mb-10 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">06_STUDIO_FAQ</h2>
          <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {formData.faq.map((item, index) => (
              <div key={index} className="p-8 rounded-[40px] border border-current/10 mb-6 bg-current/[0.02] relative group">
                <button type="button" onClick={() => removeFaq(index)} className="absolute -top-3 -right-3 w-10 h-10 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg z-10">
                  <i className="fas fa-trash-can text-xs"></i>
                </button>
                <div className="space-y-4">
                  <input className={inputStyle} placeholder="QUESTION" value={item.question} onChange={(e) => updateFaq(index, 'question', e.target.value)} />
                  <textarea className={`${inputStyle} h-32 normal-case font-medium`} placeholder="RÉPONSE..." value={item.answer} onChange={(e) => updateFaq(index, 'answer', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addFaq} className="w-full py-6 border-2 border-dashed border-current/10 rounded-[30px] opacity-50 hover:opacity-100 transition-all font-black italic uppercase text-[10px] tracking-widest">+ AJOUTER_FAQ</button>
        </div>
      )}

      <div className="flex justify-between mt-20 pt-10 border-t border-white/5 font-black italic uppercase">
        {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="text-[12px] opacity-40 hover:opacity-100 transition-colors">BACK</button>}
        <button onClick={() => step < 6 ? setStep(step + 1) : save()} disabled={loading} className="ml-auto px-16 py-7 rounded-full bg-white text-black text-[12px] hover:bg-[#00f2ff] transition-all shadow-xl font-black active:scale-95">
            {loading ? 'SYNCING...' : step < 6 ? 'NEXT' : 'SAVE_STUDIO'}
        </button>
      </div>
    </div>
  );
}