import { useCallback, useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { supabase } from '../lib/supabase';

// --- LOGIQUE DE CALCUL DES REMBOURSEMENTS ---
const calculateCancellationTerms = (appointmentDate, appointmentTime, price) => {
  const now = new Date();
  // On crée une date robuste pour la comparaison
  const appointment = new Date(`${appointmentDate}T${appointmentTime}`);
  const diffInHours = (appointment - now) / (1000 * 60 * 60);

  if (diffInHours >= 48) {
    return { 
      refund: 100, 
      payoutPro: 0, 
      color: 'text-green-500', 
      label: 'Anticipée', 
      desc: 'Remboursement intégral (100%).' 
    };
  } else if (diffInHours >= 24) {
    return { 
      refund: 70, 
      payoutPro: 30, 
      color: 'text-orange-500', 
      label: 'Tardive', 
      desc: 'Remboursement partiel (70%). Frais de dédommagement pro (30%).' 
    };
  } else {
    return { 
      refund: 0, 
      payoutPro: 100, 
      color: 'text-red-500', 
      label: 'Dernière minute', 
      desc: 'Aucun remboursement (0%). Le professionnel est payé intégralement.' 
    };
  }
};

export default function MesReservations({ session, dark }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '', targetApt: null });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [reason, setReason] = useState("");

  const cancellationReasons = ["Contretemps personnel", "Véhicule indisponible", "Météo défavorable", "Erreur de créneau", "Autre"];

  const fetchBookingsByEmail = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`*, profiles_pro!appointments_pro_id_fkey (id, nom_commercial, adresse)`)
      .eq('client_name', session.user.email)
      .order('created_at', { ascending: false });
    if (!error) setBookings(data || []);
    setLoading(false);
  }, [session]);

  const handleCancel = async (booking) => {
    if (!reason) return alert("Veuillez sélectionner une raison.");
    
    // Calcul des montants selon les règles
    const terms = calculateCancellationTerms(booking.appointment_date, booking.appointment_time, booking.total_price);
    const refundAmount = (booking.total_price * terms.refund) / 100;
    const payoutAmount = (booking.total_price * terms.payoutPro) / 100;

    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'annulé', 
        cancellation_reason: `Client [${terms.label}] : ${reason}`,
        refund_amount: refundAmount,
        payout_amount: payoutAmount,
        cancelled_at: new Date().toISOString()
      })
      .match({ id: booking.id, client_name: session.user.email });

    if (!error) {
      alert(`ANNULATION_CONFIRMÉE. REMBOURSEMENT : ${refundAmount}€`);
      setCancellingId(null);
      setReason("");
      fetchBookingsByEmail();
    } else {
      alert("ERREUR_SYSTÈME : " + error.message);
    }
  };

  useEffect(() => {
    fetchBookingsByEmail();
  }, [fetchBookingsByEmail]);

  const submitReview = async () => {
    if (!reviewData.comment.trim()) return alert("Veuillez écrire un commentaire.");
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert([{
      pro_id: reviewData.targetApt.pro_id,
      client_name: session.user.email,
      rating: reviewData.rating,
      comment: reviewData.comment,
      appointment_id: reviewData.targetApt.id
    }]);
    if (!error) {
      setReviewData({ rating: 5, comment: '', targetApt: null });
      fetchBookingsByEmail();
    }
    setSubmittingReview(false);
  };

  const glass = dark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.02] border-black/10';

  if (loading) return <div className="pt-60 text-center font-black italic animate-pulse tracking-[0.3em]">VÉRIFICATION_DATABASE...</div>;

  return (
    <div className={`pt-32 md:pt-40 pb-20 px-4 md:px-12 max-w-[1200px] mx-auto font-black italic uppercase transition-all ${dark ? 'text-white' : 'text-black'}`}>
      
      {/* HEADER SECTION */}
      <div className="mb-10 md:mb-16 border-b border-current/10 pb-8 md:pb-10">
        <span className="text-[#00f2ff] text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] block mb-2 truncate">ID: {session.user.email}</span>
        <h2 className="text-4xl md:text-8xl tracking-tighter leading-none break-words italic font-black">MES_MISSIONS.</h2>
      </div>

      <div className="space-y-6 md:space-y-8">
        {bookings.length > 0 ? (
          bookings.map((res) => (
            <div key={res.id} className={`p-6 md:p-10 rounded-[30px] md:rounded-[50px] border ${glass} flex flex-col gap-6 md:gap-8 transition-all hover:border-[#bc13fe]/40 overflow-hidden`}>
              
              {/* LIGNE PRINCIPALE : INFO & STATUS */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-10">
                <div className="flex items-center gap-4 md:gap-8 text-left w-full lg:w-auto">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex shrink-0 items-center justify-center border-2 ${
                    res.status === 'confirmé' ? 'border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 
                    res.status === 'refusé' ? 'border-red-500 text-red-500' : 'border-[#bc13fe] text-[#bc13fe]'
                  }`}>
                    <i className={`fas ${res.status === 'confirmé' ? 'fa-check' : res.status === 'refusé' ? 'fa-times' : 'fa-sync-alt'}`}></i>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xl md:text-2xl leading-none mb-1 tracking-tighter truncate italic uppercase font-black">{res.profiles_pro?.nom_commercial || "UNITÉ_DETAIL"}</p>
                    <p className="text-[9px] md:text-[10px] opacity-40 lowercase font-medium truncate">{res.profiles_pro?.adresse || "ZONE_ACTIVE"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-8 items-center w-full lg:w-auto">
                  <div className="text-left">
                    <p className="text-[7px] md:text-[8px] opacity-30 mb-1 tracking-widest uppercase">PROTOCOLE</p>
                    <p className="text-[10px] md:text-[12px] truncate">{res.service_selected || 'STANDARD'}</p>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-[7px] md:text-[8px] opacity-30 mb-1 tracking-widest uppercase">MONTANT</p>
                    <p className="text-[10px] md:text-[12px] text-[#bc13fe] font-black">{res.total_price}€</p>
                  </div>

                  <div className="text-left">
                    <p className="text-[7px] md:text-[8px] opacity-30 mb-1 tracking-widest uppercase">SCHEDULE</p>
                    <p className="text-[10px] md:text-[12px] text-[#00f2ff] font-mono whitespace-nowrap">
                      {res.appointment_date} @ {res.appointment_time?.substring(0, 5)}
                    </p>
                  </div>

                  <div className="col-span-2 flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <button 
                      onClick={() => setActiveChat({ id: res.profiles_pro.id, name: res.profiles_pro.nom_commercial })}
                      className="flex-1 md:flex-none md:w-14 h-12 md:h-14 rounded-full border border-current/10 flex items-center justify-center hover:bg-[#bc13fe] hover:text-white transition-all"
                    >
                      <i className="fas fa-comment-dots text-lg"></i>
                    </button>
                    
                    <div className={`flex-2 md:flex-none px-6 md:px-8 h-12 md:h-14 rounded-full text-[9px] md:text-[10px] font-black border-2 flex items-center justify-center grow ${
                      res.status === 'confirmé' ? 'bg-green-500 text-white border-green-500' : 
                      res.status === 'refusé' ? 'bg-red-500 text-white border-red-500' : 'border-[#bc13fe] text-[#bc13fe]'
                    }`}>
                      {res.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* CODE DE SÉCURITÉ */}
              {res.status === 'confirmé' && (
                <div className="p-5 md:p-8 rounded-[25px] md:rounded-[35px] bg-[#00f2ff]/5 border border-[#00f2ff]/20 animate-in fade-in zoom-in duration-500">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#00f2ff] flex items-center justify-center text-black text-[8px]">
                          <i className="fas fa-shield-check"></i>
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-[#00f2ff]">PAIEMENT_SÉCURISÉ_SÉQUESTRE</span>
                      </div>
                      <p className="text-[9px] opacity-60 normal-case italic leading-tight">
                        Fonds bloqués. Présentez ce code au Pro <span className="text-[#00f2ff] font-black uppercase underline">seulement après</span> inspection du véhicule terminé.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                        <div className="px-8 py-4 bg-white text-black rounded-2xl font-mono text-2xl md:text-4xl font-black tracking-[0.3em] border-2 border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.2)]">
                        {res.payment_status === 'released' ? 'CHECK' : (res.validation_code || '------')}
                        </div>
                        <span className="text-[7px] opacity-40 uppercase tracking-widest">STATUT_PAIEMENT : {res.payment_status?.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LOGIQUE D'ANNULATION DYNAMIQUE */}
              {res.status !== 'annulé' && res.status !== 'refusé' && (
                <div className="border-t border-current/5 pt-6 mt-2">
                  {cancellingId === res.id ? (
                    <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-2">
                      {/* BANDEAU PRÉVENTIF */}
                      <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-left`}>
                        {(() => {
                          const terms = calculateCancellationTerms(res.appointment_date, res.appointment_time, res.total_price);
                          return (
                            <>
                              <p className={`text-[10px] font-black italic mb-1 ${terms.color}`}>
                                PROTOCOLE ANNULATION : {terms.label.toUpperCase()}
                              </p>
                              <p className="text-[9px] opacity-60 leading-tight">
                                {terms.desc} Retour financier estimé : <span className="text-white font-black">{(res.total_price * terms.refund / 100).toFixed(2)}€</span>
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <select 
                          value={reason} 
                          onChange={(e) => setReason(e.target.value)} 
                          className={`text-[10px] p-4 rounded-xl border flex-1 font-black outline-none ${dark ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'}`}
                        >
                          <option value="">MOTIF_ANNULATION</option>
                          {cancellationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button 
                          onClick={() => handleCancel(res)} 
                          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-[9px] font-black transition-all"
                        >
                          VALIDER_ANNULATION
                        </button>
                        <button 
                          onClick={() => setCancellingId(null)} 
                          className="opacity-40 hover:opacity-100 text-[9px] py-4 font-black uppercase tracking-widest"
                        >
                          Garder_RDV
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center md:justify-end">
                      <button 
                        onClick={() => { setCancellingId(res.id); setReason(""); }} 
                        className="text-[8px] md:text-[9px] opacity-30 hover:opacity-100 hover:text-red-500 transition-all tracking-[0.2em] font-black"
                      >
                        <i className="fas fa-ban mr-2"></i>ANNULER_LA_MISSION
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AVIS TECHNIQUE */}
              {res.payment_status === 'released' && (
                <div className="p-6 md:p-8 rounded-[30px] border border-[#bc13fe]/20 bg-[#bc13fe]/5">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-[10px] font-black tracking-[0.3em] text-[#bc13fe]">MISSION_TERMINÉE : NOTER L'UNITÉ</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setReviewData({ ...reviewData, rating: star, targetApt: res })}>
                            <i className={`fa-star text-lg ${reviewData.targetApt?.id === res.id && reviewData.rating >= star ? 'fas text-yellow-400' : 'far opacity-20'}`}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      placeholder="Commentaire sur la qualité du detailing..." 
                      className={`w-full p-4 rounded-2xl border text-[10px] normal-case italic min-h-[80px] font-black ${dark ? 'bg-black/40 border-white/10' : 'bg-white border-black/10'}`}
                      value={reviewData.targetApt?.id === res.id ? reviewData.comment : ''}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value, targetApt: res })}
                    />
                    <button onClick={submitReview} className="w-full py-4 bg-[#bc13fe] text-white font-black text-[10px] tracking-widest rounded-full shadow-lg">PUBLIER_AVIS_TECHNIQUE</button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 md:py-40 text-center opacity-10 border-2 border-dashed border-current/20 rounded-[40px] md:rounded-[60px]">
            <p className="text-2xl md:text-4xl font-black italic">NO_MISSIONS_FOUND</p>
          </div>
        )}
      </div>

      {activeChat && (
        <ChatBox receiverId={activeChat.id} receiverName={activeChat.name} senderId={session.user.id} onClose={() => setActiveChat(null)} dark={dark} />
      )}
    </div>
  );
}