import { format } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MessagingCenter({ session, dark }) {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const glass = dark ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.02] border-black/10';

  // 1. Charger la liste des contacts/conversations
  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, sender_name, receiver_name, content, created_at')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const contactMap = new Map();
      data.forEach(msg => {
        const isIwasSender = msg.sender_id === session.user.id;
        const contactId = isIwasSender ? msg.receiver_id : msg.sender_id;
        const contactName = isIwasSender ? msg.receiver_name : msg.sender_name;
        
        if (!contactMap.has(contactId)) {
          contactMap.set(contactId, {
            id: contactId,
            name: contactName || "UTILISATEUR",
            lastMsg: msg.content,
            time: msg.created_at
          });
        }
      });
      setConversations(Array.from(contactMap.values()));
    }
    setLoading(false);
  }, [session?.user?.id]);

  // 2. Charger les messages du chat actif
  const fetchMessages = useCallback(async (contactId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true });

    if (!error) setMessages(data || []);
  }, [session?.user?.id]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { if (activeChat) fetchMessages(activeChat.id); }, [activeChat, fetchMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // 3. Envoyer un message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const msgObj = {
      sender_id: session.user.id,
      receiver_id: activeChat.id,
      content: newMessage,
      sender_name: session.user.user_metadata?.full_name || session.user.email,
      receiver_name: activeChat.name
    };

    const { error } = await supabase.from('messages').insert([msgObj]);
    if (!error) {
      setNewMessage('');
      fetchMessages(activeChat.id);
      fetchConversations();
    }
  };

  return (
    <div className={`h-[80vh] flex rounded-[40px] border overflow-hidden transition-all ${dark ? 'bg-[#0a0a0b] border-white/10' : 'bg-white border-black/10 shadow-2xl'}`}>
      
      {/* SIDEBAR : LISTE DES DISCUSSIONS */}
      <div className={`w-full md:w-80 flex flex-col border-r ${dark ? 'border-white/5' : 'border-black/5'} ${activeChat && 'hidden md:flex'}`}>
        <div className="p-8 border-b border-current/5">
          <h2 className="text-xl font-black italic tracking-tighter">MESSAGES_</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map(conv => (
            <button 
              key={conv.id}
              onClick={() => setActiveChat(conv)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left ${activeChat?.id === conv.id ? 'bg-[#bc13fe] text-white' : 'hover:bg-current/5'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black italic ${activeChat?.id === conv.id ? 'bg-white/20' : 'bg-[#bc13fe]/10 text-[#bc13fe]'}`}>
                {conv.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-[11px] font-black truncate">{conv.name.toUpperCase()}</p>
                  <span className="text-[8px] opacity-40">{format(new Date(conv.time), 'HH:mm')}</span>
                </div>
                <p className={`text-[10px] truncate normal-case italic ${activeChat?.id === conv.id ? 'text-white/70' : 'opacity-40'}`}>{conv.lastMsg}</p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && !loading && (
            <div className="text-center py-20 opacity-20 text-[10px] font-black italic uppercase">Aucune discussion_</div>
          )}
        </div>
      </div>

      {/* ZONE DE CHAT ACTIF */}
      <div className={`flex-1 flex flex-col ${!activeChat && 'hidden md:flex'} ${dark ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
        {activeChat ? (
          <>
            {/* HEADER CHAT */}
            <div className="p-6 border-b border-current/5 flex items-center gap-4">
              <button onClick={() => setActiveChat(null)} className="md:hidden w-8 h-8 rounded-full border border-current/10 flex items-center justify-center"><i className="fas fa-arrow-left"></i></button>
              <div className="w-10 h-10 rounded-full bg-[#bc13fe] text-white flex items-center justify-center font-black italic">{activeChat.name[0]}</div>
              <div>
                <h3 className="text-[12px] font-black italic uppercase tracking-widest">{activeChat.name}</h3>
                <span className="text-[8px] text-[#00f2ff] font-black animate-pulse uppercase">Canal_Sécurisé</span>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => {
                const isMe = m.sender_id === session.user.id;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-3xl text-[12px] font-medium italic normal-case ${isMe ? 'bg-[#bc13fe] text-white rounded-tr-none shadow-lg shadow-[#bc13fe]/20' : (dark ? 'bg-white/5 text-white' : 'bg-white text-black shadow-sm') + ' rounded-tl-none border border-current/5'}`}>
                      {m.content}
                      <div className={`text-[7px] mt-2 opacity-40 text-right font-black`}>
                        {format(new Date(m.created_at), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <form onSubmit={sendMessage} className="p-6 border-t border-current/5 bg-inherit">
              <div className="relative flex items-center">
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrire votre message technique..."
                  className={`w-full py-5 px-8 rounded-full text-[12px] font-black italic uppercase outline-none transition-all ${dark ? 'bg-white/5 border border-white/10 focus:border-[#bc13fe]' : 'bg-white border border-black/10 focus:border-[#bc13fe] shadow-inner'}`}
                />
                <button type="submit" className="absolute right-3 w-12 h-12 bg-[#bc13fe] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
            <div className="text-6xl mb-6"><i className="fas fa-comments-alt"></i></div>
            <p className="text-[12px] font-black italic tracking-[0.4em] uppercase">SÉLECTIONNEZ_UN_CONTACT_POUR_INITIALISER</p>
          </div>
        )}
      </div>
    </div>
  );
}