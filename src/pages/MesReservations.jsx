import { useCallback, useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { supabase } from '../lib/supabase';

export default function MesReservations({ session, dark }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

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