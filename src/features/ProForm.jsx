import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProForm({ session, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom_responsable: '',
    telephone: '',
    siret: '',
    nom_commercial: '',
    is_mobile: false,
    adresse: '',
    bio: '',
    tarifs: { petit: '', berline: '', suv: '' },
    delai_prevenance: '24h'
  });

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles_pro')
      .upsert({ 
        id: session.user.id, 
        ...formData,
        updated_at: new Date() 
      });

    setLoading(false);
    if (error) alert(error.message);
    else onComplete();
  };

  const inputStyle = "w-full bg-white/5 border border-white/10 p-5 text-[10px] tracking-widest outline-none focus:border-[#bc13fe] transition-all rounded-xl text-white";
  const labelStyle = "text-[9px] font-black uppercase text-slate-500 mb-2 block tracking-widest";

  return (
    <div className="max-w-4xl mx-auto py-10 px-6" data-aos="fade-up">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${step >= s ? 'bg-[#bc13fe] shadow-[0_0_20px_#bc13fe]' : 'bg-black border border-white/20'}`}>
            0{s}
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-16 backdrop-blur-3xl shadow-2xl">
        {step === 1 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">01. Identification <span className="text-white/20">Privée</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Responsable Légal</label>
                <input className={inputStyle} type="text" placeholder="PRÉNOM NOM" value={formData.nom_responsable} onChange={e => setFormData({...formData, nom_responsable: e.target.value})} />
              </div>
              <div>
                <label className={labelStyle}>Contact Direct (Mobile)</label>
                <input className={inputStyle} type="tel" placeholder="06 XX XX XX XX" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Numéro SIRET</label>
                <input className={inputStyle} type="text" placeholder="14 CHIFFRES" value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">02. Vitrine <span className="text-[#00f2ff]">Publique</span></h2>
            <div>
              <label className={labelStyle}>Nom de l'Atelier</label>
              <input className={inputStyle} type="text" placeholder="EX: LUXURY DETAILING PARIS" value={formData.nom_commercial} onChange={e => setFormData({...formData, nom_commercial: e.target.value})} />
            </div>
            <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.is_mobile} onChange={e => setFormData({...formData, is_mobile: e.target.checked})} className="accent-[#bc13fe]" />
                    <span className="text-[10px] font-bold uppercase italic">Je propose le service à domicile (Mobile)</span>
                </label>
            </div>
            <div>
              <label className={labelStyle}>Adresse de l'Atelier (ou zone)</label>
              <input className={inputStyle} type="text" placeholder="123 RUE DU GLOSS, 75000 PARIS" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">03. Business <span className="text-[#bc13fe]">Core</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>Citadine (€)</label>
                <input className={inputStyle} type="number" placeholder="ex: 80" value={formData.tarifs.petit} onChange={e => setFormData({...formData, tarifs: {...formData.tarifs, petit: e.target.value}})} />
              </div>
              <div>
                <label className={labelStyle}>Berline (€)</label>
                <input className={inputStyle} type="number" placeholder="ex: 120" value={formData.tarifs.berline} onChange={e => setFormData({...formData, tarifs: {...formData.tarifs, berline: e.target.value}})} />
              </div>
              <div>
                <label className={labelStyle}>SUV / 4x4 (€)</label>
                <input className={inputStyle} type="number" placeholder="ex: 160" value={formData.tarifs.suv} onChange={e => setFormData({...formData, tarifs: {...formData.tarifs, suv: e.target.value}})} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Délai de prévenance min.</label>
              <select className={inputStyle} value={formData.delai_prevenance} onChange={e => setFormData({...formData, delai_prevenance: e.target.value})}>
                <option value="2h">Instant (2h)</option>
                <option value="24h">Sécurité (24h)</option>
                <option value="48h">Confort (48h)</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-16 pt-8 border-t border-white/10">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition">Retour</button>
          )}
          <button 
            onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
            disabled={loading}
            className="ml-auto bg-white text-black px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#bc13fe] hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {loading ? 'SYNC...' : step < 3 ? 'Continuer' : 'Lancer mon Business'}
          </button>
        </div>
      </div>
    </div>
  );
}