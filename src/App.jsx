import AOS from 'aos';
import 'aos/dist/aos.css';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// --- FONCTION UTILITAIRE : UPLOAD STORAGE ---
const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;
  const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
  return data.publicUrl;
};

// --- 1. COMPOSANT : MINI-SITE DU PRO (VUE CLIENT) ---
function ProPublicProfile({ pro, session, onBookingClick, onClose }) {
  if (!pro) return null;
  const cover = pro.cover_url || "https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=2070";
  const showcases = pro.showcase_before_after || [];
  const catalog = pro.catalog_images || [];
  const stats = pro.stats_data || { xp: '5', cars: '250', shield: '9H' };
  const services = pro.services_list || [];

  return (
    <div className="fixed inset-0 z-[1001] bg-[#050505] overflow-y-auto font-['Outfit'] text-white animate-in slide-in-from-bottom-10 duration-700 text-left font-black italic uppercase">
      
      {/* HEADER FIXE */}
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-[110] backdrop-blur-xl bg-black/60 border-b border-white/5 shadow-2xl">
        <button onClick={onClose} className="group flex items-center gap-3 text-[9px] tracking-[0.3em] hover:text-[#bc13fe] transition-all italic text-white"><i className="fas fa-arrow-left"></i> Retour</button>
        <div className="logo-font text-[11px] tracking-[0.4em] opacity-80">{pro.nom_commercial}</div>
        <button onClick={onBookingClick} className="bg-white text-black px-6 py-2 rounded-full text-[8px] hover:bg-[#bc13fe] hover:text-white transition-all">Reserver_Soin</button>
      </nav>

      {/* HERO SECTION RÉDUITE (Panoramique) */}
      <section className="relative h-[45vh] md:h-[50vh] flex items-end pb-12 px-6 md:px-20 overflow-hidden">
        <img src={cover} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        <div className="relative z-10 w-full" data-aos="fade-up">
          <span className="text-[#00f2ff] text-[8px] font-black uppercase tracking-[0.6em] mb-4 block italic underline decoration-[#00f2ff] decoration-2 underline-offset-8">Unit_Core: Active</span>
          <h1 className="text-5xl md:text-[7vw] font-black italic uppercase tracking-tighter leading-none mb-4 logo-font">{pro.nom_commercial}</h1>
          <p className="text-slate-400 text-[9px] uppercase tracking-[0.4em] font-black italic"><i className="fas fa-location-dot text-[#bc13fe] mr-2"></i>{pro.adresse}</p>
        </div>
      </section>

      {/* SECTION : STATS IMPACT */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-y border-white/5 bg-white/[0.02] backdrop-blur-md">
        <div className="p-8 border-r border-white/5 text-center">
            <p className="text-3xl text-[#bc13fe] mb-1">{stats.xp}+</p>
            <p className="text-[7px] opacity-40 tracking-widest uppercase">Expérience</p>
        </div>
        <div className="p-8 border-r border-white/5 text-center">
            <p className="text-3xl text-[#00f2ff] mb-1">{stats.cars}+</p>
            <p className="text-[7px] opacity-40 tracking-widest uppercase">Missions</p>
        </div>
        <div className="p-8 border-r border-white/5 text-center">
            <p className="text-3xl text-white mb-1">{stats.shield}</p>
            <p className="text-[7px] opacity-40 tracking-widest uppercase">Certification</p>
        </div>
        <div className="p-8 text-center">
            <p className="text-3xl text-[#bc13fe] mb-1">100%</p>
            <p className="text-[7px] opacity-40 tracking-widest uppercase">Qualité</p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 md:px-20 py-20 grid grid-cols-12 gap-16 uppercase">
        <div className="col-span-12 lg:col-span-8 space-y-32">
          
          <section>
            <h4 className="text-[9px] tracking-[0.6em] text-[#bc13fe] mb-8 border-l-2 border-[#bc13fe] pl-6 italic">01. Studio_Manifesto</h4>
            <p className="text-2xl md:text-4xl font-light italic leading-tight text-white mb-8 normal-case font-black">{pro.about_text || "Maîtrise absolue du detailing."}</p>
            <p className="text-xs text-slate-500 leading-loose tracking-widest normal-case">{pro.bio}</p>
          </section>

          {/* SECTION : CATALOGUE SERVICES AVEC DESCRIPTION */}
          <section>
            <h4 className="text-[9px] tracking-[0.6em] text-[#00f2ff] mb-12 border-l-2 border-[#00f2ff] pl-6 italic">02. Engineering_Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((s, i) => (
                <div key={i} className="p-10 bg-white/5 border border-white/5 rounded-[40px] hover:border-[#00f2ff]/30 transition-all group">
                  <h5 className="text-sm text-[#00f2ff] mb-4 font-black italic">{s.titre}</h5>
                  <p className="text-[10px] text-slate-400 normal-case leading-loose font-black italic">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CATALOGUE PHOTOS (5 MAX) */}
          {catalog.length > 0 && (
            <section>
              <h4 className="text-[9px] tracking-[0.6em] text-white mb-8 border-l-2 border-white pl-6 italic">03. Visual_Catalog</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {catalog.map((img, i) => (
                  <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-white/10 group bg-white/5">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Work" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AVANT / APRÈS (Désactivable) */}
          {pro.show_before_after && showcases.length > 0 && (
            <section>
                <h4 className="text-[9px] tracking-[0.6em] text-[#bc13fe] mb-8 border-l-2 border-[#bc13fe] pl-6 italic">04. Transformation_Log</h4>
                <div className="space-y-16">
                    {showcases.map((sh, i) => (
                        <div key={i} className="space-y-4">
                            <p className="text-lg text-[#00f2ff] font-black italic">{sh.title}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl"><img src={sh.before} className="w-full h-full object-cover grayscale opacity-50" /><div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-[7px] font-black">BEFORE</div></div>
                                <div className="relative aspect-video rounded-3xl overflow-hidden border border-[#00f2ff]/30 shadow-2xl"><img src={sh.after} className="w-full h-full object-cover" /><div className="absolute bottom-4 left-4 bg-[#00f2ff] text-black px-3 py-1 rounded text-[7px] font-black">AFTER</div></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          )}
        </div>

        {/* COLONNE RÉSERVATION */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-32 bg-white text-black p-10 rounded-[50px] shadow-2xl font-black italic">
            <h5 className="text-[9px] tracking-[0.4em] mb-8 border-b border-black/5 pb-4 uppercase">Protocol_Pricing</h5>
            <div className="space-y-5 mb-10">
              {pro.custom_tarifs?.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] border-b border-black/5 pb-2 uppercase">
                  <span className="opacity-40 italic">{t.service}</span>
                  <span className="text-xl tracking-tighter">{t.price}€</span>
                </div>
              ))}
            </div>
            <button onClick={onBookingClick} className="w-full bg-black text-white py-6 rounded-3xl text-[9px] tracking-[0.4em] hover:bg-[#bc13fe] transition-all shadow-xl font-black uppercase">Initier Mission</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- 2. COMPOSANT : FORMULAIRE PRO (CMS COMPLET) ---
function ProForm({ session, profile, onComplete }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      nom_responsable: profile?.nom_responsable || '',
      nom_commercial: profile?.nom_commercial || '',
      adresse: profile?.adresse || '',
      bio: profile?.bio || '',
      about_text: profile?.about_text || '',
      cover_url: profile?.cover_url || '',
      show_before_after: profile?.show_before_after || false,
      catalog_images: profile?.catalog_images || [],
      services_list: profile?.services_list || [{ titre: '', desc: '' }],
      custom_tarifs: profile?.custom_tarifs || [{ service: '', price: '' }],
      showcase_before_after: profile?.showcase_before_after || [{ before: '', after: '', title: '' }],
      stats_data: profile?.stats_data || { xp: '5', cars: '250', shield: '9H' }
    });

    const handleFileUpload = async (e, targetField, index = null, subField = null) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            const url = await uploadImage(file);
            if (index !== null) {
                const newList = [...formData[targetField]];
                newList[index][subField] = url;
                setFormData({ ...formData, [targetField]: newList });
            } else if (targetField === 'catalog_images') {
                if (formData.catalog_images.length >= 5) return alert("Max 5 photos");
                setFormData({ ...formData, catalog_images: [...formData.catalog_images, url] });
            } else {
                setFormData({ ...formData, [targetField]: url });
            }
        } catch (err) { alert(err.message); }
        setLoading(false);
    };

    const addService = () => setFormData({...formData, services_list: [...formData.services_list, { titre: '', desc: '' }]});
    const addTarif = () => setFormData({...formData, custom_tarifs: [...formData.custom_tarifs, { service: '', price: '' }]});
    const addShowcase = () => { if(formData.showcase_before_after.length < 3) setFormData({...formData, showcase_before_after: [...formData.showcase_before_after, { before: '', after: '', title: '' }]}); };

    const handleSubmit = async () => {
      setLoading(true);
      const { error } = await supabase.from('profiles_pro').upsert({ id: session.user.id, ...formData, updated_at: new Date() });
      setLoading(false); onComplete();
    };

    const inputStyle = "w-full bg-black border border-white/10 p-5 text-[10px] tracking-widest outline-none focus:border-[#bc13fe] rounded-2xl text-white font-black uppercase italic mb-4";
    const fileBtnStyle = "w-full bg-white/5 border border-dashed border-white/20 p-8 rounded-2xl text-[8px] hover:bg-white/10 transition-all cursor-pointer text-center mb-6 block uppercase font-black italic";

    return (
      <div className="max-w-4xl mx-auto py-32 px-6 text-left font-black italic uppercase">
        <div className="bg-white/5 border border-white/10 rounded-[60px] p-12 md:p-20 backdrop-blur-3xl shadow-2xl relative">
          
          <div className="mb-12 flex justify-between text-[7px] opacity-40">
             {["Identité", "Images", "Services", "Chiffres"].map((n, i) => (
                <span key={i} className={step === i+1 ? "text-[#bc13fe] underline underline-offset-4" : ""}>{n}</span>
             ))}
          </div>

          {step === 1 && (<div className="space-y-4">
               <h2 className="text-3xl text-white italic tracking-tighter mb-10 underline underline-offset-8">Core_Identity</h2>
               <input className={inputStyle} value={formData.nom_responsable} placeholder="NOM DU RESPONSABLE" type="text" onChange={e => setFormData({...formData, nom_responsable: e.target.value})} />
               <input className={inputStyle} value={formData.nom_commercial} placeholder="NOM DU STUDIO" type="text" onChange={e => setFormData({...formData, nom_commercial: e.target.value})} />
               <input className={inputStyle} value={formData.adresse} placeholder="ADRESSE_VILLE" type="text" onChange={e => setFormData({...formData, adresse: e.target.value})} />
            </div>)}

          {step === 2 && (<div className="space-y-6">
               <h2 className="text-3xl text-white italic tracking-tighter mb-10 underline">Studio_Assets</h2>
               <label className={fileBtnStyle}>{formData.cover_url ? "COUVERTURE CHARGÉE" : "UPLOAD PHOTO COUVERTURE"}<input type="file" className="hidden" onChange={e => handleFileUpload(e, 'cover_url')} /></label>
               
               <h4 className="text-[8px] text-[#bc13fe] mb-4">CATALOGUE (MAX 5)</h4>
               <div className="grid grid-cols-5 gap-2 mb-6">
                   {formData.catalog_images.map((img, i) => (
                       <div key={i} className="aspect-square bg-white/10 rounded-xl overflow-hidden relative group"><img src={img} className="w-full h-full object-cover" /><button onClick={() => setFormData({...formData, catalog_images: formData.catalog_images.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px]">X</button></div>
                   ))}
                   {formData.catalog_images.length < 5 && (<label className="aspect-square bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/10 text-xl font-black">+<input type="file" className="hidden" onChange={e => handleFileUpload(e, 'catalog_images')} /></label>)}
               </div>

               <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl"><label className="text-[8px]">Afficher section Avant/Après ?</label><input type="checkbox" className="accent-[#bc13fe]" checked={formData.show_before_after} onChange={e => setFormData({...formData, show_before_after: e.target.checked})} /></div>
               {formData.show_before_after && formData.showcase_before_after.map((sh, i) => (
                   <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 mb-4 space-y-4">
                       <input className={inputStyle} placeholder="NOM DU PROJET" value={sh.title} onChange={e => {const n=[...formData.showcase_before_after]; n[i].title=e.target.value; setFormData({...formData, showcase_before_after: n})}} />
                       <div className="grid grid-cols-2 gap-4"><label className={fileBtnStyle}>Avant<input type="file" className="hidden" onChange={e => handleFileUpload(e, 'showcase_before_after', i, 'before')} /></label><label className={fileBtnStyle}>Après<input type="file" className="hidden" onChange={e => handleFileUpload(e, 'showcase_before_after', i, 'after')} /></label></div>
                   </div>
               ))}
            </div>)}

          {step === 3 && (<div className="space-y-6">
               <h2 className="text-3xl text-white italic tracking-tighter mb-10 underline">Services_Config</h2>
               <textarea className={`${inputStyle} h-24`} value={formData.about_text} placeholder="Slogan du Studio" onChange={e => setFormData({...formData, about_text: e.target.value})} />
               <textarea className={`${inputStyle} h-40`} value={formData.bio} placeholder="Histoire de l'atelier" onChange={e => setFormData({...formData, bio: e.target.value})} />
               
               <div className="space-y-4 pt-6 border-t border-white/5">
                 <h4 className="text-[9px] text-[#00f2ff]">Listing_Services</h4>
                 {formData.services_list.map((s, i) => (
                   <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 relative">
                      <input className={inputStyle} placeholder="TITRE DU SERVICE" value={s.titre} onChange={e => {const n=[...formData.services_list]; n[i].titre=e.target.value; setFormData({...formData, services_list: n})}} />
                      <textarea className={`${inputStyle} h-20 mb-0`} placeholder="DESCRIPTION" value={s.desc} onChange={e => {const n=[...formData.services_list]; n[i].desc=e.target.value; setFormData({...formData, services_list: n})}} />
                   </div>
                 ))}
                 <button onClick={addService} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[8px] opacity-40">+ SERVICE</button>
               </div>
            </div>)}
          
          {step === 4 && (<div className="space-y-6">
               <h2 className="text-3xl text-white italic tracking-tighter mb-10 underline">Stats_&_Prices</h2>
               <div className="grid grid-cols-3 gap-4 mb-10">
                   <div><label className="text-[7px] opacity-40">Expérience (ans)</label><input className={inputStyle} value={formData.stats_data.xp} type="number" onChange={e => setFormData({...formData, stats_data: {...formData.stats_data, xp: e.target.value}})} /></div>
                   <div><label className="text-[7px] opacity-40">Missions faites</label><input className={inputStyle} value={formData.stats_data.cars} type="number" onChange={e => setFormData({...formData, stats_data: {...formData.stats_data, cars: e.target.value}})} /></div>
                   <div><label className="text-[7px] opacity-40">Grade Protect</label><input className={inputStyle} value={formData.stats_data.shield} placeholder="EX: 9H" type="text" onChange={e => setFormData({...formData, stats_data: {...formData.stats_data, shield: e.target.value}})} /></div>
               </div>
               {formData.custom_tarifs.map((t, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4">
                       <input className={`${inputStyle} col-span-2`} placeholder="SERVICE" value={t.service} onChange={e => {const n=[...formData.custom_tarifs]; n[i].service=e.target.value; setFormData({...formData, custom_tarifs: n})}} />
                       <input className={inputStyle} placeholder="€" type="number" value={t.price} onChange={e => {const n=[...formData.custom_tarifs]; n[i].price=e.target.value; setFormData({...formData, custom_tarifs: n})}} />
                    </div>
                  ))}
                  <button onClick={addTarif} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[8px] opacity-40">+ TARIFAIRE</button>
            </div>)}

          <div className="flex justify-between mt-16 pt-10 border-t border-white/5 font-black uppercase italic">
            {step > 1 && <button onClick={() => setStep(s => s - 1)} className="text-[12px] opacity-40 text-white">RETOUR</button>}
            <button onClick={() => step < 4 ? setStep(s => s + 1) : handleSubmit()} disabled={loading} className="ml-auto bg-white text-black px-16 py-6 rounded-full text-[10px] tracking-[0.4em] hover:bg-[#bc13fe] hover:text-white transition-all">
                {loading ? 'SYNCING...' : step < 4 ? 'NEXT_PHASE' : 'DEPLOY_V3'}
            </button>
          </div>
        </div>
      </div>
    );
}

// --- 3. DASHBOARD PRO ---
function ProDashboard({ profile, onEdit, onRefresh }) {
    const [appointments, setAppointments] = useState([]);
    const [localVisible, setLocalVisible] = useState(profile?.is_visible || false);
    const fetchAppointments = useCallback(async () => {
      if (!profile?.id) return;
      const { data } = await supabase.from('appointments').select('*').eq('pro_id', profile.id).order('created_at', { ascending: false });
      if (data) setAppointments(data);
    }, [profile]);
    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
    const updateStatus = async (appId, newStatus) => {
      await supabase.from('appointments').update({ status: newStatus }).eq('id', appId);
      fetchAppointments();
    };
    const toggleVisibility = async () => {
      const nextValue = !localVisible;
      setLocalVisible(nextValue);
      await supabase.from('profiles_pro').update({ is_visible: nextValue }).eq('id', profile.id);
      onRefresh();
    };
    if (!profile) return null;
    return (
      <div className="max-w-[1600px] mx-auto px-6 md:px-20 py-10 space-y-12 text-white font-black uppercase text-left font-black italic" data-aos="fade-up">
        <div className="bg-white/5 border border-white/10 p-12 rounded-[60px] flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-3 h-full ${localVisible ? 'bg-[#00f2ff]' : 'bg-red-500/40'}`}></div>
          <div className="text-left"><h1 className="text-6xl tracking-tighter logo-font mb-4 text-white italic leading-none">{profile.nom_commercial}</h1><button onClick={toggleVisibility} className={`px-8 py-2 rounded-full border text-[10px] tracking-widest transition-all ${localVisible ? 'border-[#00f2ff] text-[#00f2ff]' : 'border-white/10 text-white/20'}`}>{localVisible ? '● UNITÉ ACTIVE' : '○ MODE PRIVÉ'}</button></div>
          <button onClick={onEdit} className="bg-white text-black px-12 py-5 rounded-full text-[12px] tracking-widest hover:bg-[#bc13fe] hover:text-white transition-all shadow-xl font-black italic uppercase">Strings_Edit</button>
        </div>
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-8 bg-white/5 border border-white/10 p-12 rounded-[60px] space-y-10 shadow-2xl backdrop-blur-sm">
            <h4 className="text-[12px] text-[#bc13fe] tracking-[0.5em] italic underline font-black">Missions_Queue</h4>
            <div className="space-y-6">
              {appointments.length > 0 ? appointments.map(app => (
                <div key={app.id} className="p-8 bg-black/40 rounded-[40px] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 transition-all hover:border-[#00f2ff]/40">
                  <div className="text-center md:text-left font-black italic font-black uppercase"><p className="text-[11px] text-[#00f2ff] italic uppercase">{app.appointment_date} @ {app.appointment_time}</p><p className="text-2xl text-white mt-1 uppercase leading-none font-black">{app.client_name?.split('@')[0]}</p><span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase mt-4 inline-block ${app.status === 'confirmé' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}>{app.status}</span></div>
                  <div className="flex gap-4">
                     {app.status === 'en attente' && <button onClick={() => updateStatus(app.id, 'confirmé')} className="bg-white text-black text-[10px] px-8 py-3 rounded-2xl font-black uppercase italic">Valider</button>}
                     {app.status === 'confirmé' && <button onClick={() => updateStatus(app.id, 'terminé')} className="bg-[#00f2ff] text-black text-[10px] px-8 py-3 rounded-2xl font-black uppercase italic shadow-lg">Terminer</button>}
                  </div>
                </div>
              )) : <div className="py-20 text-center opacity-20 italic text-2xl tracking-[0.5em] text-white">Radar_Empty</div>}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white/5 border border-white/10 p-12 rounded-[60px] shadow-2xl text-left font-black italic"><h4 className="text-[12px] text-[#00f2ff] tracking-[0.5em] mb-10 italic border-b border-white/5 pb-4">Business_Data</h4><div className="space-y-8">{profile.custom_tarifs?.map((t, i) => (<div key={i} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-4 text-white uppercase"><span className="opacity-40 italic">{t.service}</span> <span className="text-3xl text-white italic">{t.price}€</span></div>))}</div></div>
          </div>
        </div>
      </div>
    );
}

// --- 4. COMPOSANT : DASHBOARD CLIENT ---
function ClientDashboard({ session }) {
    const [myBookings, setMyBookings] = useState([]);
    const fetchMyBookings = useCallback(async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase.from('appointments').select(`*, profiles_pro (nom_commercial, adresse)`).eq('client_id', session.user.id).order('created_at', { ascending: false });
      if (data) setMyBookings(data);
    }, [session]);
    useEffect(() => {
      fetchMyBookings();
      const channel = supabase.channel('c-up').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `client_id=eq.${session.user.id}` }, () => fetchMyBookings()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }, [fetchMyBookings, session]);
    
    const getStepStatus = (currentStatus, step) => {
      const order = ['en attente', 'confirmé', 'terminé'];
      const currentIndex = order.indexOf(currentStatus);
      const stepIndex = order.indexOf(step);
      if (currentStatus === 'annulé') return 'bg-red-500/20 text-red-500 border-red-500/20';
      if (currentIndex >= stepIndex) return 'bg-[#00f2ff] text-black border-[#00f2ff] shadow-[0_0_10px_#00f2ff]';
      return 'bg-white/5 text-white/20 border-white/10';
    };
  
    return (
      <div className="max-w-4xl mx-auto px-6 py-10" data-aos="fade-up">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 logo-font text-left text-white underline decoration-[#bc13fe] underline-offset-8 font-black">Mes <span className="text-[#bc13fe]">Protocoles</span></h2>
        <div className="space-y-6 font-black uppercase text-left italic">
          {myBookings.length > 0 ? myBookings.map(app => (
            <div key={app.id} className="bg-white/5 border border-white/10 p-10 rounded-[50px] backdrop-blur-md relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-start mb-10 text-white">
                <div><span className="text-[8px] text-[#bc13fe] tracking-[0.4em] italic font-black">MISSION_ID: {app.id.slice(0,6)}</span><h4 className="text-3xl italic mt-1 font-black leading-none uppercase">{app.profiles_pro?.nom_commercial}</h4></div>
                <div className="text-right font-black"><p className="text-2xl text-[#00f2ff]">{app.total_price}€</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 relative">{['en attente', 'confirmé', 'terminé'].map((step) => (<div key={step} className={`h-1.5 rounded-full border transition-all duration-700 ${getStepStatus(app.status, step)}`}></div>))}</div>
              <div className="flex justify-between mt-4 text-[7px] text-white/40 italic font-black uppercase"><span>Demande</span><span>Validé</span><span>Terminé</span></div>
            </div>
          )) : <div className="py-20 text-center border border-dashed border-white/10 rounded-[50px] opacity-20 text-[10px] font-black uppercase tracking-widest text-white italic font-black uppercase">Radar_Scan_Empty</div>}
        </div>
      </div>
    );
}

// --- 5. APP PRINCIPALE ---
export default function App() {
  const [session, setSession] = useState(null);
  const [proProfile, setProProfile] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [view, setView] = useState('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [publicDetailers, setPublicDetailers] = useState([]);
  const [selectedProForProfile, setSelectedProForProfile] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchVille, setSearchVille] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const fetchProProfile = useCallback(async (userId) => {
    if (!userId) return;
    setLoadingData(true);
    const { data } = await supabase.from('profiles_pro').select('*').eq('id', userId).maybeSingle();
    if (data) { setProProfile(data); setIsConfiguring(false); setView('dashboard'); } else setIsConfiguring(true);
    setLoadingData(false);
  }, []);

  const fetchPublicDetailers = useCallback(async () => {
    const { data } = await supabase.from('profiles_pro').select('*').eq('is_visible', true);
    if (data) setPublicDetailers(data);
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); if (session?.user?.user_metadata?.role === 'pro') fetchProProfile(session.user.id); else { setView('landing'); setLoadingData(false); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { 
        setSession(s); if (s?.user?.user_metadata?.role === 'pro') fetchProProfile(s.user.id); else { setProProfile(null); setView('landing'); setLoadingData(false); }
    });
    fetchPublicDetailers();
    return () => subscription.unsubscribe();
  }, [fetchProProfile, fetchPublicDetailers]);

  const handleSearch = () => {
    if (!searchVille.trim()) { setSearchResults(null); return; }
    const results = publicDetailers.filter(pro => pro.adresse?.toLowerCase().includes(searchVille.toLowerCase()));
    setSearchResults(results);
    document.getElementById('reseau-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuth = async (role = 'client') => {
    const { error } = authMode === 'signup' ? await supabase.auth.signUp({ email, password, options: { data: { role } } }) : await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); else setShowAuth(false);
  };

  const isPro = session?.user?.user_metadata?.role === 'pro';

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#bc13fe] overflow-x-hidden font-['Outfit'] font-black italic uppercase">
      
      {session && (
        <div className="w-full bg-[#bc13fe] text-white py-2.5 px-10 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] z-[200] relative shadow-lg italic">
          <div className="flex items-center gap-4"><span>SYNC_ACTIVE : {session.user.email}</span></div>
          <button onClick={() => supabase.auth.signOut()} className="font-black italic uppercase border-l border-white/20 pl-4 tracking-widest hover:bg-white hover:text-black transition-all">Logout_Core [X]</button>
        </div>
      )}

      <nav className="p-10 flex justify-between items-center relative z-[100] font-black italic">
        <div className="logo-font text-[16px] font-bold tracking-[0.8em] text-white uppercase group cursor-pointer" onClick={() => setView('landing')}>DetailPlan</div>
        <div className="hidden md:flex gap-16 text-[9px] font-black uppercase tracking-[0.4em]">
            <button onClick={() => setView('landing')} className={`hover:text-[#00f2ff] transition-all italic ${view === 'landing' ? 'text-[#00f2ff] underline decoration-4 underline-offset-8 decoration-[#00f2ff]' : 'text-white'}`}>Explorer</button>
            {session && isPro && !isConfiguring && (<button onClick={() => setView('dashboard')} className={`hover:text-[#bc13fe] transition-all italic ${view === 'dashboard' ? 'text-[#bc13fe] underline decoration-4 underline-offset-8 decoration-[#bc13fe]' : 'text-white'}`}>Mon Atelier</button>)}
            {!session && <button onClick={() => {setAuthMode('signup'); setShowAuth(true)}} className="text-white/40 hover:text-[#00f2ff] transition-colors uppercase font-black tracking-widest">Partenaire</button>}
        </div>
        <div className="flex items-center gap-4">
            {!session && <button onClick={() => {setAuthMode('login'); setShowAuth(true)}} className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white font-black italic mr-4">Accès_ID</button>}
            <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center font-black text-[8px] text-white bg-white/5 hover:border-[#bc13fe] transition-all">CORE</div>
        </div>
      </nav>

      {session && isPro && view === 'dashboard' ? (
        <div className="pt-10">
            {loadingData ? (
                <div className="py-40 text-center flex flex-col items-center justify-center gap-10"><div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden relative"><div className="absolute h-full bg-[#bc13fe] w-1/2 animate-ping"></div></div></div>
            ) : isConfiguring ? (<ProForm session={session} profile={proProfile} onComplete={() => fetchProProfile(session.user.id)} />) : proProfile ? (<ProDashboard profile={proProfile} onEdit={() => setIsConfiguring(true)} onRefresh={() => fetchProProfile(session.user.id)} />) : null}
        </div>
      ) : (
        <>
            {session && !isPro && <ClientDashboard session={session} />}
            <main className="max-w-[1600px] mx-auto px-6 md:px-12 relative h-[80vh] flex flex-col justify-center text-left font-black italic font-black uppercase italic" data-aos="fade-up">
                <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none text-[30vw] font-black italic tracking-tighter uppercase leading-none text-white">GLOSS</div>
                <h1 className="text-[clamp(3rem,12vw,10rem)] leading-[0.85] font-black tracking-tighter uppercase relative z-10 text-white italic font-black leading-none font-black italic leading-[0.8]"><span className="text-white">BEYOND</span> <br /> <span className="ml-[5vw] text-transparent font-black italic" style={{ WebkitTextStroke: '2px #bc13fe' }}>THE SHINE.</span></h1>
                <div className="mt-12 flex flex-col md:flex-row gap-12 items-start md:items-center relative z-10 font-black italic font-black"><div className="h-16 w-[1px] bg-[#bc13fe] hidden md:block"></div><p className="max-w-md text-slate-500 font-light tracking-[0.2em] text-[9px] uppercase leading-relaxed text-white font-black italic">Infrastructure digitale de haute précision dédiée à l'esthétique automobile.</p></div>
            </main>

            <div className="bg-[#f8f8f8] text-black py-40 relative mt-20 font-black italic uppercase"><div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-12 gap-10 relative z-10 text-left"><div className="col-span-12 md:col-span-5 bg-white rounded-[60px] p-14 h-[600px] flex flex-col shadow-2xl relative overflow-hidden text-left font-black italic" data-aos="fade-right"><span className="text-[#bc13fe] text-[8px] font-black tracking-[0.6em] uppercase italic mb-6 underline decoration-[#bc13fe] decoration-2">Diagnostic Réseau</span><h3 className="text-6xl font-black mt-2 uppercase italic leading-none tracking-tighter leading-[0.9]">Scanner <br /> <span className="text-transparent" style={{ WebkitTextStroke: '1px black' }}>L'ATELIER.</span></h3><div className="mt-20 space-y-4 font-black uppercase italic"><input type="text" placeholder="VILLE_ID" value={searchVille} onChange={(e) => setSearchVille(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 outline-none font-bold text-[10px] tracking-widest focus:border-[#00f2ff]" /><button onClick={handleSearch} className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-[#bc13fe] transition-all font-black italic">Scanner_Zone</button></div></div><div className="col-span-12 md:col-span-7 rounded-[60px] overflow-hidden group h-[600px] shadow-2xl relative" data-aos="fade-left"><img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2071" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s]" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-12 flex items-end font-black italic"><h4 className="text-5xl font-black uppercase italic text-white tracking-tighter leading-none logo-font font-black italic">REFLEXION <br/> ABSOLUE.</h4></div></div></div></div>
            
            <section id="reseau-section" className="max-w-[1600px] mx-auto px-6 md:px-12 py-60 text-left font-black italic uppercase"><div className="mb-20 text-white"><h2 className="text-6xl uppercase tracking-tighter logo-font font-black italic">UNITÉS <span className="text-[#00f2ff]">ACTIVES.</span></h2></div><div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white font-black">{(searchResults || publicDetailers).length > 0 ? (searchResults || publicDetailers).map((pro) => (<div key={pro.id} className="bg-white/5 border border-white/10 p-10 rounded-[50px] hover:border-[#bc13fe] transition-all group shadow-2xl backdrop-blur-3xl"><h3 className="text-2xl uppercase group-hover:text-[#bc13fe] leading-none font-black italic">{pro.nom_commercial}</h3><p className="text-[9px] text-slate-500 mt-4 uppercase tracking-widest italic mb-10 font-black font-black leading-relaxed font-black uppercase italic"><i className="fas fa-location-dot mr-2 text-[#bc13fe]"></i>{pro.adresse}</p><div className="flex justify-between items-center pt-8 border-t border-white/5"><button onClick={() => setSelectedProForProfile(pro)} className="text-[10px] font-black uppercase bg-white text-black px-10 py-4 rounded-full hover:bg-[#bc13fe] hover:text-white transition-all shadow-xl italic w-full uppercase">CONSULTER_PROFIL</button></div></div>)) : null}</div></section>

            <section className="max-w-[1600px] mx-auto px-6 md:px-12 py-40 font-black italic text-left uppercase"><div className="flex justify-between items-end mb-20 gap-8"><h2 className="text-7xl md:text-9xl uppercase leading-none tracking-tighter text-white font-black italic">NOS <br/> <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>ALGORITHMES.</span></h2></div><div className="grid grid-cols-1 md:grid-cols-4 gap-6">{[{icon:'fa-soap',t:'Cryo-Genic',d:'Glace carbonique.',c:'#bc13fe'},{icon:'fa-shield-halved',t:'Armor-9H',d:'Nano Protection.',c:'#00f2ff'},{icon:'fa-wand-magic-sparkles',t:'Mirror-Finish',d:'Polissage miroir.',c:'#bc13fe'},{icon:'fa-couch',t:'Inner-Soin',d:'Soins cuirs rares.',c:'#00f2ff'}].map((item,i)=>(<div key={i} className="bg-white/5 backdrop-blur-md p-12 rounded-[60px] border border-white/5 hover:border-[#bc13fe] transition-all group shadow-2xl"><div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-xl mb-12" style={{color:item.c}}><i className={`fas ${item.icon}`}></i></div><h3 className="text-2xl mb-4 font-black uppercase italic leading-none">{item.t}</h3><p className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic leading-loose">{item.d}</p></div>))}</div></section>

            <section className="max-w-4xl mx-auto py-60 px-6 font-black italic uppercase"><h2 className="text-[10px] uppercase tracking-[0.8em] text-center text-slate-500 mb-20 italic">F.A.Q_Protocoles</h2><div className="space-y-4">{['Délais exécution ?', 'Garantie protection ?'].map((q,i)=>(<details key={i} className="group bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 overflow-hidden transition-all duration-500"><summary className="flex justify-between items-center p-12 cursor-pointer list-none"><span className="text-xl uppercase italic tracking-tighter group-open:text-[#bc13fe]">{q}</span><i className="fas fa-chevron-down text-[10px] transition-transform group-open:rotate-180"></i></summary><div className="px-12 pb-12 text-slate-400 text-[10px] tracking-widest uppercase italic leading-loose text-left">Standard: 4h / Expert: 48h.</div></details>))}</div></section>
        </>
      )}

      {showAuth && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 text-left font-black italic uppercase" data-aos="zoom-in"><div className="w-full max-w-sm bg-white/5 border border-white/10 p-12 rounded-[60px] shadow-2xl relative uppercase"><button onClick={() => setShowAuth(false)} className="absolute top-8 right-8 text-white/20 transition font-black">✕</button><h3 className="text-2xl uppercase tracking-tighter mb-8 text-center text-white underline underline-offset-8 decoration-[#bc13fe] decoration-2">Access_Panel</h3><div className="space-y-4"><input type="email" placeholder="EMAIL_ID" className="w-full bg-black border border-white/10 p-6 text-[10px] rounded-3xl text-white italic shadow-inner font-black" onChange={e => setEmail(e.target.value)} /><input type="password" placeholder="SECURE_HASH" className="w-full bg-black border border-white/10 p-6 text-[10px] rounded-3xl text-white italic shadow-inner font-black" onChange={e => setPassword(e.target.value)} />{authMode === 'login' ? (<button onClick={() => handleAuth()} className="w-full bg-white text-black py-6 rounded-3xl uppercase text-[10px] hover:bg-[#bc13fe] hover:text-white shadow-xl italic font-black transition-all tracking-[0.4em]">INIT_SESSION</button>) : (<div className="grid grid-cols-2 gap-3 uppercase font-black"><button onClick={() => handleAuth('pro')} className="w-full border border-[#bc13fe] text-[#bc13fe] py-5 rounded-2xl text-[9px] hover:bg-[#bc13fe] hover:text-white transition shadow-lg italic">Expert</button><button onClick={() => handleAuth('client')} className="w-full border border-white/10 text-white/40 py-5 rounded-2xl text-[9px] hover:border-white transition shadow-lg italic">Client</button></div>)}<button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full text-[8px] font-bold opacity-30 mt-6 uppercase tracking-widest text-center underline font-black italic">Switcher_Accès</button></div></div></div>
      )}

      {selectedProForProfile && (<ProPublicProfile pro={selectedProForProfile} session={session} onBookingClick={() => setIsBookingOpen(true)} onClose={() => setSelectedProForProfile(null)} />)}
      {isBookingOpen && selectedProForProfile && (<BookingModal pro={selectedProForProfile} session={session} onClose={() => { setIsBookingOpen(false); setSelectedProForProfile(null); }} />)}
      
      <footer className="max-w-[1600px] mx-auto px-6 md:px-20 py-20 border-t border-white/10 flex justify-between items-center font-black italic text-white/10 uppercase"><div className="logo-font text-[12px] font-bold tracking-[0.5em]">DETAILPLAN</div><p className="text-[8px] uppercase tracking-[0.5em]">©2026 / Protocol_Engine 1.2.0</p></footer>
    </div>
  );
}
