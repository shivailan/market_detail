import { useEffect } from 'react';

export default function Terms({ dark }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sectionClass = "mb-12 border-l-2 border-[#00f2ff] pl-6 md:pl-10";
  const titleClass = "text-sm md:text-base font-black tracking-[0.3em] text-[#bc13fe] mb-6 uppercase italic";
  const textClass = "text-[11px] md:text-xs opacity-60 leading-relaxed normal-case font-medium italic space-y-4";

  return (
    <div className={`pt-40 pb-20 px-6 md:px-12 max-w-5xl mx-auto ${dark ? 'text-white' : 'text-black'}`}>
      
      <div className="mb-20 border-b border-current/10 pb-10">
        <span className="text-[#00f2ff] text-[9px] tracking-[0.5em] block mb-4">SERVICE_LEVEL_AGREEMENT_v1.0</span>
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
          TERMS_OF_<span className="text-[#00f2ff]">SERVICE</span>.
        </h1>
      </div>

      <div className="space-y-12 text-left">
        <section className={sectionClass}>
          <h2 className={titleClass}>01_OBJET_DU_SYSTÈME</h2>
          <div className={textClass}>
            <p>
              <span className="text-[#00f2ff] font-black uppercase not-italic">DetailPlan</span> est une infrastructure numérique de mise en relation entre des propriétaires de véhicules ("Clients") et des experts en esthétique automobile ("Professionnels"). DetailPlan n'intervient pas dans la réalisation technique des prestations.
            </p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={titleClass}>02_RESPONSABILITÉ_TECHNIQUE</h2>
          <div className={textClass}>
            <p>
              Le Professionnel est seul responsable de la qualité des soins apportés au véhicule, de l'utilisation de ses produits et de ses assurances professionnelles. En cas de dommage, la responsabilité de DetailPlan ne peut être engagée.
            </p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={titleClass}>03_SYSTÈME_DE_RÉSERVATION</h2>
          <div className={textClass}>
            <p>
              Toute réservation confirmée via le terminal engage le Client à se présenter à l'unité de detailing choisie. Le code de validation ne doit être révélé au Professionnel qu'une fois la mission accomplie.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-20 opacity-20 text-[9px] tracking-widest text-center uppercase">
        DetailPlan // Protocols Established 2026
      </div>
    </div>
  );
}