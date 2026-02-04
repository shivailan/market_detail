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

  // 1. RÉCUPÉRATION DES RDV & REALTIME
  useEffect(() => {
    if (!pro?.id) return;

    const loadData = async () => {
      const { data } = await supabase
        .from('appointments')
        .select('appointment_date, appointment_time, status')
        .eq('pro_id', pro.id);
      
      if (data) setDbAppointments(data);
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

  // 2. GÉNÉRATION DE TOUS LES CRÉNEAUX AVEC ÉTAT "PRIS"
// 2. GÉNÉRATION DE TOUS LES CRÉNEAUX AVEC ÉTAT "PRIS" OU "PASSÉ"
  const allSlots = useMemo(() => {
    if (!pro.working_hours?.start || !pro.working_hours?.end) return [];
    
    const now = new Date();
    const targetDateStr = format(selectedDate, 'yyyy-MM-dd');
    const todayStr = format(now, 'yyyy-MM-dd');

    // 1. Liste des codes "1000" pour les RDV occupés en base
    const busyTimes = dbAppointments
      .filter(appt => {
        const dbDate = appt.appointment_date.replace(/\D/g, '').substring(0, 8);
        const targetDateClean = targetDateStr.replace(/\D/g, '');
        const isValid = !['refusé', 'annulé'].includes(appt.status?.toLowerCase());
        return dbDate === targetDateClean && isValid;
      })
      .map(appt => appt.appointment_time.replace(/\D/g, '').substring(0, 4));

    const slots = [];
    let current = parse(pro.working_hours.start, 'HH:mm', new Date());
    const end = parse(pro.working_hours.end, 'HH:mm', new Date());

    while (isBefore(current, end)) {
      const timeStr = format(current, 'HH:mm');
      const timeCode = timeStr.replace(':', ''); 
      
      // --- LOGIQUE D'EXPIRATION ---
      // On crée un objet Date pour le créneau en question afin de le comparer à "maintenant"
      const slotDateTime = parse(`${targetDateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
      
      const isTaken = busyTimes.includes(timeCode);
      const isPast = isBefore(slotDateTime, now); // Est-ce que l'heure du créneau est avant "maintenant" ?

      slots.push({
        time: timeStr,
        isTaken: isTaken,
        isPast: isPast // Nouveau drapeau
      });
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
  {allSlots.map(({time, isTaken, isPast}) => {
    const isUnavailable = isTaken || isPast;

    return (
      <button 
        key={time} 
        onClick={() => { 
          if (isTaken) return alert("Ce créneau est déjà réservé.");
          if (isPast) return alert("Ce créneau est déjà passé.");
          setSelectedTime(time); 
          setStep(3); 
        }} 
        className={`py-4 rounded-xl border text-[11px] transition-all relative flex flex-col items-center justify-center gap-1 ${
          isUnavailable 
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60' 
            : selectedTime === time 
              ? 'bg-[#00f2ff] text-black border-[#00f2ff]' 
              : 'border-current/10 hover:border-[#bc13fe]'
        }`}
      >
        <span className={isUnavailable ? 'line-through opacity-50' : ''}>{time}</span>
        
        {/* Icône dynamique : Cadenas pour réservé, Horloge pour passé */}
        {isTaken && <i className="fas fa-lock text-[8px] text-red-500"></i>}
        {isPast && !isTaken && <i className="fas fa-clock text-[8px] text-gray-400"></i>}
      </button>
    );
  })}
</div>
            </div>
          )}

{step === 3 && (
  <div className="space-y-8 animate-in fade-in text-left pb-4">
    <h3 className="text-3xl tracking-tighter">DIAGNOSTIC_</h3>
    
    {/* LIEU DE PRESTATION */}
    <div className="space-y-4">
      <label className="text-[10px] opacity-40 font-bold uppercase">Lieu de la prestation</label>
      <div className="grid grid-cols-2 gap-2 p-1 bg-current/[0.05] rounded-2xl border border-current/5">
        {['Atelier', 'Domicile'].map(l => (
          <button 
            key={l} 
            onClick={() => setAnswers({...answers, location: l})} 
            className={`py-3 rounded-xl text-[10px] font-black transition-all ${
              answers.location === l ? 'bg-white text-black shadow-sm' : 'opacity-40'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>

    {/* OPTIONS DOMICILE (Conditionnel) */}
    {answers.location === 'Domicile' && (
      <div className="space-y-6 animate-in slide-in-from-top-4">
        {/* ADRESSE */}
        <div className="space-y-3">
          <label className="text-[10px] opacity-40 font-bold uppercase">Adresse complète</label>
          <input 
            className="w-full p-5 rounded-2xl border border-current/10 bg-transparent text-[11px] outline-none focus:border-[#bc13fe] transition-all" 
            placeholder="N°, rue, ville, CP..." 
            value={answers.address} 
            onChange={e => setAnswers({...answers, address: e.target.value})} 
          />
        </div>

        {/* PRISE ÉLECTRIQUE (Nouveau) */}
        <div className="space-y-3 p-5 rounded-3xl border border-[#bc13fe]/20 bg-[#bc13fe]/5">
          <div className="flex items-center gap-3 mb-2">
            <i className="fas fa-plug text-[#bc13fe] text-xs"></i>
            <label className="text-[10px] font-bold uppercase tracking-widest">Accès à une prise ?</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Oui', 'Non'].map(choice => (
              <button 
                key={choice} 
                onClick={() => setAnswers({...answers, hasPower: choice})} 
                className={`py-3 rounded-xl text-[10px] font-black border transition-all ${
                  answers.hasPower === choice 
                    ? 'bg-[#bc13fe] text-white border-[#bc13fe]' 
                    : 'border-current/10 opacity-40'
                }`}
              >
                {choice.toUpperCase()}
              </button>
            ))}
          </div>
          {answers.hasPower === 'Non' && (
            <p className="text-[9px] text-red-500 mt-2 italic font-bold">
              * Attention : Une source d'énergie est nécessaire pour l'équipement.
            </p>
          )}
        </div>
      </div>
    )}

    {/* TAILLE DU VÉHICULE */}
    <div className="space-y-3">
      <label className="text-[10px] opacity-40 font-bold uppercase">Taille du véhicule</label>
      <select 
        value={answers.vehicleType} 
        onChange={e => setAnswers({...answers, vehicleType: e.target.value})} 
        className="w-full p-5 rounded-2xl bg-current/[0.05] border border-current/5 text-[11px] font-black outline-none appearance-none"
      >
        <option value="">SÉLECTIONNER...</option>
        <option value="Mini">Mini / Citadine</option>
        <option value="Compacte">Compacte</option>
        <option value="SUV">SUV / Berline</option>
        <option value="Utilitaire">Utilitaire</option>
      </select>
    </div>
  </div>
)}

          {step === 4 && (/* ... Recap */
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
            <button onClick={() => setStep(4)} disabled={!canContinue} className="w-full py-5 bg-[#bc13fe] text-white rounded-2xl text-[11px] tracking-[0.2em] disabled:opacity-20 transition-all uppercase">Récapitulatif_</button>
          ) : step === 4 ? (
            <button onClick={handleFinalize} disabled={loading} className="w-full py-5 bg-white text-black rounded-2xl text-[11px] tracking-[0.2em] uppercase">{loading ? 'EN_COURS...' : 'Payer maintenant'}</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}