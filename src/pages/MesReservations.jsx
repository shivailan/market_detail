import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MesReservations({ session, dark }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`*, profiles_pro ( nom_commercial, adresse )`)
      .eq('client_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error) setBookings(data || []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchBookings();
    
    // Temps réel : si le pro valide, ça se met à jour ici
    const channel = supabase.channel('status_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, () => fetchBookings())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchBookings]);

  const glass = dark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.03] border-black/10';

  if (loading) return <div className="pt-40 text-center font-black italic">SYNC_DATABASE...</div>;

  return (
    <div className={`pt-40 pb-20 px-6 max-w-5xl mx-auto italic font-black uppercase ${dark ? 'text-white' : 'text-black'}`}>
      <h2 className="text-5xl mb-12 tracking-tighter">Mes_Missions</h2>
      
      <div className="space-y-4">
        {bookings.length > 0 ? bookings.map((res) => (
          <div key={res.id} className={`p-8 rounded-[35px] border ${glass} flex justify-between items-center`}>
            <div>
              <p className="text-xl leading-none mb-1">{res.profiles_pro?.nom_commercial}</p>
              <p className="text-[9px] opacity-40">{res.service_type} — {res.appointment_date} @ {res.appointment_time}</p>
            </div>
            <div className={`px-6 py-2 rounded-full text-[9px] border-2 ${
              res.status === 'confirmé' ? 'bg-green-500 border-green-500 text-white' : 
              res.status === 'refusé' ? 'bg-red-500 border-red-500 text-white' : 'border-[#00f2ff] text-[#00f2ff]'
            }`}>
              {res.status}
            </div>
          </div>
        )) : (
          <div className="py-20 text-center opacity-20">Aucune mission trouvée.</div>
        )}
      </div>
    </div>
  );
}