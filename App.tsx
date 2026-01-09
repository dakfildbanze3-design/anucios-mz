import React, { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { CreateAdScreen } from './screens/CreateAdScreen';
import { BoostAdScreen } from './screens/BoostAdScreen';
import { AdDetailsScreen } from './screens/AdDetailsScreen';
import { FeaturedAdsScreen } from './screens/FeaturedAdsScreen';
import { TermsScreen } from './screens/TermsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SplashScreen } from './screens/SplashScreen'; // Import SplashScreen
import { AuthModal } from './screens/AuthModal';
import { Ad, ScreenName } from './types';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Loader2, WifiOff } from 'lucide-react';
import { ToastProvider } from './components/ToastContext';

// Helper to format "Time Ago" from timestamp
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Prevent future dates glitch
  if (seconds < 0) return "Agora mesmo";

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " anos";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " dias";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min";
  return "Agora mesmo";
};

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

function MainApp() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');
  const [selectedAd, setSelectedAd] = useState<Ad | undefined>(undefined);
  
  // Real Data State
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  
  // Authentication State
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // UX: Remember where the user wanted to go before auth
  const [pendingRoute, setPendingRoute] = useState<ScreenName | null>(null);

  // 1. Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch Initial Data and Session
  useEffect(() => {
    // Auth Session - Handle potential network errors
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data && data.session) {
          setSession(data.session);
        }
      })
      .catch(err => {
        console.warn("Auth session check failed:", err);
      });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session && pendingRoute) {
        setCurrentScreen(pendingRoute);
        setPendingRoute(null);
        setIsAuthOpen(false);
      }
    });

    // Fetch Ads
    fetchAds();

    // Setup Realtime Subscription
    const adsChannel = supabase
      .channel('public:ads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ads' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAdRaw = payload.new;
            supabase.auth.getSession().then(({ data }) => {
                const currentSession = data?.session;
                const newAdFormatted: Ad = {
                  id: newAdRaw.id,
                  title: newAdRaw.title,
                  price: newAdRaw.price,
                  currency: newAdRaw.currency,
                  location: newAdRaw.location,
                  image: newAdRaw.image,
                  images: newAdRaw.images,
                  isFeatured: newAdRaw.is_featured,
                  isMyAd: currentSession?.user.id === newAdRaw.user_id,
                  timeAgo: 'Novo',
                  createdAt: newAdRaw.created_at, // Map createdAt
                  category: newAdRaw.category,
                  specs: newAdRaw.specs,
                  contact: newAdRaw.contact,
                  description: newAdRaw.description,
                  views: newAdRaw.views
                };
                setAds((prev) => [newAdFormatted, ...prev]);
            }).catch(e => console.error("Error in realtime session check", e));
          } else if (payload.eventType === 'UPDATE') {
             fetchAds(); 
          } else if (payload.eventType === 'DELETE') {
             setAds((prev) => prev.filter(ad => ad.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      authListener.unsubscribe();
      supabase.removeChannel(adsChannel);
    };
  }, [pendingRoute]); 

  const fetchAds = async () => {
    try {
      setLoadingAds(true);
      setConnectionError(false);
      
      let currentSession = null;
      try {
        const { data } = await supabase.auth.getSession();
        currentSession = data.session;
      } catch (e) {
        console.warn("Could not fetch session for ad ownership check", e);
      }

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedAds: Ad[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          currency: item.currency || 'MT',
          location: item.location || 'Moçambique',
          image: item.image,
          images: item.images,
          isFeatured: item.is_featured,
          isMyAd: currentSession?.user?.id === item.user_id,
          timeAgo: getTimeAgo(item.created_at),
          createdAt: item.created_at, // Map createdAt
          category: item.category,
          specs: item.specs,
          contact: item.contact,
          description: item.description,
          views: item.views || 0
        }));
        setAds(formattedAds);
      }
    } catch (error: any) {
      console.error('Error fetching ads:', error);
      if (error.message === 'Failed to fetch' || !navigator.onLine) {
        setConnectionError(true);
      }
    } finally {
      setLoadingAds(false);
    }
  };

  const handleNavigate = (screen: ScreenName, ad?: Ad) => {
    if ((screen === 'CREATE_AD' || screen === 'PROFILE') && !session) {
      setPendingRoute(screen);
      setIsAuthOpen(true);
      return;
    }
    if (ad) setSelectedAd(ad);
    setCurrentScreen(screen);
  };

  const handleDeleteAdLocal = (adId: string) => {
     setAds((prev) => prev.filter(a => a.id !== adId));
  };

  // Render Splash Screen if active
  if (showSplash) {
    return <SplashScreen />;
  }

  // Normal Loading State (only if data is still loading AFTER splash is done, usually splash covers this)
  if (loadingAds && ads.length === 0 && !connectionError) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
      </div>
    );
  }

  if (connectionError && ads.length === 0) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-4 text-center">
        <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <WifiOff size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Erro de Conexão</h2>
        <p className="text-gray-500 max-w-xs mb-8">Não foi possível conectar ao servidor. Verifique sua internet.</p>
        <button 
          onClick={fetchAds}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-light min-h-screen font-display text-text-main relative">
      {currentScreen === 'HOME' && (
        <HomeScreen 
          onNavigate={handleNavigate} 
          ads={ads}
          onOpenAuth={() => setIsAuthOpen(true)}
          session={session}
        />
      )}
      
      {currentScreen === 'PROFILE' && (
        <ProfileScreen
          session={session}
          userAds={ads.filter(a => a.isMyAd)}
          onBack={() => setCurrentScreen('HOME')}
          onNavigate={handleNavigate}
          onDeleteAd={handleDeleteAdLocal}
        />
      )}

      {currentScreen === 'CREATE_AD' && (
        <CreateAdScreen 
          onBack={() => setCurrentScreen('HOME')} 
          onOpenTerms={() => setCurrentScreen('TERMS')}
          onPublish={(data) => {
            setCurrentScreen('HOME');
          }}
          onBoost={(ad) => {
            setSelectedAd(ad);
            setCurrentScreen('BOOST_AD');
          }}
        />
      )}

      {currentScreen === 'BOOST_AD' && (
        <BoostAdScreen 
          onClose={() => {
            if (selectedAd) {
               setCurrentScreen('AD_DETAILS');
            } else {
               setCurrentScreen('HOME');
            }
          }}
          adId={selectedAd?.id} 
          onPaymentSuccess={() => {
            if (selectedAd) {
               fetchAds();
               setCurrentScreen('AD_DETAILS');
            } else {
               setCurrentScreen('HOME');
            }
          }}
        />
      )}

      {currentScreen === 'AD_DETAILS' && (
        <AdDetailsScreen 
          ad={ads.find(a => a.id === selectedAd?.id) || selectedAd!} 
          onBack={() => setCurrentScreen('HOME')} 
          onBoost={() => setCurrentScreen('BOOST_AD')}
        />
      )}

      {currentScreen === 'FEATURED_ADS' && (
        <FeaturedAdsScreen
          ads={ads}
          onBack={() => setCurrentScreen('HOME')}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'TERMS' && (
        <TermsScreen 
          onBack={() => setCurrentScreen('CREATE_AD')} 
        />
      )}
      
      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} />
      )}
    </div>
  );
}