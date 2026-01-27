import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AccountSettings({ session, dark, setView }) {
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const userRole = session?.user?.user_metadata?.role || 'client';
  
  // Extraction des métadonnées envoyées lors de l'inscription
  const { first_name, last_name, siret } = session?.user?.user_metadata || {};

  // 1. CHANGER LE MOT DE PASSE
  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) return alert("Veuillez remplir tous les champs.");
    if (newPassword.length < 6) return alert("Le nouveau mot de passe doit faire 6 caractères minimum.");
    
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: oldPassword,
    });

    if (signInError) {
      alert("ERREUR_SÉCURITÉ : L'ancien mot de passe est incorrect.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ 
      password: newPassword 
    });

    if (updateError) {
      alert("ERREUR_SYSTÈME : " + updateError.message);
    } else {
      alert("MOT_DE_PASSE_MIS_À_JOUR_AVEC_SUCCÈS");
      setOldPassword('');
      setNewPassword('');
    }
    
    setLoading(false);
  };

  // 2. SUPPRIMER LE COMPTE
  const handleDeleteAccount = async () => {
    const confirm = window.confirm("SUPPRESSION TOTALE : Ton email et tes accès vont être bannis du système. Confirmer ?");
    if (!confirm) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles_pro')
        .delete()
        .eq('id', session.user.id);

      if (error) throw error;

      await supabase.auth.signOut({ scope: 'global' });
      localStorage.clear();
      sessionStorage.clear();

      alert("COMPTE_DÉTRUIT : Redirection vers l'accueil.");
      window.location.href = "/"; 

    } catch (err) {
      alert("ERREUR : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const glass = dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10';
  const inputStyle = `w-full p-5 rounded-2xl border text-[10px] outline-none mb-4 transition-all uppercase font-black italic ${
    dark ? 'bg-black border-white/10 focus:border-[#bc13fe] text-white' : 'bg-white border-black/10 focus:border-[#bc13fe] text-black'
  }`;

  return (
    <div className={`pt-32 pb-20 px-4 max-w-2xl mx-auto font-black italic uppercase transition-all ${dark ? 'text-white' : 'text-black'}`}>
      
      {/* HEADER & RETOUR */}
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={() => setView(userRole === 'pro' ? 'dashboard' : 'mes-reservations')}
          className="w-12 h-12 rounded-full border border-current/10 flex items-center justify-center hover:bg-current/10 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <span className="text-[9px] tracking-[0.4em] opacity-30 italic">CONFIG_ACCOUNT_V.2</span>
      </div>

      <h2 className="text-4xl md:text-6xl mb-12 tracking-tighter italic font-black">MON_COMPTE.</h2>

      <div className="space-y-8 text-left">
        
        {/* SECTION INFOS ACTUELLES (MISE À JOUR) */}
        <div className={`p-8 rounded-[40px] border ${glass}`}>
          <p className="text-[10px] opacity-40 mb-6 tracking-widest uppercase">Identité_Réseau</p>
          <div className="space-y-4">
            
            {/* EMAIL */}
            <div className="flex justify-between items-center border-b border-current/5 pb-4">
              <span className="text-[10px] opacity-50">EMAIL_ID</span>
              <span className="text-xs normal-case font-bold">{session.user.email}</span>
            </div>

            {/* NOM & PRÉNOM */}
            <div className="flex justify-between items-center border-b border-current/5 pb-4">
              <span className="text-[10px] opacity-50">PRÉNOM_NOM</span>
              <span className="text-xs font-bold tracking-widest">
                {first_name || 'N/A'} {last_name || 'N/A'}
              </span>
            </div>

            {/* SIRET (Affiché uniquement si c'est un PRO) */}
            {userRole === 'pro' && (
              <div className="flex justify-between items-center border-b border-current/5 pb-4">
                <span className="text-[10px] opacity-50">N°_SIREN_SIRET</span>
                <span className="text-xs font-bold tracking-widest">{siret || 'NON_RENSEIGNÉ'}</span>
              </div>
            )}

            {/* STATUT */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] opacity-50">STATUT_UNITÉ</span>
              <span className={`px-4 py-1 rounded-full text-[9px] border font-black ${userRole === 'pro' ? 'border-[#bc13fe] text-[#bc13fe]' : 'border-[#00f2ff] text-[#00f2ff]'}`}>
                {userRole.toUpperCase()}
              </span>
            </div>

          </div>
        </div>

        {/* SECTION SÉCURITÉ */}
        <div className={`p-8 rounded-[40px] border ${glass}`}>
          <p className="text-[10px] opacity-40 mb-8 tracking-widest uppercase">Mise_à_jour_Sécurité</p>
          <div className="space-y-1">
            <p className="text-[8px] ml-2 mb-1 opacity-40">Ancien mot de passe :</p>
            <input 
              type="password" 
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputStyle}
            />
            <p className="text-[8px] ml-2 mb-1 opacity-40">Nouveau mot de passe :</p>
            <input 
              type="password" 
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputStyle}
            />
            <button 
              onClick={handleUpdatePassword}
              disabled={loading}
              className={`w-full py-6 mt-4 rounded-3xl text-[10px] font-black tracking-[0.3em] transition-all shadow-xl active:scale-95 ${
                dark ? 'bg-white text-black hover:bg-[#bc13fe] hover:text-white' : 'bg-black text-white hover:bg-[#bc13fe]'
              }`}
            >
              {loading ? 'SYNCHRONISATION...' : 'CONFIRMER_LE_CHANGEMENT'}
            </button>
          </div>
        </div>

        {/* SECTION DANGER ZONE */}
        <div className="p-8 rounded-[40px] border border-red-500/20 bg-red-500/5">
          <p className="text-[10px] text-red-500 mb-6 tracking-widest font-black uppercase">Zone_de_Suppression</p>
          <p className="text-[9px] opacity-60 normal-case italic mb-8 leading-relaxed">
            Cette action est irréversible. Toutes vos réservations, configurations de studio et messages seront effacés des serveurs DetailPlan.
          </p>
          <button 
            onClick={handleDeleteAccount}
            className="w-full py-5 border border-red-500/30 text-red-500 rounded-2xl text-[9px] font-black tracking-widest hover:bg-red-500 hover:text-white transition-all uppercase"
          >
            Supprimer définitivement mon accès
          </button>
        </div>

      </div>
    </div>
  );
}