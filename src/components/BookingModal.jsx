import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function BookingModal({ pro, session, onClose, dark }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  const handleFinalize = async () => {
    if (!session?.user?.id) {
        alert("Session expirée. Veuillez vous reconnecter.");
        return;
    }

    setLoading(true);
    const { error } = await supabase.from('appointments').insert([{
      pro_id: pro.id,
      client_id: session.user.id, // CRUCIAL : lie la résa au client
      client_name: session.user.email,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      service_type: selectedService.service,
      status: 'en attente'
    }]);

    if (error) {
      alert("Erreur de transmission : " + error.message);
    } else {
      alert("Demande envoyée au studio !");
      onClose();
    }
    setLoading(false);
  };

  const glass = dark ? 'bg-[#050505] text-white border-white/10' : 'bg-white text-black border-black/10';

  return (
    <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`w-full max-w-xl rounded-[40px] border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 ${glass}`}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-current/5 flex justify-between items-center italic font-black uppercase">
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="w-10 h-10 flex items-center justify-center">
            <i className={`fas ${step === 1 ? 'fa-times' : 'fa-chevron-left'}`}></i>
          </button>
          <div className="text-center">
            <p className="text-[10px] tracking-widest">{pro.nom_commercial}</p>
            <p className="text-[8px] opacity-40">Protocole Etape {step}/3</p>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="p-10 italic font-black uppercase">
          {step === 1 && (
            <div className="animate-in fade-in">
              <h3 className="text-xl mb-8">Sélectionner Prestation</h3>
              <div className="space-y-3">
                {pro.custom_tarifs?.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setSelectedService(s); setStep(2); }}
                    className="w-full p-6 rounded-3xl border border-current/10 flex justify-between items-center hover:border-[#bc13fe] transition-all bg-current/[0.02]"
                  >
                    <span className="text-sm">{s.service}</span>
                    <span className="text-[#bc13fe]">{s.price}€</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in">
              <h3 className="text-xl mb-8">Planifier l'intervention</h3>
              <input 
                type="date" 
                className="w-full p-5 rounded-2xl bg-current/5 mb-6 outline-none border-none font-black uppercase italic"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(t => (
                  <button 
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`p-3 rounded-xl text-[10px] border transition-all ${selectedTime === t ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'border-current/10 opacity-40'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {selectedDate && selectedTime && (
                <button onClick={() => setStep(3)} className="w-full mt-10 bg-white text-black py-5 rounded-full shadow-xl">Valider Créneau</button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="animate-in zoom-in-95 text-center">
              <div className="p-8 rounded-[40px] bg-current/[0.03] text-left mb-8 border border-current/5">
                <p className="text-[8px] opacity-40 mb-4 tracking-widest">RÉCAPITULATIF_MISSION</p>
                <div className="flex justify-between mb-2 text-sm"><span>Service:</span> <span>{selectedService.service}</span></div>
                <div className="flex justify-between mb-2 text-sm"><span>Date:</span> <span className="text-[#00f2ff]">{selectedDate}</span></div>
                <div className="flex justify-between mb-6 text-sm"><span>Heure:</span> <span className="text-[#00f2ff]">{selectedTime}</span></div>
                <div className="flex justify-between text-xl pt-4 border-t border-current/10"><span>TOTAL</span> <span>{selectedService.price}€</span></div>
              </div>
              <button 
                onClick={handleFinalize} 
                disabled={loading}
                className="w-full bg-[#bc13fe] text-white py-6 rounded-full font-black tracking-[0.4em] shadow-2xl hover:scale-105 transition-all"
              >
                {loading ? 'SYNCHRONISATION...' : 'CONFIRMER LE RDV'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}