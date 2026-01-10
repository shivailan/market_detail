function ProDashboard({ profile, onEdit }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10" data-aos="fade-up">
      {/* Header Profil */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-3xl">
        <div>
          <span className="text-[#bc13fe] text-[9px] font-black tracking-[0.5em] uppercase">Status: {profile.is_verified ? 'Vérifié' : 'En attente de vérification'}</span>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mt-2">{profile.nom_commercial}</h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-location-dot text-[#00f2ff]"></i> {profile.adresse} 
            {profile.is_mobile && <span className="ml-4 text-[#00f2ff]">[Service Mobile]</span>}
          </p>
        </div>
        <button onClick={onEdit} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition">
          Modifier le profil
        </button>
      </div>

      {/* Grille de statistiques / Infos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[30px]">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Tarifs de base</h4>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="tedonne le fichier app.jsx en entioer avec tes ajoutes 
              xt-[10px] uppercase">Citadine</span>
              <span className="font-bold text-[#bc13fe]">{profile.tarifs.petit}€</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] uppercase">Berline</span>
              <span className="font-bold text-[#bc13fe]">{profile.tarifs.berline}€</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] uppercase">SUV / 4x4</span>
              <span className="font-bold text-[#bc13fe]">{profile.tarifs.suv}€</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[30px] md:col-span-2">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">À propos / Bio</h4>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            "{profile.bio || "Aucune description fournie."}"
          </p>
          <div className="mt-8 pt-6 border-t border-white/5 flex gap-10">
            <div>
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest">Délai prévenance</span>
              <span className="text-xs font-bold">{profile.delai_prevenance}</span>
            </div>
            <div>
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest">Contact</span>
              <span className="text-xs font-bold">{profile.telephone}</span>
            </div>
            <div>
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest">SIRET</span>
              <span className="text-xs font-bold">{profile.siret}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}