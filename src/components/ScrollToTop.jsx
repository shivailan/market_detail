import { useEffect, useState } from 'react';

export default function ScrollToTop({ dark }) {
  const [isVisible, setIsVisible] = useState(false);

  // Gérer l'apparition de la flèche au scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Animation fluide
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-[100] p-4 rounded-full border transition-all duration-300 group hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,0,242,0.3)]
        ${dark 
          ? 'bg-black/80 border-[#00f2ff] text-[#00f2ff]' 
          : 'bg-white/80 border-[#bc13fe] text-[#bc13fe]'
        } backdrop-blur-md`}
    >
      {/* Icône de flèche simple en SVG */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 transform group-hover:-translate-y-1 transition-transform" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      
      {/* Petit texte discret style cyber */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        TOP_SYSTEM
      </span>
    </button>
  );
}