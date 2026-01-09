import React from 'react';
import { Loader2 } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500">
      
      {/* Logo Container */}
      <div className="relative flex items-center gap-3 mb-12 animate-in zoom-in-95 duration-1000 fade-in scale-110 md:scale-125">
        {/* "Anúncios" - Script Font Black */}
        <div className="relative pb-2">
            <h1 className="font-hand text-6xl md:text-7xl text-[#111318] z-10 relative leading-none">
            Anúncios
            </h1>
            {/* SVG Swash/Underline */}
            <svg 
              viewBox="0 0 140 30" 
              className="absolute -bottom-4 -left-2 w-[110%] h-auto text-[#111318] opacity-90 -rotate-2"
            >
              <path 
                d="M5,15 Q60,25 130,5" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="5" 
                strokeLinecap="round"
              />
            </svg>
        </div>

        {/* "MZ" - Bold Sans Font Blue */}
        <h1 className="font-display text-6xl md:text-7xl font-black text-primary italic transform -translate-y-1">
          MZ
        </h1>
      </div>

      {/* Loading Indicator */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">A carregar</p>
      </div>
      
      {/* Footer / Version */}
      <div className="absolute bottom-8 text-[10px] text-gray-300 font-medium">
        Anúncios MZ v1.0.2
      </div>
    </div>
  );
};