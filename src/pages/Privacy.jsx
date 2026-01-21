import { useEffect } from 'react';

export default function Privacy({ dark }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sectionClass = "mb-12 border-l-2 border-[#bc13fe] pl-6 md:pl-10 relative";
  const titleClass = "text-sm md:text-base font-black tracking-[0.3em] text-[#00f2ff] mb-6 uppercase italic";
  const textClass = "text-[11px] md:text-xs opacity-60 leading-relaxed normal-case font-medium italic space-y-4";
  const highlight = "text-[#bc13fe] font-black uppercase not-italic";

  return (
    <div className={`pt-40 pb-20 px-6 md:px-12 max-w-5xl mx-auto ${dark ? 'text-white' : 'text-black'}`}>
      
      {/* HEADER PROTOCOLE */}
      <div className="mb-20 border-b border-current/10 pb-10">
        <span className="text-[#bc13fe] text-[9px] tracking-[0.5em] block mb-4">CONFIDENTIAL_DATA_ENCRYPTION_v1.0</span>
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
          PRIVACY_<span className="text-[#bc13fe]">POLICY</span>.
        </h1>
      </div>

      <div className="space-y-16">
        
        {/* 01_COLLECTE */}
        <section className={sectionClass}>
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#bc13fe] shadow-[0_0_15px_#bc13fe]"></div>
          <h2 className={titleClass}>01_COLLECTE_DES_DONNÉES</h2>
          <div className={textClass}>
            <p>
              Dans le cadre de l'utilisation du système <span className={highlight}>DetailPlan</span>, nous collectons les informations strictement nécessaires à la mise en relation technique :
            </p>
            <ul className="list-disc ml-4 space-y-2">
              <li><span className={highlight}>Identité :</span> Adresse e-mail via l'authentification Supabase.</li>
              <li><span className={highlight}>Profil Pro :</span> Nom commercial, adresse géolocalisée, expertises et catalogue visuel.</li>
              <li><span className={highlight}>Missions :</span> Historique des réservations, dates, types de services et codes de validation.</li>
            </ul>
          </div>
        </section>

        {/* 02_SECURITÉ */}
        <section className={sectionClass}>
          <h2 className={titleClass}>02_SÉCURITÉ_&_INFRASTRUCTURE</h2>
          <div className={textClass}>
            <p>
              Toutes les données sont hébergées via l'infrastructure <span className={highlight}>Supabase</span> utilisant le protocole <span className={highlight}>Row Level Security (RLS)</span>. 
              Cela garantit qu'aucun utilisateur ne peut accéder aux données d'un autre sans une clé d'authentification valide et chiffrée.
            </p>
            <p>
              Les paiements et transactions sont isolés via le protocole sécurisé de nos partenaires financiers (Stripe), garantissant que vos informations bancaires ne transitent jamais en clair sur nos serveurs.
            </p>
          </div>
        </section>

        {/* 03_FINALITÉ */}
        <section className={sectionClass}>
          <h2 className={titleClass}>03_UTILISATION_DES_FLUX</h2>
          <div className={textClass}>
            <p>Vos données sont exploitées pour les protocoles suivants :</p>
            <ul className="list-disc ml-4 space-y-2">
              <li>Synchronisation des agendas entre Clients et Pros.</li>
              <li>Géolocalisation des unités de Detailing sur l'Explorateur.</li>
              <li>Système de messagerie interne via ChatBox.</li>
              <li>Établissement des statistiques de performance pour les Pros.</li>
            </ul>
          </div>
        </section>

        {/* 04_DROITS */}
        <section className={sectionClass}>
          <h2 className={titleClass}>04_DROITS_UTILISATEURS</h2>
          <div className={textClass}>
            <p>
              Conformément au <span className={highlight}>RGPD</span>, vous disposez d'un droit total sur vos données :
            </p>
            <ul className="list-disc ml-4 space-y-2">
              <li>Droit d'accès et de rectification.</li>
              <li>Droit à l'effacement définitif ("Droit à l'oubli").</li>
              <li>Droit à la portabilité de vos données de missions.</li>
            </ul>
            <p className="mt-6 p-4 border border-white/10 bg-white/5 rounded-xl">
              Pour exercer ces droits, envoyez une requête au terminal : <span className="text-[#00f2ff]">support@detailplan.com</span>
            </p>
          </div>
        </section>

      </div>

      {/* FOOTER LEGAL */}
      <div className="mt-32 pt-10 border-t border-current/10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
        <span className="text-[9px] font-black tracking-widest">© 2026 DETAILPLAN_SYSTEMS</span>
        <div className="flex gap-8 text-[9px] font-black tracking-widest uppercase">
          <span>Encrypted_AES_256</span>
          <span>GDPR_Compliant</span>
        </div>
      </div>
    </div>
  );
}