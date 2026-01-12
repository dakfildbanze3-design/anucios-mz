import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 flex items-center gap-4 max-w-[calc(100vw-3rem)]">
        <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
          <Download size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm truncate">Instalar App</h3>
          <p className="text-gray-500 text-xs truncate">Aceda mais rápido e offline!</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleInstallClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors active:scale-95 shadow-md shadow-blue-500/20"
          >
            Instalar
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};