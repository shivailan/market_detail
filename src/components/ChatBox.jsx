import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ChatBox({ receiverId, receiverName, senderId, onClose, dark }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  // 1. CHARGEMENT INITIAL + TEMPS RÉEL
  useEffect(() => {
    if (!receiverId || !senderId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .order('created_at', { ascending: true });
      
      if (error) console.error("Erreur chargement messages:", error.message);
      else setMessages(data || []);
    };

    fetchMessages();

    // S'abonner au temps réel
    const channel = supabase.channel(`chat-${receiverId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        // IMPORTANT: On n'ajoute ici que les messages reçus de l'AUTRE
        // Pour éviter de doubler nos propres messages envoyés instantanément
        if (msg.sender_id === receiverId && msg.receiver_id === senderId) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [receiverId, senderId]);

  // Auto-scroll à chaque nouveau message
  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  // 2. FONCTION D'ENVOI (INSTANTANÉE / OPTIMISTIQUE)
  const sendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content) return;

    // A. Création du message temporaire pour l'UI
    const tempMsg = {
      id: 'temp-' + Date.now(),
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
      created_at: new Date().toISOString(),
      isSending: true // Pour un petit effet visuel
    };

    // B. Mise à jour locale immédiate (on voit le message partir direct)
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage(''); // Vide l'input direct

    // C. Envoi réel en arrière-plan
    const { error } = await supabase.from('messages').insert([
      { 
        sender_id: senderId, 
        receiver_id: receiverId, 
        content: content 
      }
    ]);

    if (error) {
      console.error("ERREUR D'ENVOI:", error.message);
      // On retire le message s'il y a eu un échec
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      alert("Erreur d'envoi réseau.");
    } else {
      // On enlève le flag 'isSending' une fois confirmé (optionnel)
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, isSending: false } : m));
    }
  };

  const glass = dark ? 'bg-[#0a0a0a] text-white border-white/10' : 'bg-white text-black border-black/10 shadow-2xl';

  return (
    <div className={`fixed bottom-6 right-6 w-80 md:w-96 h-[550px] border shadow-2xl rounded-[35px] flex flex-col z-[9999] overflow-hidden ${glass} backdrop-blur-3xl animate-in slide-in-from-bottom-10`}>
      
      {/* HEADER */}
      <div className="p-6 border-b border-current/10 flex justify-between items-center italic font-black text-[10px] bg-current/5 tracking-widest">
        <span>SESSION: {receiverName}</span>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
      </div>

      {/* ZONE DE MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-transparent">
        {messages.map((m) => {
          const isMe = m.sender_id === senderId;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-[22px] text-[11px] font-bold italic shadow-md transition-all duration-300 ${
                isMe 
                  ? `bg-[#bc13fe] text-white rounded-tr-none ${m.isSending ? 'opacity-60 scale-95' : 'opacity-100 scale-100'}` 
                  : dark ? 'bg-white/10 text-white rounded-tl-none' : 'bg-black/5 text-black rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      {/* FORMULAIRE D'ENVOI */}
      <form onSubmit={sendMessage} className="p-4 bg-current/5 border-t border-current/10 flex gap-2">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="TAPER_MESSAGE..."
          // Couleur forcée pour éviter le blanc sur blanc
          className={`flex-1 border-none rounded-full px-6 py-4 text-[10px] font-black italic outline-none shadow-inner
            ${dark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}
        />
        <button 
          type="submit" 
          className="w-14 h-14 bg-[#00f2ff] text-black rounded-full flex items-center justify-center hover:bg-[#bc13fe] hover:text-white transition-all shadow-lg active:scale-90"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}