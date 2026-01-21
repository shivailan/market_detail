import { useCallback, useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { supabase } from '../lib/supabase';

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

  const handleCancel = async (id) => {
    if (!reason) return alert("Veuillez sélectionner une raison.");
    const { data, error } = await supabase.from('appointments').update({ 
      status: 'annulé', cancellation_reason: `Annulé par le client : ${reason}` 
    }).match({ id: id, client_name: session.user.email }).select();
    if (!error && data?.length > 0) {
      setCancellingId(null);
      fetchBookingsByEmail();
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
      
      {/* HEADER SECTION - Responsive Text */}
      <div className="mb-10 md:mb-16 border-b border-current/10 pb-8 md:pb-10">
        <span className="text-[#00f2ff] text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] block mb-2 truncate">ID: {session.user.email}</span>
        <h2 className="text-4xl md:text-8xl tracking-tighter leading-none break-words">MES_MISSIONS.</h2>
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
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl leading-none mb-1 tracking-tighter truncate">{res.profiles_pro?.nom_commercial || "UNITÉ_DETAIL"}</p>
                    <p className="text-[9px] md:text-[10px] opacity-40 lowercase font-medium truncate">{res.profiles_pro?.adresse || "ZONE_ACTIVE"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-8 items-center w-full lg:w-auto">
                  <div className="text-left">
                    <p className="text-[7px] md:text-[8px] opacity-30 mb-1 tracking-widest">PROTOCOLE</p>
                    <p className="text-[10px] md:text-[12px] truncate">{res.service_type || 'STANDARD'}</p>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-[7px] md:text-[8px] opacity-30 mb-1 tracking-widest">SCHEDULE</p>
                    <p className="text-[10px] md:text-[12px] text-[#00f2ff] font-mono whitespace-nowrap">
                      {res.appointment_date}
                    </p>
                  </div>

                  {/* BOUTONS ACTIONS - Full width on mobile */}
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

              {/* CODE DE SÉCURITÉ - Responsive Box */}
              {res.status === 'confirmé' && (
                <div className="p-5 md:p-8 rounded-[25px] md:rounded-[35px] bg-[#bc13fe]/5 border border-[#bc13fe]/20">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#bc13fe] flex items-center justify-center text-white text-[8px]">
                          <i className="fas fa-lock"></i>
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-[#bc13fe]">MISSION_AUTH_CODE</span>
                      </div>
                      <p className="text-[9px] opacity-60 normal-case italic leading-tight">À présenter <span className="text-[#bc13fe] font-black uppercase">uniquement à la fin</span> de la prestation.</p>
                    </div>
                    
                    <div className="px-8 py-4 bg-white text-black rounded-2xl font-mono text-2xl md:text-3xl font-black tracking-[0.3em] border-2 border-[#bc13fe] shadow-lg">
                      {res.validation_code || '------'}
                    </div>
                  </div>
                </div>
              )}

              {/* ANNULATION - Responsive Form */}
              {res.status !== 'annulé' && res.status !== 'refusé' && (
                <div className="border-t border-current/5 pt-4 flex justify-center md:justify-end">
                  {cancellingId === res.id ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <select value={reason} onChange={(e) => setReason(e.target.value)} className={`text-[10px] p-3 rounded-xl border flex-1 ${dark ? 'bg-black border-white/20' : 'bg-white border-black/20'}`}>
                        <option value="">MOTIF_ANNULATION</option>
                        {cancellationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button onClick={() => handleCancel(res.id)} className="bg-red-600 text-white px-5 py-3 rounded-xl text-[9px]">VALIDER</button>
                      <button onClick={() => setCancellingId(null)} className="opacity-40 text-[9px] py-3">RETOUR</button>
                    </div>
                  ) : (
                    <button onClick={() => setCancellingId(res.id)} className="text-[8px] md:text-[9px] opacity-30 hover:opacity-100 hover:text-red-500 transition-all tracking-[0.2em]">
                      <i className="fas fa-ban mr-2"></i>ANNULER_LA_MISSION
                    </button>
                  )}
                </div>
              )}

              {/* AVIS - Responsive form */}
              {res.status === 'terminé' && (
                <div className="p-6 md:p-8 rounded-[30px] border border-[#00f2ff]/20 bg-[#00f2ff]/5">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-[10px] font-black tracking-[0.3em] text-[#00f2ff]">MISSION_COMPLETE_FEEDBACK</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setReviewData({ ...reviewData, rating: star, targetApt: res })}>
                            <i className={`fa-star text-lg ${reviewData.targetApt?.id === res.id && reviewData.rating >= star ? 'fas text-yellow-400' : 'far opacity-20'}`}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      placeholder="Commentaire..." 
                      className={`w-full p-4 rounded-2xl border text-[10px] normal-case italic min-h-[80px] ${dark ? 'bg-black/40 border-white/10' : 'bg-white border-black/10'}`}
                      value={reviewData.targetApt?.id === res.id ? reviewData.comment : ''}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value, targetApt: res })}
                    />
                    <button onClick={submitReview} className="w-full py-4 bg-[#00f2ff] text-black font-black text-[10px] tracking-widest rounded-full">PUBLIER_AVIS</button>
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