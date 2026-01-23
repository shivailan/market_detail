import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../utils/storage';

export default function ProDashboard({ session, dark }) {
  // --- ÉTATS ---
  const [profile, setProfile] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [viewMode, setViewMode] = useState('workWeek'); // 'day' ou 'workWeek'
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollContainerRef = useRef(null);

  // Génération des heures de 07h à 21h
  const hours = Array.from({ length: 15 }, (_, i) => (i + 7).toString().padStart(2, '0') + ':00');

  // --- STATS FINANCIÈRES (Argument de vente SaaS) ---
  const stats = {
    escrow: appointments
      .filter(a => a.payment_status === 'escrow' && a.status !== 'annulé')
      .reduce((sum, a) => sum + Number(a.total_price || 0), 0),
    released: appointments
      .filter(a => a.payment_status === 'released')
      .reduce((sum, a) => sum + Number(a.total_price || 0), 0)
  };

  // --- LOGIQUE DE NAVIGATION TEMPORELLE ---
  const displayedDays = (() => {
    if (viewMode === 'day') return [currentDate];
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const daysCount = viewMode === 'workWeek' ? 5 : 7;
    return Array.from({ length: daysCount }, (_, i) => addDays(start, i));
  })();

  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  // --- RÉCUPÉRATION DES DONNÉES ---
  const fetchAppointments = useCallback(async () => {
    const { data: apps, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('pro_id', session.user.id);
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

  // --- SCROLL AUTO SUR L'HEURE ACTUELLE ---
  useEffect(() => {
    if (activeTab === 'agenda' && scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      const targetRow = document.querySelector(`[data-hour="${currentHour.toString().padStart(2, '0')}:00"]`);
      if (targetRow) {
        targetRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  const updateStatus = async (appId, newStatus) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', appId);
    if (!error) fetchAppointments();
  };

  const processedMissions = appointments
    .filter(app => statusFilter === 'tous' || app.status === statusFilter)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const glass = dark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.03] border-black/10';

  if (loading) return <div className="pt-40 text-center animate-pulse font-black italic uppercase tracking-[0.4em] text-[#00f2ff]">Sync_Command_Center...</div>;

  return (
    <div className={`pt-24 md:pt-40 pb-20 px-4 md:px-12 max-w-[1800px] mx-auto font-black italic uppercase transition-all text-left ${dark ? 'text-white' : 'text-black'}`}>
      
      {isConfiguring ? (
        <ProCMS supabase={supabase} profile={profile} session={session} dark={dark} onComplete={() => { setIsConfiguring(false); fetchData(); }} />
      ) : (
        <div className="animate-in fade-in duration-700">
          
          {/* HEADER AVEC FINANCES & NAVIGATION */}
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-12 gap-8">
            <div className="space-y-6 w-full lg:w-auto">
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-2xl bg-[#bc13fe] flex items-center justify-center shadow-lg shadow-[#bc13fe]/30">
                  <i className="fas fa-terminal text-white"></i>
                </div>
                <h2 className="text-4xl md:text-6xl tracking-tighter italic leading-none">COMMAND_<span className="text-[#bc13fe]">UNIT</span></h2>
              </div>
              
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                  <div className="border-l-2 border-[#00f2ff] pl-4">
                      <p className="text-[8px] opacity-40 tracking-widest">EN_SÉQUESTRE</p>
                      <p className="text-xl font-black text-[#00f2ff]">{stats.escrow}€</p>
                  </div>
                  <div className="border-l-2 border-[#bc13fe] pl-4">
                      <p className="text-[8px] opacity-40 tracking-widest">CA_LIBÉRÉ</p>
                      <p className="text-xl font-black text-[#bc13fe]">{stats.released}€</p>
                  </div>
              </div>
            </div>

            {/* BARRE DE CONTRÔLE FLUIDE */}
            <div className="flex flex-col gap-4 items-center lg:items-end w-full lg:w-auto">
                <div className={`flex items-center p-1 rounded-full border ${glass} backdrop-blur-md`}>
                   <button onClick={handlePrev} className="w-10 h-10 flex items-center justify-center hover:text-[#00f2ff] transition-all text-xl">←</button>
                   <button onClick={goToToday} className="px-6 text-[9px] font-black tracking-widest border-x border-white/10">AUJ.</button>
                   <button onClick={handleNext} className="w-10 h-10 flex items-center justify-center hover:text-[#00f2ff] transition-all text-xl">→</button>
                </div>
                <div className={`p-1 rounded-full border ${glass} flex backdrop-blur-xl w-full sm:w-fit overflow-x-auto no-scrollbar`}>
                    <button onClick={() => setViewMode('day')} className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-[9px] transition-all ${viewMode === 'day' ? 'bg-[#00f2ff] text-black' : 'opacity-40'}`}>Jour</button>
                    <button onClick={() => setViewMode('workWeek')} className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-[9px] transition-all ${viewMode === 'workWeek' ? 'bg-[#00f2ff] text-black' : 'opacity-40'}`}>Semaine</button>
                    <button onClick={() => setActiveTab('missions')} className={`flex-1 sm:flex-none px-8 py-3 rounded-full text-[9px] transition-all ${activeTab === 'missions' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>Missions</button>
                    <button onClick={() => setActiveTab('agenda')} className={`flex-1 sm:flex-none px-8 py-3 rounded-full text-[9px] transition-all ${activeTab === 'agenda' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>Master_Agenda</button>
                    <button onClick={() => setIsConfiguring(true)} className="flex-1 sm:flex-none px-8 py-3 rounded-full text-[9px] border border-white/10 hover:bg-white hover:text-black transition-all">Settings</button>
                </div>
            </div>
          </div>

          {/* TAB: AGENDA ULTRA-FLUIDE */}
{/* TAB: AGENDA COMPACT "ONE-LOOK" */}
{activeTab === 'agenda' && (
  <div className="animate-in fade-in zoom-in-95 duration-500">
    <div className={`rounded-[30px] md:rounded-[50px] border ${glass} overflow-hidden flex flex-col h-[calc(100vh-250px)] shadow-2xl backdrop-blur-3xl`}>
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="min-w-[800px] lg:min-w-full h-full">
          <table className="w-full border-collapse table-fixed h-full">
            <thead>
              <tr className="sticky top-0 z-40">
                <th className={`p-2 border-b ${glass} w-16 sticky left-0 z-50 ${dark ? 'bg-[#050505]' : 'bg-white'}`}>
                  <span className="text-[7px] opacity-30 tracking-tighter">TIME</span>
                </th>
                {displayedDays.map(day => (
                  <th key={day.toString()} className={`p-2 border-b ${glass} text-center ${isSameDay(day, new Date()) ? 'bg-[#00f2ff]/5' : ''}`}>
                    <p className={`text-[9px] font-black tracking-widest ${isSameDay(day, new Date()) ? 'text-[#00f2ff]' : 'opacity-40'}`}>
                      {format(day, 'EEE dd', { locale: fr }).toUpperCase()}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* On réduit la liste des heures pour se concentrer sur l'essentiel (ex: 8h-19h) */}
              {hours.filter(h => parseInt(h) >= 8 && parseInt(h) <= 19).map((hour) => {
                const isCurrentHour = new Date().getHours().toString().padStart(2, '0') + ':00' === hour;
                return (
                  <tr key={hour} className="group h-12"> {/* Hauteur fixe réduite à 12 (48px env) */}
                    <td className={`p-2 border-b border-white/5 sticky left-0 z-30 font-black text-[9px] transition-all ${isCurrentHour ? 'text-[#00f2ff]' : 'opacity-10 group-hover:opacity-100'} ${dark ? 'bg-[#050505]' : 'bg-white'}`}>
                      {hour}
                    </td>
                    {displayedDays.map(day => {
                      const rdv = appointments.find(a => 
                        a.appointment_date === format(day, 'yyyy-MM-dd') && 
                        a.appointment_time.startsWith(hour.split(':')[0]) && 
                        a.status === 'confirmé'
                      );
                      return (
                        <td key={day.toString()} className={`border-b border-white/5 border-l border-white/5 relative transition-colors hover:bg-white/[0.01]`}>
                          {isCurrentHour && isSameDay(day, new Date()) && (
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f2ff] shadow-[0_0_10px_#00f2ff] z-20"></div>
                          )}
                          {rdv && (
                            <div 
                              onClick={() => setActiveChat({ id: rdv.client_id, name: rdv.client_name })}
                              className="absolute inset-[2px] bg-white text-black p-1.5 rounded-xl shadow-lg flex flex-col justify-center hover:scale-[1.02] hover:bg-[#00f2ff] transition-all cursor-pointer z-10 overflow-hidden"
                            >
                              <p className="text-[8px] font-black leading-none truncate uppercase tracking-tighter">{rdv.client_name?.split('@')[0]}</p>
                              <p className="text-[6px] font-bold opacity-60 truncate uppercase">{rdv.service_selected}</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)}          {/* TAB: MISSIONS (Avec Validation du Code) */}
          {activeTab === 'missions' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <div className="flex gap-2 overflow-x-auto no-scrollbar p-2">
                  {['tous', 'en attente', 'confirmé', 'terminé', 'annulé'].map((status) => (
                      <button key={status} onClick={() => setStatusFilter(status)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap border ${statusFilter === status ? 'bg-[#bc13fe] text-white' : 'border-white/10 opacity-40'}`}>
                          {status}
                      </button>
                  ))}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {processedMissions.map((app) => (
                  <MissionCard 
                    key={app.id} app={app} dark={dark} glass={glass} 
                    updateStatus={updateStatus} setActiveChat={setActiveChat} fetchAppointments={fetchAppointments} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeChat && <ChatBox receiverId={activeChat.id} receiverName={activeChat.name} senderId={session.user.id} onClose={() => setActiveChat(null)} dark={dark} />}
    </div>
  );
}

// --- SOUS-COMPOSANT MISSION CARD (Gère la validation du code) ---
function MissionCard({ app, dark, glass, updateStatus, setActiveChat, fetchAppointments }) {
    const [vCode, setVCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        const inputCode = vCode.trim().toUpperCase();
        const serverCode = app.validation_code ? app.validation_code.trim().toUpperCase() : '';

        if(inputCode === serverCode && serverCode !== '') {
            setIsVerifying(true);
            try {
                const { error } = await supabase.from('appointments').update({ status: 'terminé', payment_status: 'released' }).eq('id', app.id);
                if (error) throw error;
                alert("SYSTÈME_SÉCURISÉ : Paiement libéré !");
                fetchAppointments();
            } catch (err) { alert(err.message); } finally { setIsVerifying(false); setVCode(''); }
        } else { alert("CODE_INVALIDE."); }
    };

    return (
        <div className={`p-6 md:p-10 rounded-[35px] md:rounded-[50px] border ${glass} flex flex-col gap-6 transition-all hover:border-[#00f2ff]/30 text-left`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-black font-black bg-[#bc13fe]">
                {app.client_name ? app.client_name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                    <p className="text-xl font-black italic uppercase">{app.client_name?.split('@')[0]}</p>
                    <span className={`px-3 py-1 rounded-full text-[7px] border font-black ${app.status === 'confirmé' ? 'text-green-500' : 'text-[#bc13fe]'}`}>{app.status?.toUpperCase()}</span>
                </div>
                <p className="text-[9px] text-[#00f2ff] font-bold uppercase mt-1 italic">{app.service_selected} — {app.total_price}€</p>
              </div>
            </div>
            <div className="text-left md:text-right">
                <p className="text-lg font-black italic uppercase">{app.appointment_date}</p>
                <p className="text-[10px] opacity-40 uppercase font-black italic">@{app.appointment_time}</p>
            </div>
          </div>

          {app.status === 'confirmé' && app.payment_status === 'escrow' && (
            <div className="mt-4 p-6 rounded-[30px] border-2 border-dashed border-[#00f2ff]/20 bg-[#00f2ff]/5 flex flex-col items-center gap-4">
              <p className="text-[9px] font-black text-[#00f2ff] tracking-widest">VALIDATION_SÉQUESTRE</p>
              <div className="flex gap-3 w-full max-w-sm">
                <input type="text" maxLength="7" placeholder="DP-XXXX" value={vCode} onChange={(e) => setVCode(e.target.value.toUpperCase())} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-center font-mono text-xl text-[#00f2ff] outline-none" />
                <button onClick={handleVerify} disabled={vCode.length < 4 || isVerifying} className="px-8 rounded-2xl font-black bg-[#00f2ff] text-black text-[10px]">OK</button>
              </div>
            </div>
          )}

          {app.payment_status === 'released' && (
              <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20 text-center">
                  <p className="text-[9px] font-black text-green-500 uppercase italic">Mission_Terminée_Libérée</p>
              </div>
          )}
        </div>
    );
}

// ... (Ton composant ProCMS original reste identique, il n'a pas besoin de changement ici) ...
function ProCMS({ supabase, profile, session, dark, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const initialServices = Array.isArray(profile?.services_list) ? profile.services_list : [{ titre: '', desc: '', price: '', images: [] }];

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

  const addFaq = () => setFormData(prev => ({ ...prev, faq: [...prev.faq, { question: '', answer: '' }] }));
  const updateFaq = (index, field, value) => {
    const newFaq = [...formData.faq];
    newFaq[index][field] = value;
    setFormData(prev => ({ ...prev, faq: newFaq }));
  };
  const removeFaq = (index) => setFormData(prev => ({ ...prev, faq: prev.faq.filter((_, i) => i !== index) }));

  const addService = () => setFormData(prev => ({ ...prev, services_list: [...prev.services_list, { titre: '', desc: '', price: '', images: [] }] }));
  const updateService = (index, field, value) => {
    const newList = [...formData.services_list];
    newList[index][field] = value;
    setFormData(prev => ({ ...prev, services_list: newList }));
  };
  const removeService = (index) => setFormData(prev => ({ ...prev, services_list: prev.services_list.filter((_, i) => i !== index) }));

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

  const handleFile = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      if (field === 'catalog_images') setFormData(prev => ({...prev, catalog_images: [...prev.catalog_images, url]}));
      else setFormData(prev => ({...prev, [field]: url}));
    } catch (err) { alert(err.message); }
    setLoading(false);
    e.target.value = ""; 
  };

  const save = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles_pro').upsert({ id: session.user.id, ...formData, is_visible: true, updated_at: new Date().toISOString() });
      if (error) throw error;
      onComplete();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const inputStyle = `w-full border p-4 md:p-6 rounded-[20px] mb-4 outline-none font-black italic uppercase transition-all ${dark ? 'bg-black text-white border-white/10 focus:border-[#bc13fe]' : 'bg-slate-50 text-black border-black/10 focus:border-[#bc13fe]'}`;

  return (
    <div className={`p-6 md:p-12 rounded-[40px] md:rounded-[60px] border shadow-2xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'} max-w-4xl mx-auto w-full`}>
      
      <div className="mb-8 md:mb-12 flex items-center overflow-x-auto no-scrollbar gap-6 border-b border-white/5 pb-4">
        {["Identité", "Visuels", "Manifesto", "Services", "Planning", "FAQ"].map((n, i) => (
          <button 
            key={i} 
            onClick={() => setStep(i + 1)}
            className={`text-[8px] font-black tracking-[0.2em] uppercase italic whitespace-nowrap transition-all ${step === i + 1 ? "text-[#bc13fe] scale-110" : "opacity-30"}`}
          >
            {i + 1}. {n}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {step === 1 && (
            <div className="animate-in slide-in-from-right-4 text-left">
              <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">01_IDENTITY</h2>
              <input className={inputStyle} value={formData.nom_commercial} placeholder="NOM DU STUDIO" onChange={e => setFormData({...formData, nom_commercial: e.target.value})} />
              <input className={inputStyle} value={formData.adresse} placeholder="ADRESSE GPS PRÉCISE" onChange={e => setFormData({...formData, adresse: e.target.value})} />
              <input className={inputStyle} value={formData.instagram_url} placeholder="INSTAGRAM (@UTILISATEUR)" onChange={e => setFormData({...formData, instagram_url: e.target.value})} />
            </div>
        )}

        {step === 2 && (
            <div className="animate-in slide-in-from-right-4 space-y-10 text-left">
            <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">02_ASSETS</h2>
            <div>
                <p className="text-[8px] mb-3 opacity-40 uppercase tracking-widest font-black">Cover Banner</p>
                <label htmlFor="cover-up" className="w-full h-32 md:h-48 border-2 border-dashed border-current/10 rounded-[25px] flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all">
                {formData.cover_url ? <img src={formData.cover_url} className="w-full h-full object-cover" /> : <span className="opacity-20 uppercase text-[9px]">UPLOAD_COVER</span>}
                <input id="cover-up" type="file" className="hidden" onChange={e => handleFile(e, 'cover_url')} />
                </label>
            </div>
            <div>
                <p className="text-[8px] mb-3 opacity-40 uppercase tracking-widest font-black">Portfolio Gallery (Max 5)</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {formData.catalog_images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-white/5">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(prev => ({...prev, catalog_images: prev.catalog_images.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center font-black">✕</button>
                    </div>
                ))}
                {formData.catalog_images.length < 5 && (
                    <>
                        <label htmlFor="catalog-add" className="aspect-square border-2 border-dashed border-current/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#bc13fe] transition-all">+</label>
                        <input id="catalog-add" type="file" className="hidden" onChange={e => handleFile(e, 'catalog_images')} />
                    </>
                )}
                </div>
            </div>
            </div>
        )}

        {step === 3 && (
            <div className="animate-in slide-in-from-right-4 text-left">
              <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">03_MANIFESTO</h2>
              <input className={inputStyle} value={formData.about_text} placeholder="TAGLINE / SLOGAN" onChange={e => setFormData({...formData, about_text: e.target.value})} />
              <textarea className={`${inputStyle} h-40 normal-case`} value={formData.bio} placeholder="STUDIO BIO / MISSION..." onChange={e => setFormData({...formData, bio: e.target.value})} />
            </div>
        )}

        
{step === 4 && (
  <div className="animate-in slide-in-from-right-4 text-left">
    <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#00f2ff] underline underline-offset-8">04_EXPERTISE_&_SERVICES</h2>
    
    {/* --- SECTION 1 : TAGS DE RÉFÉRENCEMENT (Pour le filtre client) --- */}
    <div className="mb-12">
      <p className="text-[10px] font-black tracking-[0.3em] opacity-50 mb-4 uppercase italic">Sélectionnez vos pôles d'expertise :</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          "Lavage Manuel", "Polissage", "Protection Céramique", 
          "Pose de PPF", "Nettoyage Intérieur", "Rénovation Cuir", 
          "Optiques de Phare", "Ciel étoilé", "Vitres Teintées"
        ].map(spec => (
          <label 
            key={spec} 
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              formData.expertise?.includes(spec) 
              ? 'bg-[#00f2ff] border-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]' 
              : 'bg-white/5 border-white/10 opacity-40 hover:opacity-100'
            }`}
          >
            <input 
              type="checkbox" 
              className="hidden"
              checked={formData.expertise?.includes(spec)}
              onChange={() => {
                const current = formData.expertise || [];
                const next = current.includes(spec) 
                  ? current.filter(s => s !== spec) 
                  : [...current, spec];
                setFormData({...formData, expertise: next});
              }}
            />
            <i className={`fas ${formData.expertise?.includes(spec) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
            <span className="text-[9px] font-black leading-none">{spec.toUpperCase()}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="h-[1px] w-full bg-white/5 mb-10"></div>

    {/* --- SECTION 2 : ÉDITION DES SERVICES DÉTAILLÉS (Ton code original) --- */}
    <p className="text-[10px] font-black tracking-[0.3em] opacity-50 mb-6 uppercase italic">Détail des prestations & tarifs :</p>
    
    <div className="max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
      {formData.services_list.map((service, index) => (
        <div key={index} className="p-6 md:p-8 rounded-[30px] border border-current/10 mb-6 bg-current/[0.02] relative group transition-all hover:border-[#00f2ff]/30">
          <button type="button" onClick={() => removeService(index)} className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-transform active:scale-90">
            <i className="fas fa-trash text-[10px]"></i>
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input className={inputStyle} placeholder="NOM DU SERVICE (EX: PACK SILVER)" value={service.titre} onChange={(e) => updateService(index, 'titre', e.target.value)} />
            <input className={`${inputStyle} sm:w-32`} placeholder="PRIX €" type="number" value={service.price} onChange={(e) => updateService(index, 'price', e.target.value)} />
          </div>
          
          <textarea className={`${inputStyle} h-20 normal-case mb-4`} placeholder="DESCRIPTION TECHNIQUE DU PROTOCOLE..." value={service.desc} onChange={(e) => updateService(index, 'desc', e.target.value)} />
          
          <div className="flex gap-3">
            {[0, 1, 2].map((imgIdx) => (
              <div key={imgIdx} className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-dashed border-current/10 overflow-hidden relative group flex items-center justify-center bg-black/20">
                {service.images?.[imgIdx] ? (
                  <img src={service.images[imgIdx]} className="w-full h-full object-cover" alt="Service Preview" />
                ) : (
                  <label htmlFor={`service-${index}-img-${imgIdx}`} className="absolute inset-0 flex items-center justify-center opacity-20 cursor-pointer italic text-[7px] font-black uppercase hover:opacity-100 transition-all">ADD_IMG</label>
                )}
                <input id={`service-${index}-img-${imgIdx}`} type="file" className="hidden" onChange={(e) => handleServiceImage(index, imgIdx, e.target.files[0])} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <button type="button" onClick={addService} className="w-full py-5 border-2 border-dashed border-current/10 rounded-2xl opacity-40 hover:opacity-100 hover:border-[#00f2ff] hover:text-[#00f2ff] transition-all text-[10px] font-black tracking-widest mt-4 uppercase">
      + Ajouter une prestation
    </button>
  </div>
)}

        {step === 5 && (
            <div className="animate-in slide-in-from-right-4 text-left space-y-8">
            <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">05_PLANNING</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => (
                    <button key={day} type="button" onClick={() => {
                        const cur = [...formData.working_days];
                        const i = cur.indexOf(day);
                        if (i > -1) cur.splice(i, 1); else cur.push(day);
                        setFormData({...formData, working_days: cur});
                    }} className={`p-4 rounded-2xl border transition-all text-[9px] font-black ${formData.working_days.includes(day) ? 'bg-[#bc13fe] border-[#bc13fe] text-white' : 'opacity-20'}`}>
                        {day}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <p className="text-[8px] opacity-40 ml-2">OPEN_TIME</p>
                    <input type="time" className={inputStyle} value={formData.working_hours.start} onChange={e => setFormData({...formData, working_hours: {...formData.working_hours, start: e.target.value}})} />
                </div>
                <div className="space-y-2">
                    <p className="text-[8px] opacity-40 ml-2">CLOSE_TIME</p>
                    <input type="time" className={inputStyle} value={formData.working_hours.end} onChange={e => setFormData({...formData, working_hours: {...formData.working_hours, end: e.target.value}})} />
                </div>
            </div>
            </div>
        )}

        {step === 6 && (
            <div className="animate-in slide-in-from-right-4 text-left">
            <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">06_FAQ</h2>
            <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {formData.faq.map((item, index) => (
                <div key={index} className="p-6 md:p-8 rounded-[30px] border border-current/10 mb-6 bg-current/[0.02] relative group">
                    <button type="button" onClick={() => removeFaq(index)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center z-10"><i className="fas fa-trash text-[10px]"></i></button>
                    <div className="space-y-3">
                    <input className={inputStyle} placeholder="QUESTION" value={item.question} onChange={(e) => updateFaq(index, 'question', e.target.value)} />
                    <textarea className={`${inputStyle} h-24 normal-case font-medium`} placeholder="ANSWER..." value={item.answer} onChange={(e) => updateFaq(index, 'answer', e.target.value)} />
                    </div>
                </div>
                ))}
            </div>
            <button type="button" onClick={addFaq} className="w-full py-5 border-2 border-dashed border-current/10 rounded-2xl opacity-50 text-[10px] tracking-widest">+ NEW_FAQ</button>
            </div>
        )}
      </div>

      <div className="flex justify-between mt-12 pt-8 border-t border-white/5 font-black italic uppercase">
        <button type="button" onClick={() => setStep(prev => Math.max(1, prev - 1))} className={`text-[10px] opacity-40 transition-colors ${step === 1 ? 'invisible' : ''}`}>BACK</button>
        <button onClick={() => step < 6 ? setStep(step + 1) : save()} disabled={loading} className="px-10 md:px-16 py-4 md:py-6 rounded-full bg-white text-black text-[10px] md:text-[12px] hover:bg-[#00f2ff] transition-all shadow-xl font-black active:scale-95">
            {loading ? 'SYNCING...' : step < 6 ? 'NEXT' : 'SAVE_STUDIO'}
        </button>
      </div>
    </div>
  );
}