import { addMinutes, format, isBefore, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { supabase } from '../lib/supabase';

export default function BookingModal({ pro, session, onClose, dark }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbAppointments, setDbAppointments] = useState([]);

  const [answers, setAnswers] = useState({
    location: 'Atelier',
    address: '',
    hasPower: 'Non',
    vehicleType: '',
    seatType: 'Tissu',
    hasPets: 'Non',
    majorDirt: 'Non'
  });

  // 1. RÉCUPÉRATION DES RDV
// --- RÉCUPÉRATION ET TEMPS RÉEL ---
useEffect(() => {
  if (!pro?.id) return;

  const loadData = async () => {
    // On récupère TOUS les rendez-vous du pro sans exception pour debugger
    const { data, error } = await supabase
      .from('appointments')
      .select('*') // On prend tout
      .eq('pro_id', pro.id);
    
    if (data) {
      console.log("📊 TOTAL RDV en base pour ce pro:", data.length);
      console.log("Détails des dates reçues:", data.map(d => d.appointment_date));
      setDbAppointments(data);
    }
  };

  loadData();

  const channel = supabase
    .channel('table-db-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'appointments', filter: `pro_id=eq.${pro.id}` }, 
      () => loadData()
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [pro.id]);

// 2. GÉNÉRATION DES CRÉNEAUX DISPONIBLES UNIQUEMENT
const availableSlots = useMemo(() => {
  if (!pro.working_hours?.start || !pro.working_hours?.end) return [];
  
  // Date sélectionnée sur le calendrier (ex: 20260204)
  const targetDate = format(selectedDate, 'yyyyMMdd');

  // On crée la liste des heures occupées pour CE JOUR
  const busyTimes = dbAppointments
    .filter(appt => {
      // Nettoyage date DB (garde juste YYYYMMDD)
      const dbDate = appt.appointment_date.replace(/\D/g, '').substring(0, 8);
      const isSameDay = dbDate === targetDate;
      const isValid = !['refusé', 'annulé'].includes(appt.status?.toLowerCase());
      return isSameDay && isValid;
    })
    .map(appt => appt.appointment_time.replace(/\D/g, '').substring(0, 4));

  const slots = [];
  let current = parse(pro.working_hours.start, 'HH:mm', new Date());
  const end = parse(pro.working_hours.end, 'HH:mm', new Date());

  while (isBefore(current, end)) {
    const timeStr = format(current, 'HH:mm');
    const timeCode = timeStr.replace(':', ''); 
    
    // Si l'heure n'est PAS dans busyTimes, on l'affiche
    if (!busyTimes.includes(timeCode)) {
      slots.push(timeStr);
    }
    current = addMinutes(current, 60);
  }
  return slots;
}, [selectedDate, pro.working_hours, dbAppointments]);

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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans uppercase italic font-black">
      <div className={`w-full max-w-[450px] flex flex-col max-h-[85vh] rounded-[32px] border shadow-2xl ${glass} overflow-hidden`}>
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-current/5 flex justify-between items-center bg-inherit">
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="opacity-50 hover:opacity-100 transition-opacity text-sm">
            <i className={`fas ${step === 1 ? 'fa-times' : 'fa-arrow-left'}`}></i>
          </button>
          <p className="text-[10px] tracking-widest opacity-40">STEP_0{step}</p>
          <div className="w-5"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-3xl tracking-tighter leading-none">CHOISIR_SERVICE</h3>
              <div className="space-y-3">
                {pro.services_list?.map((s, i) => (
                  <button key={i} onClick={() => { setSelectedService(s); setStep(2); }} className="w-full p-6 rounded-2xl border border-current/10 hover:border-[#bc13fe] transition-all text-left flex justify-between items-center bg-current/[0.02] group">
                    <div>
                      <p className="text-sm">{s.titre || s.service}</p>
                      <p className="text-[10px] opacity-40 mt-1">{s.price}€</p>
                    </div>
                    <i className="fas fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-all"></i>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-3xl tracking-tighter leading-none">PLANNING_</h3>
              
              <div className="bg-current/[0.02] rounded-3xl p-2 border border-current/5 scale-90 mx-auto">
                <DayPicker 
                  mode="single" 
                  selected={selectedDate} 
                  onSelect={(d) => d && setSelectedDate(d)} 
                  locale={fr} 
                  disabled={(d) => isBefore(d, new Date().setHours(0,0,0,0))} 
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map((time) => (
                    <button 
                      key={time} 
                      onClick={() => { setSelectedTime(time); setStep(3); }} 
                      className={`py-4 rounded-xl border text-[11px] transition-all ${
                        selectedTime === time 
                          ? 'bg-[#00f2ff] text-black border-[#00f2ff]' 
                          : 'border-current/10 hover:border-[#bc13fe]'
                      }`}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 py-10 text-center opacity-30 text-[10px] tracking-widest uppercase">
                    Aucun créneau disponible ce jour
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in">
              <h3 className="text-3xl tracking-tighter">DIAGNOSTIC_</h3>
              <div className="space-y-4 text-left">
                <label className="text-[10px] opacity-40">TYPE_INTERVENTION</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Atelier', 'Domicile'].map(l => (
                    <button key={l} onClick={() => setAnswers({...answers, location: l})} className={`py-3 rounded-xl text-[10px] border transition-all ${answers.location === l ? 'bg-[#bc13fe] text-white border-[#bc13fe]' : 'border-current/10 opacity-40'}`}>{l}</button>
                  ))}
                </div>
                {answers.location === 'Domicile' && (
                  <input className="w-full p-4 rounded-xl border border-current/10 bg-transparent text-[10px] outline-none focus:border-[#bc13fe]" placeholder="ADRESSE_COMPLETE..." value={answers.address} onChange={e => setAnswers({...answers, address: e.target.value})} />
                )}
              </div>
              <div className="space-y-3 text-left">
                <label className="text-[10px] opacity-40">TAILLE_VEHICULE</label>
                <select value={answers.vehicleType} onChange={e => setAnswers({...answers, vehicleType: e.target.value})} className={`w-full p-4 rounded-xl border border-current/10 text-[10px] bg-transparent outline-none`}>
                  <option value="">SELECTIONNER...</option>
                  <option value="Mini">Mini / Citadine</option>
                  <option value="Compacte">Compacte</option>
                  <option value="SUV">SUV / Berline</option>
                  <option value="Utilitaire">Utilitaire</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in zoom-in-95 space-y-6 py-4">
              <div className="w-16 h-16 bg-[#00f2ff]/10 text-[#00f2ff] rounded-full flex items-center justify-center mx-auto text-xl"><i className="fas fa-check"></i></div>
              <div className={`p-6 rounded-3xl text-left border border-current/10 space-y-4 bg-current/[0.02]`}>
                <div className="flex justify-between items-baseline"><p className="text-[10px] opacity-30">PRESTATION</p><p className="text-xs">{selectedService?.titre}</p></div>
                <div className="flex justify-between items-baseline"><p className="text-[10px] opacity-30">DATE_RDV</p><p className="text-xs text-[#00f2ff]">{format(selectedDate, 'dd MMMM', {locale: fr})} @ {selectedTime}</p></div>
                <div className="h-[1px] bg-current/5" />
                <div className="flex justify-between items-center"><p className="text-sm opacity-30">TOTAL</p><p className="text-3xl">{selectedService?.price}€</p></div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-current/5 bg-inherit">
          {step === 3 ? (
            <button onClick={() => setStep(4)} disabled={!canContinue} className="w-full py-5 bg-[#bc13fe] text-white rounded-2xl text-[11px] tracking-[0.2em] disabled:opacity-20 transition-all">RECAPITULATIF_</button>
          ) : step === 4 ? (
            <button onClick={handleFinalize} disabled={loading} className="w-full py-5 bg-white text-black rounded-2xl text-[11px] tracking-[0.2em]">{loading ? 'EN_COURS...' : 'FINALISER_PAIEMENT'}</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}