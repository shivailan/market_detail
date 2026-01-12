import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../utils/storage';

export default function ProDashboard({ session, dark }) {
  const [profile, setProfile] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Profil
    const { data: prof } = await supabase.from('profiles_pro').select('*').eq('id', session.user.id).maybeSingle();
    if (prof) setProfile(prof);
    else setIsConfiguring(true);

    // Rendez-vous
    const { data: apps } = await supabase.from('appointments').select('*').eq('pro_id', session.user.id).order('created_at', { ascending: false });
    if (apps) setAppointments(apps);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (appId, newStatus) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', appId);
    if (!error) fetchData();
  };

  if (loading) return <div className="pt-40 text-center animate-pulse font-black italic uppercase">Sync_Database...</div>;

  const glass = dark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.03] border-black/10';

  return (
    <div className={`pt-40 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto font-black italic uppercase ${dark ? 'text-white' : 'text-black'}`}>
      
      {isConfiguring ? (
        <ProCMS 
          profile={profile} 
          session={session} 
          dark={dark} 
          onComplete={() => { setIsConfiguring(false); fetchData(); }} 
        />
      ) : (
        <div className="animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className={`p-8 rounded-[40px] border ${glass}`}>
                <p className="text-[8px] opacity-40 mb-2">MISSIONS_TOTAL</p>
                <p className="text-5xl font-black">{appointments.length}</p>
            </div>
            <div className={`p-8 rounded-[40px] border ${glass}`}>
                <p className="text-[8px] opacity-40 mb-2 text-[#bc13fe]">EN_ATTENTE</p>
                <p className="text-5xl font-black">{appointments.filter(a => a.status === 'en attente').length}</p>
            </div>
            <button onClick={() => setIsConfiguring(true)} className="p-8 rounded-[40px] border border-[#00f2ff] text-[#00f2ff] hover:bg-[#00f2ff] hover:text-black transition-all text-2xl">
                EDIT_STUDIO_CMS
            </button>
          </div>

          <div className={`p-10 rounded-[60px] border ${glass}`}>
            <h3 className="text-3xl mb-12 tracking-tighter italic">MISSIONS_<span className="text-[#bc13fe]">CONTROL_CENTER</span></h3>
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="p-8 bg-black/20 rounded-[35px] border border-white/5 flex flex-wrap justify-between items-center gap-6 group hover:border-[#bc13fe]">
                  <div className="text-left min-w-[150px]">
                    <p className="text-[7px] opacity-30 mb-1">CLIENT_NAME</p>
                    <p className="text-[12px] text-[#bc13fe] truncate">{app.client_name}</p>
                  </div>
                  <div className="text-left min-w-[150px]">
                    <p className="text-[7px] opacity-30 mb-1">PROTOCOLE</p>
                    <p className="text-[12px]">{app.service_type || 'Detailing_Custom'}</p>
                  </div>
                  <div className="text-left min-w-[150px]">
                    <p className="text-[7px] opacity-30 mb-1">SCHEDULE</p>
                    <p className="text-[12px] text-[#00f2ff]">{app.appointment_date} @ {app.appointment_time}</p>
                  </div>
                  <div className="flex gap-4">
                    {app.status === 'en attente' ? (
                      <>
                        <button onClick={() => updateStatus(app.id, 'confirmé')} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><i className="fas fa-check"></i></button>
                        <button onClick={() => updateStatus(app.id, 'refusé')} className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-times"></i></button>
                      </>
                    ) : (
                      <span className={`text-[10px] px-8 py-3 rounded-full border ${app.status === 'confirmé' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>{app.status.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProCMS({ profile, session, dark, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(profile || {
    nom_commercial: '', adresse: '', bio: '', about_text: '', cover_url: '',
    catalog_images: [], 
    custom_tarifs: [{ service: '', price: '' }],
    stats_data: { xp: '1', missions: '0', shield: '9H' },
    working_days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    working_hours: { start: "08:00", end: "18:00" }
  });

  const handleFile = async (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      if (field === 'catalog_images') setFormData({...formData, catalog_images: [...formData.catalog_images, url]});
      else setFormData({...formData, [field]: url});
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles_pro').upsert({ id: session.user.id, ...formData, is_visible: true, updated_at: new Date() });
    if (error) alert(error.message);
    setLoading(false);
    onComplete();
  };

  const inputStyle = `w-full border p-6 rounded-[25px] mb-4 outline-none font-black italic uppercase transition-all ${dark ? 'bg-black text-white border-white/10 focus:border-[#bc13fe]' : 'bg-slate-50 text-black border-black/10 focus:border-[#bc13fe]'}`;

  return (
    <div className={`p-12 rounded-[60px] border shadow-2xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
      <div className="mb-12 flex justify-between text-[7px] opacity-40 font-black tracking-[0.4em]">
        {["IDENTITÉ", "PORTFOLIO", "MANIFESTO", "PLANNING", "OFFRES"].map((n, i) => (
          <span key={i} className={step === i + 1 ? "text-[#bc13fe] underline underline-offset-8" : ""}>{n}</span>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-in slide-in-from-bottom-4">
          <h2 className="text-4xl mb-10 italic font-black">CORE_IDENTITY</h2>
          <input className={inputStyle} value={formData.nom_commercial} placeholder="NOM DU STUDIO" onChange={e => setFormData({...formData, nom_commercial: e.target.value})} />
          <input className={inputStyle} value={formData.adresse} placeholder="VILLE / ADRESSE" onChange={e => setFormData({...formData, adresse: e.target.value})} />
        </div>
      )}

      {step === 2 && (
        <div className="animate-in slide-in-from-bottom-4 space-y-8">
          <h2 className="text-4xl mb-10 italic font-black">VISUAL_ASSETS</h2>
          <div>
            <p className="text-[8px] mb-4 opacity-40">IMAGE DE COUVERTURE PRINCIPALE</p>
            <label className="w-full h-40 border-2 border-dashed border-current/10 rounded-[30px] flex items-center justify-center cursor-pointer hover:bg-current/5 transition-all overflow-hidden relative">
                {formData.cover_url ? <img src={formData.cover_url} className="w-full h-full object-cover opacity-40" /> : "UPLOAD_COVER"}
                <input type="file" className="hidden" onChange={e => handleFile(e, 'cover_url')} />
            </label>
          </div>
          <div>
            <p className="text-[8px] mb-4 opacity-40">PORTFOLIO (MAX 5 IMAGES)</p>
            <div className="grid grid-cols-5 gap-4">
                {formData.catalog_images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden relative border border-white/10 group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => setFormData({...formData, catalog_images: formData.catalog_images.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-black text-xl">✕</button>
                    </div>
                ))}
                {formData.catalog_images.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-current/10 rounded-2xl flex items-center justify-center cursor-pointer text-2xl hover:bg-current/5">+</label>
                )}
                <input type="file" className="hidden" onChange={e => handleFile(e, 'catalog_images')} />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in slide-in-from-bottom-4">
          <h2 className="text-4xl mb-10 italic font-black">MANIFESTO_BIO</h2>
          <textarea className={`${inputStyle} h-24`} value={formData.about_text} placeholder="SLOGAN (EX: LA PERFECTION DANS CHAQUE DÉTAIL...)" onChange={e => setFormData({...formData, about_text: e.target.value})} />
          <textarea className={`${inputStyle} h-40`} value={formData.bio} placeholder="DÉCRIPTION COMPLÈTE DU STUDIO / VOTRE PARCOURS..." onChange={e => setFormData({...formData, bio: e.target.value})} />
        </div>
      )}

      {step === 4 && (
        <div className="animate-in slide-in-from-bottom-4 space-y-10">
          <h2 className="text-4xl mb-10 italic font-black">AVAILABILITY</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => (
                <button key={day} onClick={() => {
                    const cur = [...formData.working_days];
                    const i = cur.indexOf(day);
                    if (i > -1) cur.splice(i, 1); else cur.push(day);
                    setFormData({...formData, working_days: cur});
                }} className={`p-6 rounded-3xl border transition-all text-[10px] font-black italic ${formData.working_days.includes(day) ? 'bg-[#bc13fe] border-[#bc13fe] text-white' : 'opacity-20'}`}>
                    {day}
                </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-10">
                <div>
                    <label className="text-[9px] mb-4 block opacity-40">OUVERTURE</label>
                    <input type="time" className={inputStyle} value={formData.working_hours.start} onChange={e => setFormData({...formData, working_hours: {...formData.working_hours, start: e.target.value}})} />
                </div>
                <div>
                    <label className="text-[9px] mb-4 block opacity-40">FERMETURE</label>
                    <input type="time" className={inputStyle} value={formData.working_hours.end} onChange={e => setFormData({...formData, working_hours: {...formData.working_hours, end: e.target.value}})} />
                </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="animate-in slide-in-from-bottom-4 space-y-6">
          <h2 className="text-4xl mb-10 italic font-black">PRICING_GRID</h2>
          {formData.custom_tarifs.map((t, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 animate-in fade-in">
                <input className={`${inputStyle} col-span-8`} placeholder="NOM DU SERVICE" value={t.service} onChange={e => { const n = [...formData.custom_tarifs]; n[i].service = e.target.value; setFormData({...formData, custom_tarifs: n})}} />
                <input className={`${inputStyle} col-span-3`} placeholder="PRIX (€)" type="number" value={t.price} onChange={e => { const n = [...formData.custom_tarifs]; n[i].price = e.target.value; setFormData({...formData, custom_tarifs: n})}} />
                <button onClick={() => setFormData({...formData, custom_tarifs: formData.custom_tarifs.filter((_, idx) => idx !== i)})} className="col-span-1 text-red-500 font-black italic">✕</button>
            </div>
          ))}
          <button onClick={() => setFormData({...formData, custom_tarifs: [...formData.custom_tarifs, {service:'', price:''}]})} className="w-full py-6 border-2 border-dashed border-current/10 rounded-3xl opacity-40 hover:opacity-100 transition-all font-black italic">+ AJOUTER_PROTOCOLE</button>
        </div>
      )}

      <div className="flex justify-between mt-20 pt-10 border-t border-white/5 font-black italic">
        {step > 1 && <button onClick={() => setStep(step - 1)} className="text-[12px] opacity-40 hover:opacity-100">BACK_PHASE</button>}
        <button onClick={() => step < 5 ? setStep(step + 1) : save()} disabled={loading} className="ml-auto px-16 py-7 rounded-full bg-white text-black text-[12px] hover:bg-[#bc13fe] hover:text-white transition-all shadow-xl">
            {loading ? 'DEPLOYING...' : step < 5 ? 'NEXT_PHASE' : 'FINISH_DEPLOYMENT'}
        </button>
      </div>
    </div>
  );
}