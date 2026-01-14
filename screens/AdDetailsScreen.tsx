import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Info, 
  Calendar, 
  Eye, 
  Fuel, 
  Settings, 
  Gauge, 
  Map, 
  MapPin, 
  Phone, 
  Rocket,
  ExternalLink,
  MessageCircle,
  Star,
  Camera,
  Palette,
  X,
  Facebook,
  Twitter,
  Mail,
  Link as LinkIcon,
  Copy,
  Smartphone
} from 'lucide-react';
import { Ad } from '../types';
import { useToast } from '../components/ToastContext';
import { supabase } from '../lib/supabase';

interface AdDetailsScreenProps {
  ad: Ad;
  onBack: () => void;
  onBoost: () => void;
}

export const AdDetailsScreen: React.FC<AdDetailsScreenProps> = ({ ad, onBack, onBoost }) => {
  const { showToast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  useEffect(() => {
    // Increment view count in Supabase
    const incrementViews = async () => {
      try {
        const { error } = await supabase.rpc('increment_views', { ad_id: ad.id });
        if (error) {
          // Fallback if RPC doesn't exist (legacy/testing)
          await supabase
            .from('ads')
            .update({ views: (ad.views || 0) + 1 })
            .eq('id', ad.id);
        }
      } catch (err) {
        console.error('Error incrementing views:', err);
      }
    };

    incrementViews();
  }, [ad.id]);

  const images = ad.images && ad.images.length > 0 
    ? ad.images 
    : [ad.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

  // Construct Share Data
  const shareUrl = `${window.location.origin}?ad=${ad.id}`;
  const shareText = `Veja este anúncio no Anúncios MZ: ${ad.title}`;

  const handleOpenMap = () => {
    const query = encodeURIComponent(`${ad.location}, Moçambique`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const contactNumber = ad.contact || '258841234567';

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Olá, vi o anúncio "${ad.title}" no Anúncios MZ e gostaria de mais informações.`);
    window.open(`https://wa.me/${contactNumber}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${contactNumber}`, '_self');
  };

  const handleShare = async () => {
    const shareData = {
      title: ad.title,
      text: shareText,
      url: shareUrl
    };

    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast("Link copiado!", "success");
  };

  const openSocial = (url: string, network: string) => {
    window.open(url, '_blank');
  };

  const mozDate = ad.createdAt 
      ? new Date(ad.createdAt).toLocaleString('pt-PT', {
          timeZone: 'Africa/Maputo',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : null;

  return (
    <div className="min-h-screen bg-background-light md:py-8 font-display">
      <div className="max-w-[1800px] mx-auto bg-white shadow-xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[80vh] relative">
        
        {/* LEFT COLUMN: IMAGE GRID */}
        <div className="w-full md:w-3/5 bg-gray-50 p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <button 
                onClick={onBack}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                <ArrowLeft size={24} />
                </button>
                
                <div className="flex gap-2">
                    <button 
                    onClick={handleShare}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                    <Share2 size={24} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 grid-rows-2 gap-2 aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200">
                {/* Main large image */}
                <div 
                    className="col-span-2 row-span-2 relative cursor-zoom-in group"
                    onClick={() => {
                        setActiveImageIndex(0);
                        setShowFullScreen(true);
                    }}
                >
                    <img 
                        src={images[0]} 
                        alt={`${ad.title} - 1`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    
                    {ad.isFeatured && (
                      <div className="absolute top-4 left-4">
                        <div className="flex h-7 items-center justify-center gap-x-1.5 rounded-full bg-amber-500 px-3 py-1 shadow-md border border-amber-400/50 backdrop-blur-md">
                            <Star className="text-white fill-white" size={14} />
                            <p className="text-white text-xs font-bold uppercase tracking-wider">Destaque</p>
                        </div>
                      </div>
                    )}
                </div>

                {/* Smaller images side grid */}
                {images.slice(1, 5).map((img, idx) => (
                    <div 
                        key={idx + 1}
                        className="relative cursor-zoom-in group overflow-hidden"
                        onClick={() => {
                            setActiveImageIndex(idx + 1);
                            setShowFullScreen(true);
                        }}
                    >
                        <img 
                            src={img} 
                            alt={`${ad.title} - ${idx + 2}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        
                        {/* More images overlay on the last slot */}
                        {idx === 3 && images.length > 5 && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                <span className="text-2xl font-black">+{images.length - 5}</span>
                                <span className="text-[10px] font-bold uppercase">Ver todas</span>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Fallback empty slots to maintain grid shape if less than 5 images */}
                {images.length < 5 && Array.from({ length: 5 - images.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-100 hidden sm:block"></div>
                ))}
            </div>
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="w-full md:w-2/5 flex flex-col h-full md:max-h-[calc(100vh-4rem)] relative bg-white">
            <div className="flex-1 overflow-y-auto p-5 pb-32 md:pb-5">
                <div className="hidden md:flex justify-end mb-4">
                     <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-primary transition-colors border border-gray-100 text-sm font-medium"
                    >
                        <Share2 size={16} />
                        <span>Partilhar</span>
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-text-main text-2xl md:text-3xl font-bold leading-tight tracking-tight">{ad.title}</h1>
                        <h2 className="text-primary text-[28px] font-bold leading-tight pt-2">
                        {ad.currency} {ad.price.toLocaleString('pt-PT')}
                        </h2>
                        
                        <div className="flex items-center gap-2 mt-3 text-text-sub text-sm">
                        <Calendar size={18} />
                        <span>{mozDate ? mozDate : ad.timeAgo}</span>
                        
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <Eye size={18} />
                        <span>{ad.views || 0} visualizações</span>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {ad.specs && (
                        <div>
                        <h3 className="text-text-main text-base font-semibold mb-3">Especificações</h3>
                        <div className="flex gap-2 flex-wrap">
                            {ad.specs.fuel && (
                                <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-50 px-3 border border-gray-100">
                                <Fuel className="text-text-sub" size={18} />
                                <p className="text-text-main text-sm font-medium">{ad.specs.fuel}</p>
                                </div>
                            )}
                            {ad.specs.transmission && (
                                <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-50 px-3 border border-gray-100">
                                <Settings className="text-text-sub" size={18} />
                                <p className="text-text-main text-sm font-medium">{ad.specs.transmission}</p>
                                </div>
                            )}
                            {ad.specs.mileage && (
                                <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-50 px-3 border border-gray-100">
                                <Gauge className="text-text-sub" size={18} />
                                <p className="text-text-main text-sm font-medium">{ad.specs.mileage}</p>
                                </div>
                            )}
                            {ad.specs.design && (
                                <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-50 px-3 border border-gray-100">
                                <Palette className="text-text-sub" size={18} />
                                <p className="text-text-main text-sm font-medium">{ad.specs.design}</p>
                                </div>
                            )}
                            <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-50 px-3 border border-gray-100">
                            <Map className="text-text-sub" size={18} />
                            <p className="text-text-main text-sm font-medium">{ad.location}</p>
                            </div>
                        </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-text-main text-base font-semibold mb-2">Descrição</h3>
                        <div className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                        {ad.description || "Sem descrição disponível."}
                        </div>
                    </div>

                    <div 
                        onClick={handleOpenMap}
                        className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden relative cursor-pointer group active:scale-[0.99] transition-all border border-gray-200"
                    >
                        <div 
                        className="w-full h-full bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity" 
                        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=60)` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-sm group-hover:shadow-md transition-shadow">
                            <MapPin className="text-primary" size={18} />
                            <span className="text-sm font-semibold text-text-main">Ver no Mapa</span>
                        </div>
                        </div>
                    </div>
                    
                    <div className="h-4 md:hidden"></div>
                </div>
            </div>

            <div className="fixed md:absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 py-4 pb-8 md:pb-4 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
                <div className="flex flex-col gap-3">
                {ad.isMyAd ? (
                    <>
                    {ad.isFeatured ? (
                        <div className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 rounded-xl h-14 font-bold text-lg border border-green-200">
                        <Star className="fill-green-700" size={24} />
                        <span>Anúncio Destacado</span>
                        </div>
                    ) : (
                        <>
                        <button 
                            onClick={onBoost}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl h-14 font-bold text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
                        >
                            <Rocket size={24} />
                            <span>Destacar Anúncio</span>
                        </button>
                        <div className="w-full bg-yellow-50 rounded-xl p-3 border border-yellow-200 flex items-center justify-center gap-2 text-sm text-yellow-800">
                            <Info size={16} />
                            <span>Aumente suas vendas a partir de 20 MT</span>
                        </div>
                        </>
                    )}
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleCall}
                        className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl h-14 font-bold text-base transition-all active:scale-[0.98]"
                    >
                        <Phone size={20} />
                        <span>Ligar</span>
                    </button>
                    <button 
                        onClick={handleWhatsApp}
                        className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1faa53] text-white rounded-xl h-14 font-bold text-base shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
                    >
                        <MessageCircle size={22} />
                        <span>WhatsApp</span>
                    </button>
                    </div>
                )}
                </div>
            </div>
        </div>
      </div>

      {/* FULL SCREEN IMAGE VIEWER */}
      {showFullScreen && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-200"
          onClick={() => setShowFullScreen(false)}
        >
          <div className="absolute top-0 left-0 w-full flex items-center justify-between p-6 pt-10">
            <div className="text-white font-bold text-lg">
              {activeImageIndex + 1} / {images.length}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowFullScreen(false);
              }}
              className="size-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <X size={32} />
            </button>
          </div>

          <div 
            className="w-full h-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${images[activeImageIndex]})` }}
          />
          
          {images.length > 1 && (
            <div className="absolute bottom-10 left-0 w-full flex items-center justify-center gap-10 px-6">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
                }}
                className="size-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90"
              >
                <ArrowLeft size={32} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
                }}
                className="size-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90"
              >
                <ArrowLeft size={32} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SHARE MODAL (Fallback for Desktop) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-lg">Partilhar Anúncio</h3>
               <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                  <X size={20} />
               </button>
            </div>
            
            <div className="p-6 grid grid-cols-4 gap-6 justify-items-center">
               <button 
                  onClick={() => openSocial(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, 'Facebook')}
                  className="flex flex-col items-center gap-2 group w-full"
               >
                  <div className="size-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                     <Facebook size={24} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">Facebook</span>
               </button>

               <button 
                  onClick={() => openSocial(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, 'Twitter')}
                  className="flex flex-col items-center gap-2 group w-full"
               >
                  <div className="size-12 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white shadow-lg shadow-sky-200 group-hover:scale-110 transition-transform">
                     <Twitter size={24} />
                  </div>
                   <span className="text-xs font-semibold text-gray-600">Twitter</span>
               </button>

               <button 
                   onClick={() => openSocial(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, 'WhatsApp')}
                   className="flex flex-col items-center gap-2 group w-full"
               >
                  <div className="size-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                     <MessageCircle size={24} />
                  </div>
                   <span className="text-xs font-semibold text-gray-600">WhatsApp</span>
               </button>

               <button 
                  onClick={() => openSocial(`https://www.tiktok.com/`, 'TikTok')}
                  className="flex flex-col items-center gap-2 group w-full"
               >
                  <div className="size-12 rounded-full bg-black flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform">
                     <Smartphone size={24} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">TikTok</span>
               </button>
            </div>

            <div className="px-6 pb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Copiar Link</p>
                <div 
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-primary/50 hover:bg-blue-50/50 transition-colors group" 
                  onClick={handleCopyLink}
                >
                   <div className="p-1.5 bg-white rounded-lg border border-gray-200 text-gray-400 group-hover:text-primary transition-colors">
                      <LinkIcon size={16} />
                   </div>
                   <p className="flex-1 text-sm text-gray-600 truncate font-medium">{shareUrl}</p>
                   <div className="flex items-center gap-1 text-primary font-bold text-sm bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                      <Copy size={12} />
                      <span>Copiar</span>
                   </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};