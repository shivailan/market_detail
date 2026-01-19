import { useCallback, useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { supabase } from '../lib/supabase';

export default function MesReservations({ session, dark }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  // À ajouter avec vos autres useState
const [reviewData, setReviewData] = useState({ rating: 5, comment: '', targetApt: null });
const [submittingReview, setSubmittingReview] = useState(false);
  
  // NOUVEAUX ÉTATS POUR L'ANNULATION
  const [cancellingId, setCancellingId] = useState(null);
  const [reason, setReason] = useState("");

  const cancellationReasons = [
    "Contretemps personnel",
    "Véhicule indisponible",
    "Météo défavorable",
    "Erreur de créneau",
    "Autre"
  ];

  const fetchBookingsByEmail = useCallback(async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles_pro!appointments_pro_id_fkey (
          id,
          nom_commercial,
          adresse
        )
      `)
      .eq('client_name', session.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Database Error:", error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }, [session]);

  // FONCTION POUR ANNULER LE RDV
const handleCancel = async (id) => {
  if (!reason) return alert("Veuillez sélectionner une raison.");
  
  const { data, error } = await supabase
    .from('appointments')
    .update({ 
      status: 'annulé', 
      cancellation_reason: `Annulé par le client : ${reason}` 
    })
    .match({ id: id, client_name: session.user.email }) // Double vérification
    .select();

  if (error) {
    alert("Erreur : " + error.message);
  } else if (data && data.length > 0) {
    alert("Annulation confirmée !");
    setCancellingId(null);
    fetchBookingsByEmail();
  } else {
    alert("Erreur : Le rendez-vous n'a pas pu être trouvé ou vous n'avez pas le droit de le modifier.");
  }
};

  useEffect(() => {
    fetchBookingsByEmail();

    const channel = supabase
      .channel('user-reservations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments', filter: `client_name=eq.${session.user.email}` }, 
        () => fetchBookingsByEmail()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchBookingsByEmail, session]);

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

  if (error) {
    alert("Erreur lors de l'envoi : " + error.message);
  } else {
    alert("Merci ! Votre avis a été publié.");
    setReviewData({ rating: 5, comment: '', targetApt: null });
    fetchBookingsByEmail(); // Rafraîchir pour masquer le formulaire
  }
  setSubmittingReview(false);
};

  const glass = dark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.02] border-black/10';

  if (loading) return <div className="pt-60 text-center font-black italic animate-pulse tracking-[0.3em]">VÉRIFICATION_DATABASE_EN_COURS...</div>;

  return (
    <div className={`pt-40 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto font-black italic uppercase ${dark ? 'text-white' : 'text-black'}`}>
      
      {/* HEADER SECTION */}
      <div className="mb-16 border-b border-current/10 pb-10">
        <span className="text-[#00f2ff] text-[10px] tracking-[0.5em] block mb-2">AUTH_ID: {session.user.email}</span>
        <h2 className="text-6xl md:text-8xl tracking-tighter leading-none">MES_MISSIONS.</h2>
      </div>

      <div className="space-y-8">
        {bookings.length > 0 ? (
          bookings.map((res) => (
            <div key={res.id} className={`p-8 md:p-10 rounded-[50px] border ${glass} flex flex-col gap-8 hover:border-[#bc13fe]/40 transition-all group`}>
              
              {/* LIGNE PRINCIPALE : INFOS STUDIO & STATUS */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-8 text-left w-full md:w-auto">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    res.status === 'confirmé' ? 'border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 
                    res.status === 'refusé' ? 'border-red-500 text-red-500' : 
                    'border-[#bc13fe] text-[#bc13fe] animate-pulse'
                  }`}>
                    <i className={`fas ${res.status === 'confirmé' ? 'fa-check' : res.status === 'refusé' ? 'fa-times' : 'fa-sync-alt'}`}></i>
                  </div>
                  <div>
                    <p className="text-2xl leading-none mb-1 tracking-tighter">{res.profiles_pro?.nom_commercial || "UNITÉ_DETAIL"}</p>
                    <p className="text-[10px] opacity-40 lowercase font-medium">{res.profiles_pro?.adresse || "ZONE_ACTIVE"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-8 items-center w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-[8px] opacity-30 mb-1 tracking-widest">PROTOCOLE</p>
                    <p className="text-[12px]">{res.service_type || 'STANDARD_CLEAN'}</p>
                  </div>
                  
                  <div className="text-left md:text-right">
                    <p className="text-[8px] opacity-30 mb-1 tracking-widest">SCHEDULE</p>
                    <p className="text-[12px] text-[#00f2ff] font-mono tracking-tighter">
                      {res.appointment_date} @ {res.appointment_time}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveChat({
                        id: res.profiles_pro.id,
                        name: res.profiles_pro.nom_commercial
                      })}
                      className="w-14 h-14 rounded-full border border-current/10 flex items-center justify-center hover:bg-[#bc13fe] hover:text-white hover:border-[#bc13fe] transition-all"
                    >
                      <i className="fas fa-comment-dots text-lg"></i>
                    </button>
                    
                    <div className={`px-8 py-4 rounded-full text-[10px] font-black border-2 flex items-center justify-center ${
                      res.status === 'confirmé' ? 'bg-green-500 text-white border-green-500' : 
                      res.status === 'refusé' ? 'bg-red-500 text-white border-red-500' : 
                      'border-[#bc13fe] text-[#bc13fe]'
                    }`}>
                      {res.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION D'ANNULATION */}
              {res.status !== 'annulé' && res.status !== 'refusé' && (
                <div className="border-t border-current/5 pt-6 flex justify-end">
                  {cancellingId === res.id ? (
                    <div className="flex flex-col md:flex-row gap-4 items-center animate-in slide-in-from-right-4">
                      <select 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={`text-[10px] p-3 rounded-xl border ${dark ? 'bg-black border-white/20' : 'bg-white border-black/20'}`}
                      >
                        <option value="">CHOISIR_UN_MOTIF</option>
                        {cancellationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => handleCancel(res.id)} className="bg-red-600 text-white px-6 py-3 rounded-xl text-[9px]">CONFIRMER_ANNULATION</button>
                        <button onClick={() => setCancellingId(null)} className="opacity-40 text-[9px]">RETOUR</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setCancellingId(res.id)}
                      className="text-[9px] opacity-30 hover:opacity-100 hover:text-red-500 transition-all font-bold tracking-widest"
                    >
                      <i className="fas fa-ban mr-2"></i>ANNULER_LA_MISSION
                    </button>
                  )}
                </div>
              )}

              {/* SECTION AVIS (S'affiche si la mission est terminée) */}
{res.status === 'terminé' && (
  <div className="mt-4 p-8 rounded-[35px] border border-[#00f2ff]/20 bg-[#00f2ff]/5 animate-in zoom-in-95 duration-500">
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] text-[#00f2ff] mb-2">MISSION_ACCOMPLIE</p>
          <h4 className="text-lg italic font-black uppercase">Notez votre expérience</h4>
        </div>
        {/* Système d'étoiles */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => setReviewData({ ...reviewData, rating: star, targetApt: res })}
              className="transition-transform hover:scale-125"
            >
              <i className={`fa-star text-xl ${reviewData.targetApt?.id === res.id && reviewData.rating >= star ? 'fas text-yellow-400' : 'far opacity-30'}`}></i>
            </button>
          ))}
        </div>
      </div>

      <textarea 
        placeholder="Décrivez la qualité du polissage, l'accueil, la propreté..."
        className={`w-full p-6 rounded-[25px] border text-[11px] normal-case italic min-h-[100px] outline-none transition-all ${dark ? 'bg-black/40 border-white/10 focus:border-[#00f2ff]' : 'bg-white border-black/10 focus:border-[#00f2ff]'}`}
        value={reviewData.targetApt?.id === res.id ? reviewData.comment : ''}
        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value, targetApt: res })}
      />

      <button 
        onClick={submitReview}
        disabled={submittingReview}
        className="w-full py-5 rounded-full bg-[#00f2ff] text-black font-black text-[10px] tracking-[0.5em] hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
      >
        {submittingReview ? 'TRANSMISSION...' : 'PUBLIER_AVIS'}
      </button>
    </div>
  </div>
)}

              {/* SECTION CODE DE SÉCURITÉ (Uniquement si confirmé) */}
              {res.status === 'confirmé' && (
                <div className="mt-2 p-8 rounded-[35px] bg-[#bc13fe]/5 border border-[#bc13fe]/20 animate-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 rounded-full bg-[#bc13fe] flex items-center justify-center text-white text-[10px]">
                          <i className="fas fa-lock"></i>
                        </div>
                        <span className="text-[10px] font-black tracking-[0.3em] text-[#bc13fe]">
                          CODE_D'AUTHENTICATION_DE_MISSION
                        </span>
                      </div>
                      <p className="text-[9px] opacity-60 normal-case italic leading-relaxed max-w-md">
                        Présentez ce code au professionnel <span className="text-[#bc13fe] font-black uppercase">uniquement à la fin</span> de la prestation pour valider le travail et libérer les fonds.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="px-10 py-5 bg-white text-black rounded-3xl font-mono text-3xl font-black tracking-[0.4em] shadow-[0_10px_30px_rgba(188,19,254,0.3)] border-2 border-[#bc13fe]">
                        {res.validation_code || '------'}
                      </div>
                      <span className="mt-3 text-[7px] opacity-40 tracking-[0.5em]">TICKET_ID: #{res.id.slice(0,8)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-40 text-center opacity-10 border-2 border-dashed border-current/20 rounded-[60px]">
            <p className="text-4xl font-black italic">AUCUNE_DONNÉE_TROUVÉE</p>
            <p className="text-[10px] mt-4 tracking-[0.5em]">COMMENCEZ_L'AVENTURE_MAINTENANT.</p>
          </div>
        )}
      </div>

      {/* Rendu de la ChatBox si un chat est actif */}
      {activeChat && (
        <ChatBox 
          receiverId={activeChat.id}
          receiverName={activeChat.name}
          senderId={session.user.id}
          onClose={() => setActiveChat(null)}
          dark={dark}
        />
      )}
    </div>
  );
}