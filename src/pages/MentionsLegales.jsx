export default function MentionsLegales({ dark }) {
  const sectionClass = "mb-10 border-l-2 border-[#00f2ff] pl-6";
  const titleClass = "text-sm font-black tracking-[0.3em] text-[#bc13fe] mb-4 uppercase";
  const textClass = "text-xs opacity-70 leading-relaxed normal-case font-medium italic";

  return (
    <div className={`pt-40 pb-20 px-6 max-w-4xl mx-auto italic ${dark ? 'text-white' : 'text-black'}`}>
      <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16">
        LEGAL_<span className="text-[#00f2ff]">INFO</span>.
      </h1>

      <div className={sectionClass}>
        <h2 className={titleClass}>01_ÉDITION</h2>
        <p className={textClass}>
          Ce système est opéré par Shiva Ilanchejian.<br/>
          SIRET: [NUMÉRO_SIRET]<br/>
          Siège: [ADRESSE_COMPLÈTE]
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={titleClass}>02_INFRASTRUCTURE</h2>
        <p className={textClass}>
          Hébergement : Vercel Inc.<br/>
          Database : Supabase Open Source BaaS.
        </p>
      </div>

      <div className={sectionClass}>
        <h2 className={titleClass}>03_RGPD_&_PRIVACY</h2>
        <p className={textClass}>
          Vos données sont cryptées et stockées via le protocole Row Level Security (RLS) de Supabase. 
          Vous pouvez demander la suppression de votre compte à tout moment dans vos réglages.
        </p>
      </div>

      <div className="mt-20 opacity-20 text-[10px] tracking-widest text-center uppercase">
        DetailPlan // Digital Infrastructure © 2026
      </div>
    </div>
  );
}