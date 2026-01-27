import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ResetPassword({ dark }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert("6 CARACTÈRES MINIMUM.");
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert("ERREUR : " + error.message);
    } else {
      setDone(true);
      setTimeout(() => {
        window.location.href = "/"; // Retour à l'accueil après 3 secondes
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${dark ? 'bg-[#050505] text-white' : 'bg-white text-black'}`}>
      <div className="w-full max-w-md space-y-8 text-left italic uppercase font-black">
        <div>
          <h2 className="text-4xl md:text-5xl tracking-tighter decoration-[#bc13fe] underline underline-offset-8 mb-4">NOUVEAU_CODE.</h2>
          <p className="text-[10px] opacity-50 tracking-[0.2em]">SÉCURISATION DE VOTRE ACCÈS AU RÉSEAU</p>
        </div>

        {done ? (
          <div className="p-8 rounded-3xl bg-green-500/10 border border-green-500/20 text-green-500 animate-in fade-in">
            <p className="text-sm uppercase font-black italic">MOT DE PASSE MIS À JOUR ! REDIRECTION...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] opacity-30 ml-2">NOUVEAU MOT DE PASSE :</label>
              <input 
                type="password" 
                required
                className={`w-full p-6 rounded-3xl border-2 outline-none transition-all ${dark ? 'bg-white/5 border-white/10 focus:border-[#bc13fe]' : 'bg-black/5 border-black/10 focus:border-[#bc13fe]'}`}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-6 rounded-3xl text-[12px] transition-all ${dark ? 'bg-white text-black hover:bg-[#bc13fe] hover:text-white' : 'bg-black text-white'}`}
            >
              {loading ? 'SYNCHRONISATION...' : 'ACTUALISER LE MOT DE PASSE'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}