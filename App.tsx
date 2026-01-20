import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';

import HomeScreen from './screens/HomeScreen';
import CreateAdScreen from './screens/CreateAdScreen';
import BoostAdScreen from './screens/BoostAdScreen';
import AdDetailsScreen from './screens/AdDetailsScreen';
import FeaturedAdsScreen from './screens/FeaturedAdsScreen';
import TermsScreen from './screens/TermsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SplashScreen from './screens/SplashScreen';
import PaymentDescriptionsScreen from './screens/PaymentDescriptionsScreen';
import Onboarding from './screens/OnboardingScreen';
import AuthModal from './screens/AuthModal';

import InstallPWA from './components/InstallPWA';
import { ToastProvider } from './components/ToastContext';

import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Loader2, WifiOff } from 'lucide-react';

import { Ad, ScreenName } from './types';

/* =========================
   HELPERS
========================= */

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Agora mesmo';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} dias`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} meses`;
  return `${Math.floor(seconds / 31536000)} anos`;
};

/* =========================
   APP
========================= */

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

/* =========================
   WRAPPERS
========================= */

function AdDetailsWrapper({ ads, navigate }: { ads: Ad[]; navigate: any }) {
  const { id } = useParams();
  const ad = ads.find(a => a.id === id);

  if (!ad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return <AdDetailsScreen ad={ad} onBack={() => navigate('/')} />;
}

function BoostWrapper({ ads, navigate, fetchAds }: any) {
  const { id } = useParams();
  const ad = ads.find((a: Ad) => a.id === id);

  return (
    <BoostAdScreen
      adId={ad?.id}
      onClose={() => navigate('/')}
      onPaymentSuccess={() => {
        fetchAds();
        navigate('/');
      }}
    />
  );
}

/* =========================
   MAIN APP
========================= */

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState<Session | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  /* SPLASH */
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  /* AUTH */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });

    fetchAds();
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /* FETCH ADS */
  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(false);

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: Ad[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        currency: item.currency || 'MT',
        location: item.location || 'Moçambique',
        image: item.image,
        images: item.images,
        category: item.category,
        specs: item.specs,
        contact: item.contact,
        description: item.description,
        views: item.views || 0,
        isFeatured: item.is_featured,
        createdAt: item.created_at,
        timeAgo: getTimeAgo(item.created_at),
        isMyAd: session?.user?.id === item.user_id,
        user: {
          name: 'Utilizador',
          avatar: item.user_avatar || ''
        }
      }));

      setAds(formatted);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /* LOADING */
  if (showSplash) return <SplashScreen />;

  if (loading && ads.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <WifiOff size={48} />
        <button onClick={fetchAds}>Tentar novamente</button>
      </div>
    );
  }

  /* ROUTES */
  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              ads={ads}
              session={session}
              onNavigate={(screen: ScreenName) => {
                if (!session && (screen === 'PROFILE' || screen === 'CREATE_AD')) {
                  setAuthMode('login');
                  setShowAuth(true);
                  return;
                }

                const map: any = {
                  HOME: '/',
                  PROFILE: '/profile',
                  CREATE_AD: '/create',
                  FEATURED_ADS: '/featured'
                };

                navigate(map[screen]);
              }}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProfileScreen
              session={session}
              userAds={ads.filter(a => a.isMyAd)}
              onBack={() => navigate('/')}
            />
          }
        />

        <Route path="/create" element={<CreateAdScreen onBack={() => navigate('/')} />} />
        <Route path="/ad/:id" element={<AdDetailsWrapper ads={ads} navigate={navigate} />} />
        <Route path="/boost/:id" element={<BoostWrapper ads={ads} navigate={navigate} fetchAds={fetchAds} />} />
        <Route path="/featured" element={<FeaturedAdsScreen ads={ads} onBack={() => navigate('/')} />} />
        <Route path="/terms" element={<TermsScreen onBack={() => navigate('/')} />} />
        <Route path="/payment-methods" element={<PaymentDescriptionsScreen onBack={() => navigate(-1)} />} />
      </Routes>

      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />}
      <InstallPWA />
    </div>
  );
}
