import React from 'react';
import { Loader2 } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500">
      
      {/* Logo Container */}
      <div className="relative flex items-center gap-3 mb-12 animate-in zoom-in-95 duration-1000 fade-in">
        <div className="relative">
          <span className="font-hand text-5xl md:text-6xl text-[#111318] leading-none">Anúncios</span>
          <svg viewBox="0 0 100 20" className="absolute -bottom-3 -left-1 w-full h-auto text-[#111318] -rotate-1 opacity-90">
              <path d="M2,10 Q40,16 90,4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-display text-5xl md:text-6xl font-black text-primary italic">MZ</span>
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