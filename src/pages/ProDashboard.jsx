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
  const [statusFilter, setStatusFilter] = useState('tous');
  const scrollContainerRef = useRef(null);

  const [viewMode, setViewMode] = useState('workWeek');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const hours = Array.from({ length: 15 }, (_, i) => (i + 7).toString().padStart(2, '0') + ':00');

  const SPECIALITIES_LIST = [
  "Lavage Manuel", "Polissage", "Protection Céramique", 
  "Pose de PPF", "Nettoyage Intérieur", "Rénovation Cuir", 
  "Optiques de Phare", "Ciel étoilé", "Vitres Teintées"
];

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

  const updateStatus = async (appId, newStatus) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', appId);
    if (!error) fetchAppointments();
  };

  // TRI ET FILTRAGE : Plus récent en haut + Filtre par statut
  const processedMissions = appointments
    .filter(app => statusFilter === 'tous' || app.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return dateB - dateA;
    });

  const glass = dark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.03] border-black/10';

  if (loading) return <div className="pt-40 text-center animate-pulse font-black italic uppercase tracking-widest text-[#00f2ff]">Sync_Command_Center...</div>;

  return (
    <div className={`pt-24 md:pt-40 pb-20 px-4 md:px-12 max-w-[1800px] mx-auto font-black italic uppercase transition-all ${dark ? 'text-white' : 'text-black'}`}>
      
      {isConfiguring ? (
        <ProCMS supabase={supabase} profile={profile} session={session} dark={dark} onComplete={() => { setIsConfiguring(false); fetchData(); }} />
      ) : (
        <div className="animate-in fade-in duration-700">
          
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-12 md:mb-16 gap-8 text-center lg:text-left">
            <div className="space-y-4 w-full lg:w-auto">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#bc13fe] flex items-center justify-center shadow-lg shadow-[#bc13fe]/30 shrink-0">
                  <i className="fas fa-terminal text-white"></i>
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none">COMMAND_<span className="text-[#bc13fe]">UNIT</span></h2>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <div className={`flex items-center p-1 rounded-full border ${glass} backdrop-blur-md w-fit`}>
                   <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="w-10 h-10 flex items-center justify-center hover:text-[#00f2ff] transition-all text-xl">←</button>
                   <button onClick={() => setCurrentDate(new Date())} className="px-4 text-[9px] opacity-50 hover:opacity-100 uppercase">Auj.</button>
                   <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="w-10 h-10 flex items-center justify-center hover:text-[#00f2ff] transition-all">→</button>
                </div>
                <span className="text-lg md:text-xl lowercase first-letter:uppercase">{format(currentDate, 'MMMM yyyy', { locale: fr })}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-center lg:items-end w-full lg:w-auto">
                <div className={`p-1 rounded-full border ${glass} flex backdrop-blur-xl w-full sm:w-fit overflow-x-auto no-scrollbar`}>
                    <button onClick={() => setViewMode('day')} className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-full text-[9px] transition-all whitespace-nowrap ${viewMode === 'day' ? 'bg-[#00f2ff] text-black' : 'opacity-40'}`}>Jour</button>
                    <button onClick={() => setViewMode('workWeek')} className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-full text-[9px] transition-all whitespace-nowrap ${viewMode === 'workWeek' ? 'bg-[#00f2ff] text-black' : 'opacity-40'}`}>Semaine_Pro</button>
                    <button onClick={() => setViewMode('fullWeek')} className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-full text-[9px] transition-all whitespace-nowrap ${viewMode === 'fullWeek' ? 'bg-[#00f2ff] text-black' : 'opacity-40'}`}>Semaine_7j</button>
                </div>
                <div className={`p-1 rounded-full border ${glass} flex backdrop-blur-xl w-full sm:w-fit overflow-x-auto no-scrollbar`}>
                    <button onClick={() => setActiveTab('missions')} className={`flex-1 sm:flex-none px-4 md:px-8 py-3 rounded-full text-[9px] transition-all whitespace-nowrap ${activeTab === 'missions' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>Missions</button>
                    <button onClick={() => setActiveTab('agenda')} className={`flex-1 sm:flex-none px-4 md:px-8 py-3 rounded-full text-[9px] transition-all whitespace-nowrap ${activeTab === 'agenda' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>Master_Agenda</button>
                    <button onClick={() => setIsConfiguring(true)} className="flex-1 sm:flex-none px-4 md:px-8 py-3 rounded-full text-[9px] border border-white/10 hover:bg-white hover:text-black transition-all">Settings</button>
                </div>
            </div>
          </div>

          {/* TAB: AGENDA */}
          {activeTab === 'agenda' && (
            <div ref={scrollContainerRef} className={`rounded-[30px] md:rounded-[60px] border ${glass} overflow-hidden flex flex-col h-[600px] md:h-[750px] shadow-2xl backdrop-blur-3xl animate-in slide-in-from-right-8`}>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="min-w-[800px] lg:min-w-full">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr className="sticky top-0 z-30">
                        <th className={`p-4 border-b ${glass} text-left w-24 sticky left-0 z-50 ${dark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}><span className="text-[9px] opacity-40">TIME</span></th>
                        {displayedDays.map(day => (
                          <th key={day.toString()} className={`p-4 border-b ${glass} min-w-[150px] text-center ${isSameDay(day, new Date()) ? 'bg-[#00f2ff]/10' : ''}`}>
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
                                  <div className="absolute inset-1 bg-white text-black p-3 rounded-[15px] md:rounded-[20px] shadow-xl flex flex-col justify-between hover:bg-[#00f2ff] transition-all cursor-pointer overflow-hidden z-10">
                                      <div className="text-left"><p className="text-[9px] md:text-[10px] font-black leading-tight truncate">{rdv.client_name}</p><p className="text-[7px] opacity-60 uppercase font-bold truncate">{rdv.service_type}</p></div>
                                      <span className="text-[7px] md:text-[8px] font-black opacity-40 self-end">@{rdv.appointment_time}</span>
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
            </div>
          )}

          {/* TAB: MISSIONS */}
          {activeTab === 'missions' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-[30px] border border-white/5 bg-white/5 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                      <i className="fas fa-filter text-[#bc13fe] opacity-50"></i>
                      <span className="text-[10px] font-black tracking-widest uppercase">Tri_Par_Statut</span>
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                      {['tous', 'en attente', 'confirmé', 'terminé', 'annulé'].map((status) => (
                          <button
                              key={status}
                              onClick={() => setStatusFilter(status)}
                              className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all border ${
                                  statusFilter === status 
                                  ? 'bg-[#bc13fe] text-white border-[#bc13fe] shadow-lg shadow-[#bc13fe]/20' 
                                  : 'border-white/10 opacity-40 hover:opacity-100'
                              }`}
                          >
                              {status === 'tous' ? 'TOUTES' : status.replace('_', ' ')}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {processedMissions.length > 0 ? (
                  processedMissions.map((app) => (
                    <MissionCard 
                        key={app.id} 
                        app={app} 
                        dark={dark} 
                        glass={glass} 
                        updateStatus={updateStatus} 
                        setActiveChat={setActiveChat}
                    />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20">
                      <i className="fas fa-inbox text-4xl mb-4 block"></i>
                      <p className="text-[10px] tracking-[0.5em]">SIGNAL_VIDE: AUCUNE_MISSION</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeChat && <ChatBox receiverId={activeChat.id} receiverName={activeChat.name} senderId={session.user.id} onClose={() => setActiveChat(null)} dark={dark} />}
    </div>
  );
}

function MissionCard({ app, dark, glass, updateStatus, setActiveChat }) {
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
                alert("PAIEMENT LIBÉRÉ !");
                await updateStatus(app.id, 'terminé'); 
            } catch (err) {
                alert("Erreur : " + err.message);
            } finally {
                setIsVerifying(false);
            }
        } else {
            alert("CODE INVALIDE.");
        }
    };

    const getStatusStyles = () => {
        switch (app.status) {
            case 'confirmé': return 'border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
            case 'annulé': return 'border-red-500 text-red-500 bg-red-500/5';
            case 'refusé': return 'border-red-500 text-red-500 opacity-50';
            case 'terminé': return 'border-[#00f2ff] text-[#00f2ff]';
            default: return 'border-[#bc13fe] text-[#bc13fe] animate-pulse';
        }
    };

    return (
        <div className={`p-6 md:p-10 rounded-[35px] md:rounded-[50px] border ${glass} flex flex-col gap-6 md:gap-8 group transition-all duration-500 text-left 
            ${app.status === 'annulé' ? 'border-red-500/40 bg-red-500/5' : 'hover:border-[#00f2ff]/50'}`}>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex shrink-0 items-center justify-center text-black font-black text-xl shadow-lg 
                ${app.status === 'annulé' ? 'bg-red-500' : 'bg-gradient-to-br from-[#bc13fe] to-[#00f2ff]'}`}>
                {app.status === 'annulé' ? <i className="fas fa-ban text-white"></i> : (app.client_name ? app.client_name[0] : 'U')}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 md:gap-3">
                    <p className="text-lg md:text-xl font-black tracking-tighter truncate leading-none uppercase">{app.client_name?.split('@')[0]}</p>
                    <span className={`w-fit px-3 py-1 rounded-full text-[7px] border font-black ${getStatusStyles()}`}>
                        {app.status ? app.status.toUpperCase() : 'INCONNU'}
                    </span>
                </div>
                <p className="text-[9px] text-[#00f2ff] tracking-[0.2em] font-bold uppercase mt-1 truncate">{app.service_type || 'CUSTOM_PROTOCOL'}</p>
              </div>
            </div>

            <div className="flex justify-between md:flex-col items-center md:items-end w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <p className="text-sm md:text-lg font-black tracking-tighter">{app.appointment_date}</p>
                <p className="text-[10px] opacity-40 italic uppercase">H_START: {app.appointment_time}</p>
              </div>
              <button 
                onClick={() => setActiveChat({ id: app.client_id, name: app.client_name })} 
                className="md:mt-4 w-12 h-12 md:w-14 md:h-14 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg"
              >
                <i className="fas fa-comment-dots"></i>
              </button>
            </div>
          </div>

          {app.status === 'en attente' && (
            <div className="flex gap-3 w-full animate-in slide-in-from-bottom-2">
              <button onClick={() => updateStatus(app.id, 'confirmé')} className="flex-1 bg-[#00f2ff] text-black py-4 rounded-2xl font-black text-[10px] tracking-widest hover:scale-[1.02] transition-all">ACCEPTER</button>
              <button onClick={() => updateStatus(app.id, 'refusé')} className="px-6 border border-red-500 text-red-500 py-4 rounded-2xl font-black text-[10px] hover:bg-red-500 hover:text-white transition-all">REFUSER</button>
            </div>
          )}

          {app.status === 'confirmé' && (
            <div className={`mt-4 p-5 md:p-8 rounded-[30px] border-2 border-dashed ${dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} flex flex-col items-center gap-6 animate-in zoom-in-95`}>
              <div className="text-center md:text-left w-full">
                <h5 className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-[#00f2ff] mb-2 uppercase italic">Validation_Mission</h5>
                <p className="text-[8px] md:text-[9px] opacity-40 normal-case italic leading-tight">Code client requis pour débloquer les fonds.</p>
              </div>
              <div className="flex flex-row gap-2 w-full max-w-full">
                <input 
                  type="text" maxLength="6" placeholder="------"
                  value={vCode} onChange={(e) => setVCode(e.target.value.toUpperCase())}
                  className="w-full flex-1 bg-black border border-white/10 p-4 rounded-2xl text-center font-mono text-xl md:text-2xl tracking-[0.2em] text-[#00f2ff] outline-none min-w-0"
                />
                <button 
                  onClick={handleVerify}
                  disabled={vCode.length !== 6 || isVerifying}
                  className={`px-4 md:px-8 py-4 rounded-2xl font-black italic text-[10px] transition-all shrink-0 ${vCode.length === 6 ? 'bg-[#00f2ff] text-black shadow-lg shadow-[#00f2ff]/20' : 'bg-white/5 opacity-20'}`}
                >{isVerifying ? '...' : 'OK'}</button>
              </div>
            </div>
          )}
          
          {app.status === 'annulé' && app.cancellation_reason && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-[9px] font-black text-red-500 mb-1 uppercase">ALERTE_ANNULATION</p>
                <p className="text-[11px] opacity-80 normal-case italic font-medium">{app.cancellation_reason}</p>
            </div>
          )}
        </div>
    );
}

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