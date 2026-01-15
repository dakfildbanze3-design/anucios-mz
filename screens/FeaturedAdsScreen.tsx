import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ListFilter, 
  ShieldCheck, 
  Car, 
  Home, 
  Smartphone, 
  Star, 
  MapPin, 
  Plus,
  MessageCircle,
  Info,
  XCircle
} from 'lucide-react';
import { Ad, ScreenName } from '../types';

interface FeaturedAdsScreenProps {
  ads: Ad[];
  onBack: () => void;
  onNavigate: (screen: ScreenName, ad?: Ad) => void;
}

export const FeaturedAdsScreen: React.FC<FeaturedAdsScreenProps> = ({ ads, onBack, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  const featuredAds = ads.filter(ad => ad.isFeatured);
  
  const filteredAds = featuredAds.filter(ad => 
    activeCategory === 'all' || ad.category === activeCategory
  );

  const categories = [
    { id: 'all', label: 'Todos', icon: null },
    { id: 'vehicle', label: 'Veículos', icon: Car },
    { id: 'real-estate', label: 'Imóveis', icon: Home },
    { id: 'electronics', label: 'Eletrônicos', icon: Smartphone },
  ];

  const handleWhatsAppClick = (e: React.MouseEvent, ad: Ad) => {
    e.stopPropagation();
    const number = ad.contact || '258841234567';
    const message = encodeURIComponent(`Olá, vi o seu anúncio "${ad.title}" no Classificados MZ.`);
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  return (
    <div className="relative flex h-full w-full flex-col min-h-screen bg-background-light font-display">
      {/* TopAppBar */}
      <div className="sticky top-0 z-50 flex items-center bg-surface-light p-4 pb-3 justify-between shadow-sm border-b border-gray-100">
         <div className="max-w-[1920px] mx-auto w-full flex items-center justify-between">
            <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 mr-2"
            >
            <ArrowLeft size={24} />
            </button>
            <h2 className="text-text-main text-2xl md:text-3xl font-hand font-normal leading-tight tracking-wide flex-1 pb-1">
            Anúncios Destacados
            </h2>
            <div className="flex w-12 items-center justify-end">
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-transparent text-text-main hover:bg-gray-100 transition-colors">
                <ListFilter size={24} />
            </button>
            </div>
         </div>
      </div>

      <div className="max-w-[1920px] mx-auto w-full flex-1">
        {/* HeaderImage / CTA */}
        <div className="px-4 py-4">
            <div 
            onClick={() => onNavigate('BOOST_AD')}
            className="relative overflow-hidden rounded-xl bg-primary shadow-lg group cursor-pointer transition-transform hover:scale-[1.005]"
            >
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80")' }}
            ></div>
            <div className="relative flex flex-col justify-end p-5 min-h-[160px] bg-gradient-to-t from-primary/90 to-transparent">
                <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="text-white fill-white/20" size={20} />
                    <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Área Premium</span>
                </div>
                <p className="text-white tracking-tight text-3xl font-display font-bold leading-tight">
                    Quer vender mais rápido? Destaque seu anúncio aqui.
                </p>
                <button 
                  onClick={() => setShowPaymentInfo(true)}
                  className="mt-2 w-fit rounded-full bg-white text-primary px-4 py-2 text-sm font-bold shadow-sm hover:bg-gray-50"
                >
                    Saber mais
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Chips */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map((cat) => (
            <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 transition-colors ${
                activeCategory === cat.id 
                    ? 'bg-primary text-white' 
                    : 'bg-white border border-gray-200 text-text-main hover:bg-gray-50'
                }`}
            >
                {cat.icon && <cat.icon size={18} />}
                <span className="text-sm font-medium leading-normal">{cat.label}</span>
            </button>
            ))}
        </div>

        {/* Content Feed Grid - Expanded columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 pb-24">
            {filteredAds.map((ad) => (
            <div 
                key={ad.id}
                onClick={() => onNavigate('AD_DETAILS', ad)}
                className="group flex flex-col sm:flex-row md:flex-col items-stretch gap-4 rounded-xl bg-white p-3 shadow-md border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
                <div 
                className="relative w-full sm:w-1/3 md:w-full h-48 sm:h-auto md:h-48 bg-center bg-no-repeat bg-cover rounded-lg overflow-hidden shrink-0" 
                style={{ backgroundImage: `url(${ad.image})` }}
                >
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 z-10">
                    <Star size={12} className="fill-white" />
                    DESTAQUE
                </div>
                </div>
                
                <div className="flex flex-col justify-between flex-1 gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                    <p className="text-text-main text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {ad.title}
                    </p>
                    </div>
                    <p className="text-primary text-base font-bold leading-normal">
                    {ad.currency} {ad.price.toLocaleString('pt-PT')}
                    </p>
                    <div className="flex items-center gap-1 text-text-sub text-xs">
                    <MapPin size={14} />
                    <span>{ad.location.split(',')[0]}</span>
                    <span className="mx-1">•</span>
                    <span>{ad.timeAgo}</span>
                    </div>
                </div>
                
                <button 
                    onClick={(e) => handleWhatsAppClick(e, ad)}
                    className="flex w-full cursor-pointer items-center justify-center rounded-lg h-9 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-green-700 font-semibold gap-2 text-sm transition-colors active:scale-95"
                >
                    <MessageCircle size={18} />
                    WhatsApp
                </button>
                </div>
            </div>
            ))}
            
            {filteredAds.length === 0 && (
            <div className="col-span-full text-center py-10 text-text-sub">
                <p>Nenhum anúncio destacado nesta categoria.</p>
            </div>
            )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="md:hidden fixed bottom-6 z-40 right-1/2 translate-x-1/2 sm:right-4 sm:translate-x-0 w-full max-w-md pointer-events-none flex justify-end px-4">
        <button 
          onClick={() => onNavigate('CREATE_AD')}
          className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-xl hover:bg-blue-600 transition-colors active:scale-90 pointer-events-auto"
        >
          <Plus size={30} />
        </button>
      </div>
      {/* Payment Info Modal */}
      {showPaymentInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentInfo(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Como funciona o Destaque?</h3>
              <button onClick={() => setShowPaymentInfo(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Star size={20} className="fill-primary" />
                  <h4 className="font-bold uppercase text-xs tracking-wider">Visibilidade Máxima</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ao destacar um anúncio, ele será exibido no topo de todas as pesquisas e categorias, garantindo até 10x mais visualizações e contactos.
                </p>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <Star size={20} className="fill-amber-500" />
                  <h4 className="font-bold uppercase text-xs tracking-wider">Como Pagar?</h4>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-gray-700 font-medium">
                    Aceitamos pagamentos via:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-amber-500"></div>
                      M-Pesa (Vodacom)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-amber-500"></div>
                      e-Mola (Movitel)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-amber-500"></div>
                      Conta Móvel (BCI)
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <MessageCircle size={20} />
                  <h4 className="font-bold uppercase text-xs tracking-wider">Ativação</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Após o pagamento, envie o comprovativo para o nosso suporte no WhatsApp. A ativação é feita manualmente em menos de 10 minutos.
                </p>
              </section>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => {
                  window.open('https://wa.me/258855767005', '_blank');
                  setShowPaymentInfo(false);
                }}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <MessageCircle size={20} />
                Falar com Suporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};