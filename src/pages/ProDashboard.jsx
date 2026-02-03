import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  getDaysInMonth,
  isSameDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCallback, useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import MessagingCenter from '../components/MessagingCenter';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../utils/storage';

const statusColors = {
  'en attente': 'border-[#bc13fe] text-[#bc13fe]',
  'confirmé': 'border-[#00f2ff] text-[#00f2ff]',
  'terminé': 'border-green-500 text-green-500',
  'refusé': 'border-red-500 text-red-500',
  'annulé': 'border-red-500 text-red-500'
};

export default function ProDashboard({ session, dark }) {
    const [profile, setProfile] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [statusFilter, setStatusFilter] = useState('tous');
  const [statsView, setStatsView] = useState('week'); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [conversations, setConversations] = useState([]);
  const [viewMode, setViewMode] = useState('workWeek'); // 'workWeek' ou 'day'
  const hours = Array.from({ length: 24 }, (_, i) => (i).toString().padStart(2, '0') + ':00');

  const profileUrl = `${window.location.origin}/pro/${profile?.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    alert("Lien copié ! Collez-le sur votre fiche Google Maps.");
  };

  const handleGoToStripe = async () => {
    if (!profile?.stripe_connect_id) {
      alert("Votre compte Stripe n'est pas encore configuré.");
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/create-portal-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeConnectId: profile.stripe_connect_id }),
      });
      const data = await response.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) { console.error("Erreur Stripe Portal:", err); }
  };

  const handleConnectStripe = async () => {
    const response = await fetch('http://localhost:3000/create-connect-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, email: session.user.email }),
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  };

  const getActivityData = () => {
    let days = [];
    let formatLabel = 'EEE';
    if (statsView === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      days = Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
    } else if (statsView === 'month') {
      const start = startOfMonth(currentDate);
      days = Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
      formatLabel = 'dd';
    } else {
      const start = startOfYear(currentDate);
      days = Array.from({ length: 12 }, (_, i) => format(addMonths(start, i), 'yyyy-MM'));
      formatLabel = 'MMM';
    }

    return days.map(dateStr => {
      const dailyTotal = appointments
        .filter(a => {
          const apptDate = a.appointment_date?.split('T')[0];
          return statsView === 'year' ? apptDate?.startsWith(dateStr) : apptDate === dateStr;
        })
        .reduce((sum, a) => {
          const multiplier = profile?.subscription_type === 'monthly' ? 1 : 0.85;
          return sum + (Number(a.total_price || 0) * multiplier);
        }, 0);
      const limit = statsView === 'year' ? 5000 : (statsView === 'month' ? 1500 : 500);
      const height = dailyTotal > 0 ? Math.max((dailyTotal / limit) * 100, 10) : 0;
      return { label: format(new Date(dateStr), formatLabel, { locale: fr }), value: dailyTotal.toFixed(0), height };
    });
  };

  const activityData = getActivityData();

  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, sender_name, receiver_name, content, created_at')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const contactMap = new Map();
      const uniqueContacts = [];
      data.forEach(msg => {
        const contactId = msg.sender_id === session.user.id ? msg.receiver_id : msg.sender_id;
        const contactName = msg.sender_id === session.user.id ? msg.receiver_name : msg.sender_name;
        if (contactId && !contactMap.has(contactId)) {
          contactMap.set(contactId, true);
          uniqueContacts.push({ id: contactId, name: (contactName || "CLIENT_UNIT").toUpperCase(), lastMsg: msg.content, time: msg.created_at });
        }
      });
      setConversations(uniqueContacts);
    }
  }, [session?.user?.id]);

  const stats = {
    totalRevenue: appointments.filter(a => a.status === 'terminé').reduce((sum, a) => sum + (Number(a.total_price || 0) * (profile?.subscription_type === 'monthly' ? 1 : 0.85)), 0).toFixed(2),
    pendingMissions: appointments.filter(a => a.status === 'en attente').length,
    activeMissions: appointments.filter(a => a.status === 'confirmé').length,
    escrowAmount: appointments.filter(a => (a.payment_status === 'escrow' || a.payment_status === 'payé') && a.status !== 'terminé').reduce((sum, a) => sum + (Number(a.total_price || 0) * (profile?.subscription_type === 'monthly' ? 1 : 0.85)), 0).toFixed(2),
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: prof } = await supabase.from('profiles_pro').select('*').eq('id', session.user.id).maybeSingle();
    if (prof) setProfile(prof); else setIsConfiguring(true);
    const { data: apps } = await supabase.from('appointments').select('*').eq('pro_id', session.user.id).order('appointment_date', { ascending: false });
    setAppointments(apps || []);
    await fetchConversations();
    setLoading(false);
  }, [session.user.id, fetchConversations]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (appId, newStatus) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', appId);
    if (!error) fetchData();
  };

  const glass = dark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.03] border-black/10';

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-[#bc13fe] animate-pulse uppercase tracking-[0.5em]">Sync_Command_Center...</div>;

  return (
    <div className={`min-h-screen pt-28 md:pt-36 pb-20 px-4 md:px-10 transition-all ${dark ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'} font-black italic uppercase text-left`}>
      
      {isConfiguring ? (
        <ProCMS supabase={supabase} profile={profile} session={session} dark={dark} onComplete={() => { setIsConfiguring(false); fetchData(); }} />
      ) : (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
          
          {/* BANDEAU STRIPE ALERTE */}
          {!profile?.stripe_onboarding_complete && (
            <div className="bg-[#bc13fe] p-4 rounded-2xl mb-6 flex justify-between items-center animate-pulse">
              <p className="text-[10px] font-black italic">⚠️ ACTION REQUISE : ACTIVEZ VOS PAIEMENTS POUR RECEVOIR VOS RÉMUNÉRATIONS</p>
              <button onClick={handleConnectStripe} className="bg-white text-black px-6 py-2 rounded-full text-[9px] font-black">CONFIGURER MON RIB</button>
            </div>
          )}

          {/* HEADER & DASHBOARD BUTTON */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[25px] overflow-hidden border-2 border-[#bc13fe]">
                <img src={profile?.cover_url || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Pro" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl tracking-tighter leading-none italic font-black uppercase">{profile?.nom_commercial || "MON_STUDIO"}</h1>
                <p className="text-[10px] text-[#bc13fe] tracking-[0.3em] mt-2 italic font-black">Status: OPÉRATIONNEL</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              {/* BOUTON STRIPE EXPRESS */}
              <button onClick={handleGoToStripe} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black tracking-widest hover:bg-blue-700 transition-all shadow-lg">
                DASHBOARD_STRIPE <i className="fas fa-external-link-alt ml-2"></i>
              </button>

              <div className={`flex p-1 rounded-2xl border ${glass} backdrop-blur-xl`}>
                {['overview', 'agenda', 'missions', 'messages'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl text-[9px] tracking-widest transition-all italic font-black ${activeTab === tab ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>
                    {tab.toUpperCase()}
                  </button>
                ))}
                <button onClick={() => setIsConfiguring(true)} className="px-6 py-3 text-[9px] opacity-40 hover:opacity-100 transition-all"><i className="fas fa-cog"></i></button>
              </div>
            </div>
          </div>

          {/* PUBLIC URL BAR (REMise) */}
          <div className={`p-6 rounded-[30px] border ${glass} border-[#bc13fe]/30 bg-[#bc13fe]/5 mb-8`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-left">
                <p className="text-[10px] font-black tracking-widest text-[#bc13fe] mb-1 uppercase">VOTRE_VITRINE_PUBLIQUE (Google Maps)</p>
                <p className="text-xs font-mono opacity-60 truncate max-w-[300px] md:max-w-none lowercase italic">{profileUrl}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={copyToClipboard} className="flex-1 md:flex-none px-6 py-3 bg-[#bc13fe] text-white rounded-xl text-[10px] font-black italic transition-all active:scale-95 uppercase">COPIER_LE_LIEN</button>
                <a href={profileUrl} target="_blank" className="flex-1 md:flex-none px-6 py-3 border border-[#bc13fe] text-[#bc13fe] rounded-xl text-[10px] font-black italic text-center hover:bg-[#bc13fe] hover:text-white transition-all uppercase">VOIR_MA_PAGE</a>
              </div>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-6">
              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard title="CA NETS TERMINÉS" value={`${stats.totalRevenue}€`} icon="fa-wallet" color="#00f2ff" glass={glass} />
                  <StatCard title="FONDS EN SÉQUESTRE" value={`${stats.escrowAmount}€`} icon="fa-lock" color="#bc13fe" glass={glass} />
                  <StatCard title="MISSIONS ACTIVES" value={stats.activeMissions} icon="fa-car" color="#fff" glass={glass} />
                </div>

                {/* GRAPH SECTION */}
                <div className={`p-8 rounded-[40px] border ${glass} min-h-[400px] flex flex-col justify-between`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] tracking-widest opacity-50 font-black">PERFORMANCE</p>
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                          {['week', 'month', 'year'].map((v) => (
                            <button key={v} onClick={() => setStatsView(v)} className={`px-3 py-1 text-[7px] font-black rounded-md transition-all ${statsView === v ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>{v.toUpperCase()}</button>
                          ))}
                        </div>
                      </div>
                      <h4 className="text-[10px] font-black text-[#00f2ff] mt-2 italic uppercase">
                        {statsView === 'week' && `DU ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd')} AU ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), 'dd MMMM yyyy', { locale: fr })}`}
                        {statsView === 'month' && format(currentDate, 'MMMM yyyy', { locale: fr })}
                        {statsView === 'year' && `ANNÉE ${format(currentDate, 'yyyy')}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[7px] opacity-40 font-black">TOTAL_NET</p>
                        <p className="text-sm font-black text-[#bc13fe]">
                          {activityData.reduce((sum, d) => sum + Number(d.value), 0).toLocaleString()}€
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { if(statsView === 'week') setCurrentDate(subWeeks(currentDate, 1)); else if(statsView === 'month') setCurrentDate(subMonths(currentDate, 1)); else setCurrentDate(subYears(currentDate, 1)); }} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#bc13fe] transition-all text-[10px]"><i className="fas fa-chevron-left"></i></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 rounded-full border border-white/10 text-[7px] font-black hover:bg-white hover:text-black transition-all">NOW</button>
                        <button onClick={() => { if(statsView === 'week') setCurrentDate(addWeeks(currentDate, 1)); else if(statsView === 'month') setCurrentDate(addMonths(currentDate, 1)); else setCurrentDate(addYears(currentDate, 1)); }} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#bc13fe] transition-all text-[10px]"><i className="fas fa-chevron-right"></i></button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between h-48 gap-1 md:gap-3 mt-8 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
                    {activityData.map((day, i) => (
                      <div key={i} className="flex-1 min-w-[15px] flex flex-col items-center justify-end h-full group">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#bc13fe] text-white text-[7px] py-1 px-2 rounded-md mb-2 font-black shadow-xl whitespace-nowrap z-10">{day.value} €</div>
                        <div style={{ height: `${day.height}%`, minHeight: Number(day.value) > 0 ? '4px' : '0px' }} className={`w-full max-w-[30px] rounded-t-lg transition-all duration-700 shadow-[0_0_15px_rgba(188,19,254,0.3)] ${Number(day.value) > 0 ? 'bg-[#bc13fe] bg-gradient-to-t from-[#bc13fe] to-[#00f2ff]' : 'bg-white/5'}`} />
                        <span className={`font-black opacity-30 mt-3 ${statsView === 'month' ? 'text-[5px]' : 'text-[8px]'}`}>{day.label.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIDEBAR OVERVIEW */}
              <div className="lg:col-span-4 space-y-6">
                <div className={`p-8 rounded-[40px] border ${glass} border-[#00f2ff]/20 bg-[#00f2ff]/5`}>
                  <h3 className="text-sm mb-6 flex items-center gap-3 font-black italic uppercase"><i className="fas fa-bolt text-[#00f2ff]"></i> ACTIONS_REQUISES</h3>
                  {appointments.filter(a => a.status === 'en attente').map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-black/20 p-4 rounded-2xl mb-2 border border-white/5 transition-all hover:bg-black/40">
                      <p className="text-[9px] font-black italic uppercase">{a.client_name?.split('@')[0]}</p>
                      <button onClick={() => setActiveTab('missions')} className="text-[8px] text-[#00f2ff] underline font-black">VOIR</button>
                    </div>
                  ))}
                </div>

                <div className={`p-8 rounded-[40px] border ${glass}`}>
                  <h3 className="text-sm mb-6 flex items-center gap-3 font-black italic uppercase"><i className="fas fa-comments text-[#bc13fe]"></i> DERNIERS_CHATS</h3>
                  <div className="space-y-4">
                    {conversations.slice(0, 4).map(conv => (
                      <button key={conv.id} onClick={() => setActiveTab('messages')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left">
                        <div className="w-10 h-10 rounded-full bg-[#bc13fe]/20 flex items-center justify-center text-[10px] font-black text-[#bc13fe]">{conv.name[0]}</div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center"><p className="text-[10px] font-black truncate uppercase">{conv.name}</p><span className="text-[6px] opacity-30">{format(new Date(conv.time), 'HH:mm')}</span></div>
                           <p className="text-[8px] opacity-50 truncate normal-case italic mt-1">{conv.lastMsg}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
               <MessagingCenter session={session} dark={dark} />
            </div>
          )}

{activeTab === 'agenda' && (
  <div className={`p-8 rounded-[50px] border ${glass} backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500`}>
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        {/* SWITCH VUE JOUR/SEMAINE */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
          <button onClick={() => setViewMode('day')} className={`px-4 py-2 rounded-lg text-[8px] font-black transition-all ${viewMode === 'day' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>JOUR</button>
          <button onClick={() => setViewMode('workWeek')} className={`px-4 py-2 rounded-lg text-[8px] font-black transition-all ${viewMode === 'workWeek' ? 'bg-[#bc13fe] text-white shadow-lg' : 'opacity-40'}`}>SEMAINE</button>
        </div>
        
        {/* NAVIGATION DATE */}
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#bc13fe] transition-all text-xs">←</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 h-10 rounded-full border border-white/10 text-[8px] font-black hover:bg-white hover:text-black transition-all uppercase">Aujourd'hui</button>
          <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#bc13fe] transition-all text-xs">→</button>
        </div>
      </div>
      <p className="text-xl font-black italic uppercase tracking-tighter text-[#bc13fe]">{format(currentDate, 'MMMM yyyy', { locale: fr })}</p>
    </div>

    <div className="overflow-x-auto custom-scrollbar">
      {/* C'EST ICI QUE hours DOIT ÊTRE PASSÉ */}
      <AgendaTable 
        displayedDays={getDisplayedDays(currentDate, viewMode)} 
        hours={hours} 
        appointments={appointments} 
        dark={dark} 
        glass={glass} 
        setActiveChat={setActiveChat} 
        viewMode={viewMode}
      />
    </div>
  </div>
)}
          {activeTab === 'missions' && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
               <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
                  {['tous', 'en attente', 'confirmé', 'terminé', 'refusé'].map(f => (
                    <button key={f} onClick={() => setStatusFilter(f)} className={`px-8 py-3 rounded-full text-[9px] border transition-all font-black italic uppercase ${statusFilter === f ? 'bg-white text-black' : 'border-white/10 opacity-40 hover:opacity-100'}`}>{f}</button>
                  ))}
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {appointments.filter(a => statusFilter === 'tous' || a.status === statusFilter).map(app => (
                    <MissionCard key={app.id} app={app} dark={dark} glass={glass} updateStatus={updateStatus} setActiveTab={setActiveTab} fetchData={fetchData} />
                  ))}
               </div>
            </div>
          )}
        </div>
      )}

      {/* CHATBOX FALLBACK (Pop-up) */}
      {activeChat && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="relative w-full max-w-lg h-[600px] shadow-2xl animate-in zoom-in-95 duration-300">
             <ChatBox receiverId={activeChat.id} receiverName={activeChat.name} senderId={session.user.id} onClose={() => setActiveChat(null)} dark={dark} />
           </div>
        </div>
      )}
    </div>
  );
}



// ... SOUS-COMPOSANTS (StatCard, AgendaTable, MissionCard, etc.) ...
// Garde les sous-composants que tu as déjà (ou recopie-les si besoin)

// --- SOUS-COMPOSANTS ---

function StatCard({ title, value, icon, color, glass }) {
  return (
    <div className={`p-8 rounded-[40px] border ${glass} group hover:border-white/20 transition-all text-left`}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black transition-transform group-hover:scale-110" style={{ backgroundColor: color }}>
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
      <p className="text-[9px] opacity-40 mb-1 tracking-widest font-black italic uppercase">{title}</p>
      <p className="text-3xl font-black italic">{value}</p>
    </div>
  );
}

function AgendaTable({ displayedDays, hours, appointments, dark, glass, setActiveChat, viewMode }) {  // 1. Définir le filtre d'heures AVANT le rendu pour éviter les répétitions
  // On affiche de 07:00 à 21:00 pour couvrir une large journée de detailing
const filteredHours = hours.filter(h => {
    const hourInt = parseInt(h.split(':')[0]);
    return hourInt >= 7 && hourInt <= 21; 
  });

  return (
    <table className="w-full border-collapse min-w-[600px]">
      <thead>
        <tr>
          <th className="p-4 text-[8px] opacity-30 border-b border-white/5 font-black italic text-center">TIME</th>
          {displayedDays.map(day => (
            <th key={day.toString()} className={`p-4 border-b border-white/5 font-black italic ${isSameDay(day, new Date()) ? 'text-[#00f2ff]' : ''}`}>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest">{format(day, 'EEE', { locale: fr })}</span>
                <span className="text-lg leading-none mt-1">{format(day, 'dd')}</span>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* 2. Utiliser filteredHours pour générer les lignes */}
        {filteredHours.map(hour => (
          <tr key={hour} className="h-20 group">
            <td className="text-center text-[9px] opacity-20 group-hover:opacity-100 border-b border-white/5 font-black italic border-r border-white/5 px-4">
              {hour}
            </td>
            {displayedDays.map(day => {
              // 3. Recherche du rendez-vous
              const rdv = appointments.find(a => 
                a.appointment_date === format(day, 'yyyy-MM-dd') && 
                a.appointment_time.startsWith(hour.split(':')[0]) && 
                (a.status === 'confirmé' || a.status === 'terminé')
              );

              return (
                <td key={day.toString()} className="border-b border-white/5 border-l border-white/5 relative hover:bg-[#bc13fe]/5 transition-colors p-1">
                  {rdv && (
                    <div 
                      onClick={() => setActiveChat({id: rdv.client_id, name: rdv.client_name})} 
                      className="absolute inset-1 bg-[#bc13fe] text-white p-3 rounded-2xl text-[8px] cursor-pointer hover:scale-[0.98] active:scale-95 transition-all shadow-lg overflow-hidden font-black italic flex flex-col justify-center border border-white/20 animate-in fade-in zoom-in duration-300"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[6px] uppercase">
                          {rdv.client_name?.[0]}
                        </div>
                        <p className="truncate uppercase tracking-tighter">
                          {rdv.client_name?.split('@')[0]}
                        </p>
                      </div>
                      <p className="opacity-60 text-[7px] truncate font-medium normal-case">
                        {rdv.service_selected}
                      </p>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function getDisplayedDays(currentDate, viewMode) {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const count = viewMode === 'day' ? 1 : 5; // 1 jour ou 5 jours (Lundi-Vendredi)
  return Array.from({ length: count }, (_, i) => addDays(viewMode === 'day' ? currentDate : start, i));
}

function MissionCard({ app, dark, glass, updateStatus, setActiveChat, fetchData }) {
    const [vCode, setVCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [showCancelOptions, setShowCancelOptions] = useState(false);

const handleVerify = async (missionId) => {
    if (!vCode) return alert("Veuillez entrer le code de sécurité.");
    setIsVerifying(true);

    try {
        const response = await fetch('http://localhost:3000/release-funds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appointmentId: missionId, // On passe l'ID dynamique ici
                validationCode: vCode
            }),
        });

        const data = await response.json();

        if (data.success) {
            alert("🚀 MISSION VALIDÉE : Fonds transférés !");
            fetchData(); // Rafraîchir la liste des missions
            setVCode(""); // Vider l'input
        } else {
            alert("⚠️ ÉCHEC : " + data.error);
        }
    } catch (err) {
        alert("Erreur de connexion au serveur.");
    } finally {
        setIsVerifying(false);
    }
};

    return (
        <div className={`p-8 rounded-[40px] border ${glass} flex flex-col lg:flex-row justify-between items-center gap-6 transition-all hover:border-[#bc13fe]/30 text-left relative overflow-hidden`}>
          
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-black font-black bg-[#bc13fe] shrink-0">
              {app.client_name ? app.client_name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-xl font-black italic uppercase truncate">{app.client_name?.split('@')[0] || "UNIT_ID"}</p>
                  <span className={`px-3 py-1 rounded-full text-[7px] border font-black uppercase italic ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-[9px] text-[#00f2ff] font-black uppercase italic">{app.service_selected} — {app.total_price}€</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 w-full lg:w-auto">
            <div className="text-center lg:text-right px-4 border-l border-white/5">
                <p className="text-[12px] font-black italic uppercase">{app.appointment_date}</p>
                <p className="text-[9px] opacity-40 uppercase font-black italic">@{app.appointment_time}</p>
            </div>

            {app.status === 'en attente' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(app.id, 'confirmé')} className="px-6 py-4 bg-[#00f2ff] text-black rounded-2xl text-[10px] font-black italic uppercase transition-all active:scale-95">ACCEPTER</button>
                <button onClick={() => updateStatus(app.id, 'refusé')} className="px-6 py-4 bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-black italic uppercase transition-all active:scale-95">REFUSER</button>
              </div>
            )}

            {app.status === 'confirmé' && (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                        <input 
                          type="text" 
                          placeholder="CODE_CLIENT" 
                          value={vCode} 
                          onChange={e => setVCode(e.target.value)} 
                          className="bg-transparent px-4 py-2 rounded-xl text-center font-mono text-xs outline-none w-24 text-[#00f2ff]" 
                        />

      {/* Si 'res' est ta variable de boucle dans bookings.map((res) => ...) */}
      {/* LIGNE 477 ENVIRON */}
      {/* DANS MissionCard, remplace TOUT le bouton de vérification */}
      <button 
        onClick={() => handleVerify(app.id)} // <--- ON UTILISE app.id ICI
        disabled={isVerifying}
        className="bg-[#00f2ff] text-black px-6 py-3 rounded-xl font-black italic uppercase transition-all active:scale-95 disabled:opacity-50"
      >
        {isVerifying ? 'VÉRIFICATION...' : 'VALIDER_MISSION'}
      </button>
               </div>

                    {!showCancelOptions ? (
                      <button onClick={() => setShowCancelOptions(true)} className="text-[8px] opacity-20 hover:opacity-100 text-red-500 font-black italic uppercase underline decoration-red-500 underline-offset-4 transition-all">
                        Annulation_Urgence
                      </button>
                    ) : (
                      <div className="flex gap-2 animate-in slide-in-from-right-2">
                        <button onClick={() => updateStatus(app.id, 'refusé', 'Imprévu Pro')} className="px-3 py-2 bg-red-500 text-white rounded-lg text-[8px] font-black uppercase transition-all active:scale-95">CONFIRMER_ANNULATION</button>
                        <button onClick={() => setShowCancelOptions(false)} className="px-3 py-2 bg-white/10 rounded-lg text-[8px] font-black uppercase transition-all active:scale-95">RETOUR</button>
                      </div>
                    )}
                </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setActiveChat({id: app.client_id, name: app.client_name})} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#bc13fe] hover:text-white transition-all">
                  <i className="fas fa-comments"></i>
              </button>
            </div>
          </div>
        </div>
    );
}




function ProCMS({ supabase, profile, session, dark, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const initialServices = Array.isArray(profile?.services_list) ? profile.services_list : [{ titre: '', desc: '', price: '', images: [] }];

  const [formData, setFormData] = useState({
    nom_commercial: profile?.nom_commercial || '',
    adresse: profile?.adresse || '',
    instagram_url: profile?.instagram_url || '',
    about_text: profile?.about_text || '',
    bio: profile?.bio || '',
    cover_url: profile?.cover_url || '',
    catalog_images: Array.isArray(profile?.catalog_images) ? profile.catalog_images : [],
    services_list: initialServices,
    working_days: Array.isArray(profile?.working_days) ? profile.working_days : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    working_hours: profile?.working_hours || { start: "08:00", end: "18:00" },
    equipment: Array.isArray(profile?.equipment) ? profile.equipment : [],
    certifications: Array.isArray(profile?.certifications) ? profile.certifications : [],
    faq: Array.isArray(profile?.faq) ? profile.faq : [{ question: '', answer: '' }],
  subscription_type: profile?.subscription_type || 'commission', // AJOUTE CETTE LIGNE
  });

  const addFaq = () => setFormData(prev => ({ ...prev, faq: [...prev.faq, { question: '', answer: '' }] }));
  const updateFaq = (index, field, value) => {
    const newFaq = [...formData.faq];
    newFaq[index][field] = value;
    setFormData(prev => ({ ...prev, faq: newFaq }));
  };
  const removeFaq = (index) => setFormData(prev => ({ ...prev, faq: prev.faq.filter((_, i) => i !== index) }));

  const addService = () => setFormData(prev => ({ ...prev, services_list: [...prev.services_list, { titre: '', desc: '', price: '', images: [] }] }));
  const updateService = (index, field, value) => {
    const newList = [...formData.services_list];
    newList[index][field] = value;
    setFormData(prev => ({ ...prev, services_list: newList }));
  };
  const removeService = (index) => setFormData(prev => ({ ...prev, services_list: prev.services_list.filter((_, i) => i !== index) }));

  const handleServiceImage = async (serviceIndex, imgIndex, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      const newList = [...formData.services_list];
      const serviceImages = Array.isArray(newList[serviceIndex].images) ? [...newList[serviceIndex].images] : [];
      serviceImages[imgIndex] = url;
      newList[serviceIndex].images = serviceImages;
      setFormData(prev => ({ ...prev, services_list: newList }));
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const handleFile = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      if (field === 'catalog_images') setFormData(prev => ({...prev, catalog_images: [...prev.catalog_images, url]}));
      else setFormData(prev => ({...prev, [field]: url}));
    } catch (err) { alert(err.message); }
    setLoading(false);
    e.target.value = ""; 
  };

const save = async () => {
  setLoading(true);
  try {
    // 1. Sauvegarde immédiate des modifications (nom, services, prix...)
    const { error: upsertError } = await supabase
      .from('profiles_pro')
      .upsert({ 
        id: session.user.id, 
        ...formData, 
        updated_at: new Date().toISOString() 
      });

    if (upsertError) throw upsertError;

    // 2. VÉRIFICATION DE SÉCURITÉ : On récupère le statut de paiement actuel en base
    const { data: currentStatus } = await supabase
      .from('profiles_pro')
      .select('subscription_status, subscription_type')
      .eq('id', session.user.id)
      .single();

    // 3. LOGIQUE DE REDIRECTION INTELLIGENTE
    // On ne redirige vers Stripe QUE SI :
    // - L'utilisateur a choisi 'monthly'
    // - ET que son statut n'est PAS 'active'
    if (formData.subscription_type === 'monthly' && currentStatus?.subscription_status !== 'active') {
      console.log("💰 Nouvel abonnement : Direction Stripe...");
      
      const response = await fetch('http://localhost:3000/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id, 
          email: session.user.email 
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return; 
      }
    } 

    // 4. Si c'est en mode commission OU si l'abonnement est déjà 'active'
    console.log("✅ Modifications enregistrées sans frais supplémentaires.");
    onComplete(); // On ferme simplement le CMS
    alert("Profil mis à jour avec succès !");

  } catch (err) {
    alert("Erreur lors de l'enregistrement : " + err.message);
  } finally {
    setLoading(false);
  }
};

  const inputStyle = `w-full border p-4 md:p-6 rounded-[20px] mb-4 outline-none font-black italic uppercase transition-all ${dark ? 'bg-black text-white border-white/10 focus:border-[#bc13fe]' : 'bg-slate-50 text-black border-black/10 focus:border-[#bc13fe]'}`;

  return (
    <div className={`p-6 md:p-12 rounded-[40px] md:rounded-[60px] border shadow-2xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'} max-w-4xl mx-auto w-full`}>
      
      <div className="mb-8 md:mb-12 flex items-center overflow-x-auto no-scrollbar gap-6 border-b border-white/5 pb-4">
{["Identité", "Visuels", "PRÉSENTATION", "Services", "Planning", "FAQ", "Monétisation"].map((n, i) => (          <button 
            key={i} 
            onClick={() => setStep(i + 1)}
            className={`text-[8px] font-black tracking-[0.2em] uppercase italic whitespace-nowrap transition-all ${step === i + 1 ? "text-[#bc13fe] scale-110" : "opacity-30"}`}
          >
            {i + 1}. {n}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {step === 1 && (
            <div className="animate-in slide-in-from-right-4 text-left">
              <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">01_IDENTITÉ</h2>
              <input className={inputStyle} value={formData.nom_commercial} placeholder="NOM DE L'AGENCE" onChange={e => setFormData({...formData, nom_commercial: e.target.value})} />
              <input className={inputStyle} value={formData.adresse} placeholder="ADRESSE DE L'AGENCE" onChange={e => setFormData({...formData, adresse: e.target.value})} />
            </div>
        )}

        {step === 2 && (
            <div className="animate-in slide-in-from-right-4 space-y-10 text-left">
            <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">02_VISUELS</h2>
            <div>
                <p className="text-[8px] mb-3 opacity-40 uppercase tracking-widest font-black">Cover</p>
                <label htmlFor="cover-up" className="w-full h-32 md:h-48 border-2 border-dashed border-current/10 rounded-[25px] flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all">
                {formData.cover_url ? <img src={formData.cover_url} className="w-full h-full object-cover" /> : <span className="opacity-20 uppercase text-[9px]">UPLOAD_COVER</span>}
                <input id="cover-up" type="file" className="hidden" onChange={e => handleFile(e, 'cover_url')} />
                </label>
            </div>
            <div>
                <p className="text-[8px] mb-3 opacity-40 uppercase tracking-widest font-black">Portfolio (Max 5)</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {formData.catalog_images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-white/5">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(prev => ({...prev, catalog_images: prev.catalog_images.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center font-black">✕</button>
                    </div>
                ))}
                {formData.catalog_images.length < 5 && (
                    <>
                        <label htmlFor="catalog-add" className="aspect-square border-2 border-dashed border-current/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#bc13fe] transition-all">+</label>
                        <input id="catalog-add" type="file" className="hidden" onChange={e => handleFile(e, 'catalog_images')} />
                    </>
                )}
                </div>
            </div>
            </div>
        )}

        {step === 3 && (
            <div className="animate-in slide-in-from-right-4 text-left">
              <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">03_PRÉSENTATION</h2>
              <input className={inputStyle} value={formData.about_text} placeholder="SLOGAN" onChange={e => setFormData({...formData, about_text: e.target.value})} />
              <textarea className={`${inputStyle} h-40 normal-case`} value={formData.bio} placeholder="AGENCE BIO / MISSION..." onChange={e => setFormData({...formData, bio: e.target.value})} />
            </div>
        )}

        
{step === 4 && (
  <div className="animate-in slide-in-from-right-4 text-left">
    <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#00f2ff] underline underline-offset-8">04_EXPERTISE_&_SERVICES</h2>
    
    {/* --- SECTION 1 : TAGS DE RÉFÉRENCEMENT (Pour le filtre client) --- */}
    <div className="mb-12">
      <p className="text-[10px] font-black tracking-[0.3em] opacity-50 mb-4 uppercase italic">Sélectionnez vos pôles d'expertise :</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          "Lavage Manuel", "Polissage", "Protection Céramique", 
          "Pose de PPF", "Nettoyage Intérieur", "Rénovation Cuir", 
          "Optiques de Phare", "Ciel étoilé", "Vitres Teintées"
        ].map(spec => (
          <label 
            key={spec} 
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
              formData.expertise?.includes(spec) 
              ? 'bg-[#00f2ff] border-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]' 
              : 'bg-white/5 border-white/10 opacity-40 hover:opacity-100'
            }`}
          >
            <input 
              type="checkbox" 
              className="hidden"
              checked={formData.expertise?.includes(spec)}
              onChange={() => {
                const current = formData.expertise || [];
                const next = current.includes(spec) 
                  ? current.filter(s => s !== spec) 
                  : [...current, spec];
                setFormData({...formData, expertise: next});
              }}
            />
            <i className={`fas ${formData.expertise?.includes(spec) ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
            <span className="text-[9px] font-black leading-none">{spec.toUpperCase()}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="h-[1px] w-full bg-white/5 mb-10"></div>

    {/* --- SECTION 2 : ÉDITION DES SERVICES DÉTAILLÉS (Ton code original) --- */}
    <p className="text-[10px] font-black tracking-[0.3em] opacity-50 mb-6 uppercase italic">Détail des prestations & tarifs :</p>
    
    <div className="max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
      {formData.services_list.map((service, index) => (
        <div key={index} className="p-6 md:p-8 rounded-[30px] border border-current/10 mb-6 bg-current/[0.02] relative group transition-all hover:border-[#00f2ff]/30">
          <button type="button" onClick={() => removeService(index)} className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-transform active:scale-90">
            <i className="fas fa-trash text-[10px]"></i>
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input className={inputStyle} placeholder="NOM DU SERVICE (EX: PACK SILVER)" value={service.titre} onChange={(e) => updateService(index, 'titre', e.target.value)} />
            <input className={`${inputStyle} sm:w-32`} placeholder="PRIX €" type="number" value={service.price} onChange={(e) => updateService(index, 'price', e.target.value)} />
          </div>
          
          <textarea className={`${inputStyle} h-20 normal-case mb-4`} placeholder="DESCRIPTION TECHNIQUE DU PROTOCOLE..." value={service.desc} onChange={(e) => updateService(index, 'desc', e.target.value)} />
          
          <div className="flex gap-3">
            {[0, 1, 2].map((imgIdx) => (
              <div key={imgIdx} className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-dashed border-current/10 overflow-hidden relative group flex items-center justify-center bg-black/20">
                {service.images?.[imgIdx] ? (
                  <img src={service.images[imgIdx]} className="w-full h-full object-cover" alt="Service Preview" />
                ) : (
                  <label htmlFor={`service-${index}-img-${imgIdx}`} className="absolute inset-0 flex items-center justify-center opacity-20 cursor-pointer italic text-[7px] font-black uppercase hover:opacity-100 transition-all">ADD_IMG</label>
                )}
                <input id={`service-${index}-img-${imgIdx}`} type="file" className="hidden" onChange={(e) => handleServiceImage(index, imgIdx, e.target.files[0])} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <button type="button" onClick={addService} className="w-full py-5 border-2 border-dashed border-current/10 rounded-2xl opacity-40 hover:opacity-100 hover:border-[#00f2ff] hover:text-[#00f2ff] transition-all text-[10px] font-black tracking-widest mt-4 uppercase">
      + Ajouter une prestation
    </button>
  </div>
)}

        {step === 5 && (
            <div className="animate-in slide-in-from-right-4 text-left space-y-8">
            <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">05_PLANNING</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => (
                    <button key={day} type="button" onClick={() => {
                        const cur = [...formData.working_days];
                        const i = cur.indexOf(day);
                        if (i > -1) cur.splice(i, 1); else cur.push(day);
                        setFormData({...formData, working_days: cur});
                    }} className={`p-4 rounded-2xl border transition-all text-[9px] font-black ${formData.working_days.includes(day) ? 'bg-[#bc13fe] border-[#bc13fe] text-white' : 'opacity-20'}`}>
                        {day}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <p className="text-[8px] opacity-40 ml-2">OUVERTURE</p>
                    <input type="time" className={inputStyle} value={formData.working_hours.start} onChange={e => setFormData({...formData, working_hours: {...formData.working_hours, start: e.target.value}})} />
                </div>
                <div className="space-y-2">
                    <p className="text-[8px] opacity-40 ml-2">FERMETURE</p>
                    <input type="time" className={inputStyle} value={formData.working_hours.end} onChange={e => setFormData({...formData, working_hours: {...formData.working_hours, end: e.target.value}})} />
                </div>
            </div>
            </div>
        )}

        {step === 6 && (
            <div className="animate-in slide-in-from-right-4 text-left">
            <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">06_FAQ</h2>
            <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {formData.faq.map((item, index) => (
                <div key={index} className="p-6 md:p-8 rounded-[30px] border border-current/10 mb-6 bg-current/[0.02] relative group">
                    <button type="button" onClick={() => removeFaq(index)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center z-10"><i className="fas fa-trash text-[10px]"></i></button>
                    <div className="space-y-3">
                    <input className={inputStyle} placeholder="QUESTION" value={item.question} onChange={(e) => updateFaq(index, 'question', e.target.value)} />
                    <textarea className={`${inputStyle} h-24 normal-case font-medium`} placeholder="RÉPONSE..." value={item.answer} onChange={(e) => updateFaq(index, 'answer', e.target.value)} />
                    </div>
                </div>
                ))}
            </div>
            <button type="button" onClick={addFaq} className="w-full py-5 border-2 border-dashed border-current/10 rounded-2xl opacity-50 text-[10px] tracking-widest">+ Ajouter une question</button>
            </div>
        )}
      </div>

      {/* Nouvelle Étape 7 : MONÉTISATION */}
{step === 7 && (
  <div className="animate-in slide-in-from-right-4 text-left">
    <h2 className="text-2xl md:text-4xl mb-8 italic font-black uppercase tracking-tighter decoration-[#bc13fe] underline underline-offset-8">07_CHOIX_DU_FORFAIT</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* OPTION COMMISSION */}
      <button 
        onClick={() => setFormData({...formData, subscription_type: 'commission'})}
        className={`p-8 rounded-[40px] border-2 transition-all text-left ${formData.subscription_type === 'commission' ? 'border-[#bc13fe] bg-[#bc13fe]/5' : 'border-white/10 opacity-40'}`}
      >
        <div className="flex justify-between items-start mb-4">
            <span className="text-3xl font-black italic text-[#bc13fe]">15%</span>
            <i className={`fas ${formData.subscription_type === 'commission' ? 'fa-check-circle' : 'fa-circle'}`}></i>
        </div>
        <h3 className="text-xl font-black mb-2 uppercase italic">COMMISSION_SÉCURITÉ</h3>
        <p className="text-[9px] opacity-60 leading-relaxed normal-case">Idéal pour débuter. Pas de frais fixes. Nous prenons une commission uniquement sur les réservations réussies.</p>
      </button>

      {/* OPTION ABONNEMENT */}
      <button 
        onClick={() => setFormData({...formData, subscription_type: 'monthly'})}
        className={`p-8 rounded-[40px] border-2 transition-all text-left ${formData.subscription_type === 'monthly' ? 'border-[#00f2ff] bg-[#00f2ff]/5' : 'border-white/10 opacity-40'}`}
      >
        <div className="flex justify-between items-start mb-4">
            <span className="text-3xl font-black italic text-[#00f2ff]">29€/m</span>
            <i className={`fas ${formData.subscription_type === 'monthly' ? 'fa-check-circle' : 'fa-circle'}`}></i>
        </div>
        <h3 className="text-xl font-black mb-2 uppercase italic">PREMIUM_FIXE</h3>
        <p className="text-[9px] opacity-60 leading-relaxed normal-case">Conservez 100% de vos gains. Un abonnement mensuel unique pour une visibilité maximale et zéro commission plateforme.</p>
      </button>
    </div>
  </div>
)}

<div className="flex justify-between mt-12 pt-8 border-t border-white/5 font-black italic uppercase">
  {/* On a enlevé le 'invisible' : le bouton sera toujours là */}
  <button 
    type="button" 
    onClick={() => {
      if (step === 1) {
        // Optionnel : tu peux définir une action spéciale si on clique sur BACK à l'étape 1
        // Par exemple : setIsConfiguring(false) pour quitter le CMS
        onComplete(); 
      } else {
        setStep(prev => prev - 1);
      }
    }} 
    className="text-[10px] opacity-40 hover:opacity-100 transition-colors"
  >
    {step === 1 ? 'QUITTER' : 'RETOUR'} 
  </button>

<button 
  onClick={() => step < 7 ? setStep(step + 1) : save()} 
  disabled={loading} 
  className="px-10 md:px-16 py-4 md:py-6 rounded-full bg-white text-black text-[10px] md:text-[12px] hover:bg-[#00f2ff] transition-all shadow-xl font-black active:scale-95"
>
  {loading ? 'SYNCHRONISATION...' : step < 7 ? 'SUIVANT' : 'ENREGISTRER'}
</button>
</div>
    </div>
  );
}