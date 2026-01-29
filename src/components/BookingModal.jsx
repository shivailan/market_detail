import { addMinutes, format, isBefore, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function BookingModal({ pro, session, onClose, dark, setView }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIQUE DE SÉCURITÉ SESSION ---
  if (!session) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 font-['Outfit'] italic uppercase">
        <div className={`w-full max-w-sm p-12 rounded-[50px] border border-white/10 text-center ${dark ? 'bg-[#050505] text-white' : 'bg-white text-black'}`}>
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">
            <i className="fas fa-lock"></i>
          </div>
          <h3 className="text-2xl font-black mb-4">Accès_Refusé</h3>
          <p className="text-[10px] opacity-50 mb-8 leading-relaxed">
            Vous devez être authentifié pour accéder au protocole de réservation et sécuriser votre créneau.
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-white text-black py-5 rounded-full font-black text-[10px] tracking-widest hover:bg-[#bc13fe] hover:text-white transition-all"
          >
            RETOUR / SE CONNECTER
          </button>
        </div>
      </div>
    );
  }

  // --- LOGIQUE DE DISPONIBILITÉ ---
  const disabledDays = (date) => {
    if (isBefore(date, new Date().setHours(0,0,0,0))) return true;
    const dayName = format(date, 'EEEE', { locale: fr });
    const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return !pro.working_days?.includes(formattedDay);
  };

  const generateAvailableSlots = () => {
    if (!pro.working_hours?.start || !pro.working_hours?.end) {
      return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
    }
    const slots = [];
    let current = parse(pro.working_hours.start, 'HH:mm', new Date());
    const end = parse(pro.working_hours.end, 'HH:mm', new Date());
    while (isBefore(current, end)) {
      slots.push(format(current, 'HH:mm'));
      current = addMinutes(current, 60);
    }
    return slots;
  };

  const dynamicSlots = generateAvailableSlots();

  // --- FONCTION FINALE : INSERTION AVEC CODE DE VALIDATION ---
const handleFinalize = async () => {
  if (!session?.user?.id) return alert("Veuillez vous connecter.");
  setLoading(true);

  try {
    const response = await fetch('http://localhost:3000/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceName: selectedService.titre || selectedService.service,
        price: selectedService.price,
        metadata: {
          pro_id: pro.id,
          client_email: session.user.email,
          service_name: selectedService.titre || selectedService.service, 
          date: format(selectedDate, 'yyyy-MM-dd'), 
          time: selectedTime,
        }
      }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Impossible de générer le lien de paiement.");
    }

  } catch (error) {
    console.error("ERREUR_STRIPE :", error);
    alert("ERREUR_SYSTÈME : " + error.message);
  } finally {
    setLoading(false);
  }
};

  const glass = dark ? 'bg-[#050505] text-white border-white/10' : 'bg-white text-black border-black/10';

  return (
    <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-xl p-0 md:p-4 font-black italic uppercase">
      <div className={`w-full max-w-2xl h-[95vh] md:h-auto overflow-y-auto rounded-t-[40px] md:rounded-[50px] border shadow-2xl ${glass} font-['Outfit']`}>
        
        {/* HEADER */}
        <div className="p-8 border-b border-current/5 flex justify-between items-center sticky top-0 bg-inherit z-10">
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="w-12 h-12 flex items-center justify-center rounded-full border border-current/10 hover:bg-current/5">
            <i className={`fas ${step === 1 ? 'fa-times' : 'fa-chevron-left'}`}></i>
          </button>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] text-[#00f2ff] mb-1">{pro.nom_commercial}</p>
            <h2 className="text-sm tracking-tighter">Étape {step} / 3</h2>
          </div>
          <div className="w-12"></div>
        </div>

        <div className="p-8 md:p-12">
          
          {/* STEP 1 : SERVICES */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-3xl mb-8 tracking-tighter italic font-black uppercase">Sélection_Prestation</h3>
              <div className="space-y-4">
                {pro.services_list && pro.services_list.length > 0 ? (
                  pro.services_list.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setSelectedService(s); setStep(2); }}
                      className="w-full p-8 rounded-[30px] border border-current/10 flex justify-between items-center hover:border-[#bc13fe] hover:bg-[#bc13fe]/5 transition-all group text-left"
                    >
                      <div className="max-w-[70%]">
                        <p className="text-lg group-hover:text-[#bc13fe] transition-colors uppercase font-black italic">{s.titre || s.service}</p>
                        <p className="text-[9px] opacity-40 font-medium normal-case line-clamp-1 italic">{s.desc || "Protocole technique standard."}</p>
                      </div>
                      <p className="text-2xl font-black">{s.price}€</p>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30 italic">
                    <p>Aucun protocole technique configuré.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 : PLANNING */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 flex flex-col items-center">
              <h3 className="text-3xl mb-8 tracking-tighter self-start italic font-black uppercase">Planning_Execution</h3>
              <div className={`p-6 rounded-[40px] border border-current/10 mb-10 w-full flex justify-center ${dark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={fr}
                  disabled={disabledDays}
                  className="font-black italic uppercase"
                />
              </div>
              <div className="w-full">
                <p className="text-[10px] opacity-30 mb-6 tracking-widest text-center">Créneaux_Ouverts</p>
                <div className="grid grid-cols-4 gap-3">
                  {dynamicSlots.map(t => (
                    <button 
                      key={t}
                      onClick={() => { setSelectedTime(t); setStep(3); }}
                      className={`p-4 rounded-2xl text-[11px] border transition-all ${selectedTime === t ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'border-current/10 opacity-60 hover:opacity-100'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 : RÉCAPITULATIF SÉCURISÉ */}
          {step === 3 && (
            <div className="animate-in zoom-in-95 text-center pb-10">
              <div className="w-24 h-24 bg-[#00f2ff]/10 text-[#00f2ff] rounded-full flex items-center justify-center mx-auto mb-10 text-4xl">
                <i className="fas fa-shield-check"></i>
              </div>
              <h3 className="text-4xl mb-4 tracking-tighter leading-none italic font-black uppercase">Paiement_Sécurisé</h3>
              <p className="text-[10px] opacity-40 mb-12 italic">L'argent sera bloqué sur le réseau jusqu'à validation du code</p>
              
              <div className={`p-10 rounded-[50px] text-left mb-12 border border-current/10 ${dark ? 'bg-white/[0.03]' : 'bg-black/[0.03]'}`}>
                <div className="flex justify-between border-b border-current/5 pb-5 mb-5 text-sm">
                    <span className="opacity-30 italic font-black">Studio</span>
                    <span className="italic font-black">{pro.nom_commercial}</span>
                </div>
                <div className="flex justify-between border-b border-current/5 pb-5 mb-5 text-sm">
                    <span className="opacity-30 italic font-black">Service</span>
                    <span className="italic font-black">{selectedService.titre || selectedService.service}</span>
                </div>
                <div className="flex justify-between border-b border-current/5 pb-5 mb-5 text-sm">
                    <span className="opacity-30 italic font-black">Rendez-vous</span>
                    <span className="text-[#00f2ff] italic font-black">{format(selectedDate, 'dd MMMM yyyy', { locale: fr })} @ {selectedTime}</span>
                </div>
                <div className="flex justify-between text-3xl pt-5 font-black italic">
                    <span>Total_Dû</span>
                    <span className="text-[#bc13fe]">{selectedService.price}€</span>
                </div>
              </div>

              <button 
                onClick={handleFinalize} 
                disabled={loading}
                className="w-full bg-[#bc13fe] text-white py-8 rounded-full font-black text-xs tracking-[0.5em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? 'INITIALISATION...' : 'BLOQUER LES FONDS ET RÉSERVER'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}