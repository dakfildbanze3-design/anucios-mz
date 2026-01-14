import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { CreateAdScreen } from './screens/CreateAdScreen';
import { BoostAdScreen } from './screens/BoostAdScreen';
import { AdDetailsScreen } from './screens/AdDetailsScreen';
import { FeaturedAdsScreen } from './screens/FeaturedAdsScreen';
import { TermsScreen } from './screens/TermsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SplashScreen } from './screens/SplashScreen';
import Onboarding from './screens/OnboardingScreen'; // Import Onboarding
import { AuthModal } from './screens/AuthModal';
import { InstallPWA } from './components/InstallPWA';
import { Ad, ScreenName } from './types';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Loader2, WifiOff } from 'lucide-react';
import { ToastProvider } from './components/ToastContext';

// Payment Service
const PaymentService = {
  async initiatePayment(numero: string, valor: number, provider: 'mpesa' | 'emola' | 'mkesh') {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('https://kfhgpyajrjdtuqsdabye.supabase.co/functions/v1/debito-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ 
        numero, 
        valor, 
        provider,
        idempotency_key: `pay-${Date.now()}`
      }),
    });
    return response.json();
  },
  async checkStatus(paymentId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`https://kfhgpyajrjdtuqsdabye.supabase.co/functions/v1/debito-payment?id=${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      }
    });
    return response.json();
  }
};

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

function AdDetailsWrapper({ ads, selectedAd, navigate }: { ads: Ad[], selectedAd: Ad | undefined, navigate: any }) {
  const { id } = useParams();
  const ad = ads.find(a => a.id === id) || selectedAd;
  
  if (!ad) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
      </div>
    );
  }

  return (
    <AdDetailsScreen 
      ad={ad} 
      onBack={() => navigate('/')} 
      onBoost={() => navigate('/boost')}
    />
  );
}

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [selectedAd, setSelectedAd] = useState<Ad | undefined>(undefined);
  
  // Real Data State
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  
  // Authentication State
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // UX: Remember where the user wanted to go before auth
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // 1. Splash Screen Timer and Onboarding Check
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

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

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN') {
        fetchAds();
      }
      
      if (session && pendingRoute) {
        navigate(pendingRoute);
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
        { event: 'INSERT', schema: 'public', table: 'ads' },
        (payload) => {
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
                createdAt: newAdRaw.created_at,
                category: newAdRaw.category,
                specs: newAdRaw.specs,
                contact: newAdRaw.contact,
                description: newAdRaw.description,
                views: newAdRaw.views || 0
              };
              setAds((prev) => {
                if (prev.some(a => a.id === newAdFormatted.id)) return prev;
                return [newAdFormatted, ...prev];
              });
          }).catch(e => console.error("Error in realtime session check", e));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ads' },
        (payload) => {
          const updatedAd = payload.new;
          setAds((prev) => prev.map(ad => 
            ad.id === updatedAd.id 
              ? { 
                  ...ad, 
                  isFeatured: updatedAd.is_featured, 
                  specs: updatedAd.specs, 
                  price: updatedAd.price,
                  title: updatedAd.title,
                  image: updatedAd.image,
                  images: updatedAd.images,
                  description: updatedAd.description,
                  contact: updatedAd.contact,
                  views: updatedAd.views || 0
                } 
              : ad
          ));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'ads' },
        (payload) => {
          setAds((prev) => prev.filter(ad => ad.id !== payload.old.id));
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
    const routeMap: Record<ScreenName, string> = {
      'HOME': '/',
      'PROFILE': '/profile',
      'CREATE_AD': '/create',
      'BOOST_AD': '/boost',
      'AD_DETAILS': `/ad/${ad?.id}`,
      'FEATURED_ADS': '/featured',
      'TERMS': '/terms'
    };

    const targetRoute = routeMap[screen];

    if ((screen === 'CREATE_AD' || screen === 'PROFILE') && !session) {
      setPendingRoute(targetRoute);
      setIsAuthOpen(true);
      return;
    }
    
    if (ad) setSelectedAd(ad);
    navigate(targetRoute);
  };

  const handleDeleteAdLocal = (adId: string) => {
     setAds((prev) => prev.filter(a => a.id !== adId));
  };

  // Render Splash Screen if active
  if (showSplash) {
    return <SplashScreen />;
  }

  // Render Onboarding if active
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
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
      <Routes>
        <Route path="/" element={
          <HomeScreen 
            onNavigate={handleNavigate} 
            ads={ads}
            onOpenAuth={() => setIsAuthOpen(true)}
            session={session}
          />
        } />
        
        <Route path="/profile" element={
          <ProfileScreen
            session={session}
            userAds={ads.filter(a => a.isMyAd)}
            onBack={() => navigate('/')}
            onNavigate={handleNavigate}
            onDeleteAd={handleDeleteAdLocal}
          />
        } />

        <Route path="/create" element={
          <CreateAdScreen 
            onBack={() => navigate('/')} 
            onOpenTerms={() => navigate('/terms')}
            onPublish={(data) => {
              navigate('/');
            }}
            onBoost={(ad) => {
              setSelectedAd(ad);
              navigate('/boost');
            }}
          />
        } />

        <Route path="/boost" element={
          <BoostAdScreen 
            onClose={() => navigate('/')}
            adId={selectedAd?.id} 
            onPaymentSuccess={() => {
              fetchAds();
              navigate('/');
            }}
          />
        } />

        <Route path="/ad/:id" element={
          <AdDetailsWrapper ads={ads} selectedAd={selectedAd} navigate={navigate} />
        } />

        <Route path="/featured" element={
          <FeaturedAdsScreen
            ads={ads}
            onBack={() => navigate('/')}
            onNavigate={handleNavigate}
          />
        } />

        <Route path="/terms" element={
          <TermsScreen 
            onBack={() => navigate('/create')} 
          />
        } />
      </Routes>
      
      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} />
      )}
      <InstallPWA />
    </div>
  );
}