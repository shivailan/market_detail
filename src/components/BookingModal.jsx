import { addMinutes, format, isBefore, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function BookingModal({ pro, session, onClose, dark }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState({
    location: 'Atelier',
    address: '',
    hasPower: 'Non',
    vehicleType: '',
    seatType: 'Tissu',
    hasPets: 'Non',
    majorDirt: 'Non'
  });

  // --- LOGIQUE ANTI-DOUBLE RÉSERVATION (FIXED) ---
  const dynamicSlots = useMemo(() => {
    if (!pro.working_hours?.start || !pro.working_hours?.end) return [];

    const slots = [];
    let current = parse(pro.working_hours.start, 'HH:mm', new Date());
    const end = parse(pro.working_hours.end, 'HH:mm', new Date());
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    // 1. On récupère les créneaux PRIS et on les NETTOIE (HH:mm)
    const takenSlots = pro.appointments
      ?.filter(appt => 
        appt.appointment_date === selectedDateStr && 
        !['refusé', 'annulé'].includes(appt.status)
      )
      .map(appt => {
        const time = appt.appointment_time;
        // On garde uniquement les 5 premiers caractères "HH:mm"
        return time.includes(':') ? time.substring(0, 5) : time;
      }) || [];

    // 2. On génère les boutons en vérifiant l'état
    while (isBefore(current, end)) {
      const timeString = format(current, 'HH:mm');
      slots.push({
        time: timeString,
        isTaken: takenSlots.includes(timeString)
      });
      current = addMinutes(current, 60);
    }
    return slots;
  }, [selectedDate, pro.working_hours, pro.appointments]);

  const handleFinalize = async () => {
    if (!selectedTime) return alert("Veuillez choisir un créneau.");
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: selectedService.titre || selectedService.service,
          price: selectedService.price,
          metadata: {
            pro_id: pro.id,
            client_email: session.user.email,
            service_name: selectedService.titre,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
            intervention_type: answers.location,
            intervention_address: answers.location === 'Domicile' ? answers.address : 'Atelier',
            has_power: answers.hasPower,
            vehicle_type: answers.vehicleType,
            technical_details: `Sièges: ${answers.seatType} | Poils: ${answers.hasPets}`,
            major_dirt: answers.majorDirt
          }
        }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      alert("Erreur lors de l'initialisation du paiement");
    } finally {
      setLoading(false);
    }
  };

  const glass = dark ? 'bg-[#0a0a0b] text-white border-white/10' : 'bg-white text-black border-black/10';
  const canContinue = answers.vehicleType !== '' && (answers.location === 'Atelier' || answers.address.length > 5);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-[450px] flex flex-col max-h-[85vh] rounded-[32px] border shadow-2xl ${glass} overflow-hidden font-sans`}>
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-current/5 flex justify-between items-center bg-inherit">
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="opacity-50 hover:opacity-100 transition-opacity">
            <i className={`fas ${step === 1 ? 'fa-times' : 'fa-arrow-left'}`}></i>
          </button>
          <p className="text-[11px] font-bold tracking-widest uppercase opacity-40">Étape {step} sur 4</p>
          <div className="w-5"></div>
        </div>

        {/* CONTENU */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Choisir_Forfait</h3>
              <div className="space-y-3">
                {pro.services_list?.map((s, i) => (
                  <button key={i} onClick={() => { setSelectedService(s); setStep(2); }} className="w-full p-5 rounded-2xl border border-current/10 hover:border-[#bc13fe] transition-all text-left flex justify-between items-center bg-current/[0.02]">
                    <div>
                      <p className="font-bold text-sm uppercase">{s.titre || s.service}</p>
                      <p className="text-[11px] opacity-50 italic">{s.price}€ — {s.desc || "Détails techniques"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in flex flex-col">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-left">Planning_</h3>
              <div className="bg-current/[0.02] rounded-3xl p-2 border border-current/5 scale-95 origin-top mx-auto">
                <DayPicker 
                  mode="single" 
                  selected={selectedDate} 
                  onSelect={(d) => d && setSelectedDate(d)} 
                  locale={fr} 
                  disabled={(d) => isBefore(d, new Date().setHours(0,0,0,0))} 
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {dynamicSlots.map(({ time, isTaken }) => (
                  <button 
                    key={time} 
                    disabled={isTaken}
                    title={isTaken ? "Ce créneau est déjà réservé" : ""}
                    onClick={() => { setSelectedTime(time); setStep(3); }} 
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      isTaken 
                        ? 'bg-gray-500/10 border-gray-500/20 text-gray-400 cursor-not-allowed opacity-30 grayscale' 
                        : selectedTime === time 
                          ? 'bg-[#00f2ff] text-black border-[#00f2ff]' 
                          : 'border-current/10 opacity-60 hover:opacity-100 hover:border-[#bc13fe]'
                    }`}
                  >
                    {isTaken ? 'PRIS' : time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in pb-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Diagnostic_</h3>
              {/* (Lieu, Taille véhicule, Sièges, Options... identiques à ta version précédente) */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold opacity-40 uppercase">Lieu de la prestation</label>
                <div className="flex p-1 bg-current/[0.05] rounded-xl border border-current/5">
                  {['Atelier', 'Domicile'].map(l => (
                    <button key={l} onClick={() => setAnswers({...answers, location: l})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${answers.location === l ? 'bg-white text-black shadow-sm' : 'opacity-40'}`}>{l}</button>
                  ))}
                </div>
                {answers.location === 'Domicile' && (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <input className="w-full p-4 rounded-xl border border-current/10 bg-transparent text-xs outline-none focus:border-[#bc13fe]" placeholder="Adresse complète..." value={answers.address} onChange={e => setAnswers({...answers, address: e.target.value})} />
                    <div className="flex items-center justify-between p-4 bg-[#00f2ff]/5 rounded-xl border border-[#00f2ff]/10">
                      <span className="text-[10px] font-bold opacity-60 uppercase">Accès prise ?</span>
                      <div className="flex gap-2">
                        {['Oui', 'Non'].map(opt => (
                          <button key={opt} onClick={() => setAnswers({...answers, hasPower: opt})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${answers.hasPower === opt ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'opacity-30'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold opacity-40 uppercase">Taille du véhicule</label>
                <select value={answers.vehicleType} onChange={e => setAnswers({...answers, vehicleType: e.target.value})} className="w-full p-4 rounded-xl bg-current/[0.05] border border-current/5 text-xs font-bold outline-none">
                  <option value="">Sélectionner...</option>
                  <option value="Mini">Mini (Citadine)</option>
                  <option value="Compacte">Compacte</option>
                  <option value="SUV">SUV / Berline</option>
                  <option value="Utilitaire">Utilitaire</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold opacity-40 uppercase">Sièges</label>
                  <select value={answers.seatType} onChange={e => setAnswers({...answers, seatType: e.target.value})} className="w-full p-4 rounded-xl bg-current/[0.05] border border-current/5 text-xs font-bold outline-none">
                      <option value="Tissu">Tissu</option>
                      <option value="Cuir">Cuir</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold opacity-40 uppercase">Options</label>
                  <div className="flex gap-2">
                      <button onClick={() => setAnswers({...answers, hasPets: answers.hasPets === 'Oui' ? 'Non' : 'Oui'})} className={`flex-1 py-3 rounded-xl border text-[9px] font-bold ${answers.hasPets === 'Oui' ? 'bg-white text-black' : 'opacity-30'}`}>POILS</button>
                      <button onClick={() => setAnswers({...answers, majorDirt: answers.majorDirt === 'Oui' ? 'Non' : 'Oui'})} className={`flex-1 py-3 rounded-xl border text-[9px] font-bold ${answers.majorDirt === 'Oui' ? 'bg-red-500 text-white border-red-500' : 'opacity-30'}`}>SALE++</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in zoom-in-95 space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-[#00f2ff]/10 text-[#00f2ff] rounded-full flex items-center justify-center mx-auto text-xl shadow-[0_0_20px_rgba(0,242,255,0.1)]"><i className="fas fa-check"></i></div>
              <div className={`p-6 rounded-3xl text-left border border-current/10 space-y-4 bg-current/[0.02]`}>
                <div className="flex justify-between items-baseline"><p className="text-[10px] font-bold opacity-30 uppercase">Prestation</p><p className="text-xs font-bold italic">{selectedService?.titre}</p></div>
                <div className="flex justify-between items-baseline"><p className="text-[10px] font-bold opacity-30 uppercase">Date</p><p className="text-xs font-bold text-[#00f2ff]">{format(selectedDate, 'dd MMMM')} @ {selectedTime}</p></div>
                <div className="h-[1px] bg-current/5" />
                <div className="flex justify-between items-center"><p className="text-sm font-bold opacity-30 uppercase">Total</p><p className="text-3xl font-black">{selectedService?.price}€</p></div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-current/5 bg-inherit">
          {step === 3 ? (
            <button onClick={() => setStep(4)} disabled={!canContinue} className={`w-full py-5 bg-[#bc13fe] text-white rounded-2xl font-black text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-20`}>
              VÉRIFIER LE RÉCAPITULATIF
            </button>
          ) : step === 4 ? (
            <button onClick={handleFinalize} disabled={loading} className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl uppercase font-sans">
              {loading ? 'Traitement...' : 'Procéder au paiement'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}