import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Zap, 
  MapPin, 
  Phone, 
  Clock, 
  Rocket,
  Star,
  MoreVertical,
  Globe,
  BookOpen,
  MessageCircle,
  Info,
  X,
  CheckCircle2,
  Plus,
  User,
  LogOut,
  Crown,
  LayoutGrid,
  Palette
} from 'lucide-react';
import { Ad, ScreenName } from '../types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface HomeScreenProps {
  onNavigate: (screen: ScreenName, ad?: Ad) => void;
  ads: Ad[];
  onOpenAuth: () => void;
  session: Session | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, ads, onOpenAuth, session }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Menu States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'tutorial' | 'about'>('tutorial');
  const [currentLanguage, setCurrentLanguage] = useState<'PT' | 'EN'>('PT');

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'vehicle', label: 'Veículos' },
    { id: 'real-estate', label: 'Imóveis' },
    { id: 'electronics', label: 'Eletrônicos' },
    { id: 'other', label: 'Outros' }
  ];

  const filteredAds = ads.filter(ad => {
    const matchesCategory = activeCategory === 'all' || ad.category === activeCategory;
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ad.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredAds = filteredAds.filter(ad => ad.isFeatured);
  const recentAds = filteredAds.filter(ad => !ad.isFeatured);

  const handleSupportClick = () => {
    window.open('https://wa.me/258855767005', '_blank');
    setIsMenuOpen(false);
  };

  const handleWhatsAppClick = (e: React.MouseEvent, ad: Ad) => {
    e.stopPropagation();
    const number = ad.contact || '258841234567';
    const message = encodeURIComponent(`Olá, vi o seu anúncio "${ad.title}" no Anúncios MZ.`);
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'PT' ? 'EN' : 'PT');
  };

  const openHelpModal = (tab: 'tutorial' | 'about') => {
    setActiveModalTab(tab);
    setIsHelpModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  // User Metadata Helper
  const userAvatar = session?.user?.user_metadata?.avatar_url;
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];

  return (
    <div className="flex flex-col min-h-screen pb-28 relative bg-background-light">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-surface-light border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 lg:hidden">
                <Menu size={24} />
              </button>
              
              {/* BRAND LOGO */}
              <div className="flex items-center gap-1.5 pt-1 cursor-pointer select-none" onClick={() => setActiveCategory('all')}>
                <div className="relative">
                  <span className="font-hand text-2xl md:text-3xl text-[#111318] leading-none">Anúncios</span>
                  <svg viewBox="0 0 100 20" className="absolute -bottom-2 -left-1 w-full h-auto text-[#111318] -rotate-1 opacity-90">
                     <path d="M2,10 Q40,16 90,4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-display text-2xl md:text-3xl font-black text-primary italic">MZ</span>
              </div>
            </div>
            
            {/* Desktop Search - Hidden on mobile, visible on lg */}
            <div className="hidden lg:block flex-1 max-w-xl px-8">
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Search size={20} />
                </span>
                <input 
                  className="w-full py-2.5 pl-10 pr-4 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary focus:bg-white placeholder-gray-500 transition-all shadow-inner outline-none" 
                  placeholder="Pesquisar anúncios..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Desktop Create Button */}
              <button 
                onClick={() => onNavigate('CREATE_AD')}
                className="hidden md:flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus size={20} />
                <span>Anunciar</span>
              </button>

              <div className="relative">
                {/* Profile Icon Trigger */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group"
                >
                  <div className={`size-9 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-200 ${session ? 'bg-white' : 'bg-gray-100 text-gray-500'}`}>
                    {session && userAvatar ? (
                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={20} className={session ? "text-primary fill-primary/10" : "fill-current"} />
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMenuOpen(false)} 
                    />
                    <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      
                      {/* Auth Section in Menu */}
                      <div className="px-4 py-4 mb-2 bg-gray-50/50 border-b border-gray-100">
                        {session ? (
                          <div className="flex items-center gap-3">
                             <div className="size-12 rounded-full bg-white border border-gray-200 overflow-hidden shadow-sm shrink-0 flex items-center justify-center text-primary">
                                {userAvatar ? (
                                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={24} className="fill-blue-50" />
                                )}
                             </div>
                             <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                             </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">Entre para gerenciar seus anúncios</p>
                            <button 
                              onClick={() => {
                                setIsMenuOpen(false);
                                onOpenAuth();
                              }}
                              className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors"
                            >
                              Entrar / Criar Conta
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      
                      {session && (
                        <>
                            <button 
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onNavigate('PROFILE');
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 text-sm font-medium text-primary bg-blue-50/50 border-b border-blue-100 mb-1"
                            >
                                <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                                    <LayoutGrid size={18} />
                                </div>
                                <span>Meu Perfil & Anúncios</span>
                            </button>
                        </>
                      )}

                      <button 
                        onClick={toggleLanguage}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-text-main"
                      >
                        <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                          <Globe size={18} />
                        </div>
                        <div className="flex-1">
                          <p>Idioma / Language</p>
                          <p className="text-xs text-text-sub">{currentLanguage === 'PT' ? 'Português' : 'English'}</p>
                        </div>
                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{currentLanguage}</span>
                      </button>
                      
                      <div className="h-px bg-gray-100 my-1 mx-4"></div>

                      <button 
                        onClick={() => openHelpModal('tutorial')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-text-main"
                      >
                         <div className="size-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                          <BookOpen size={18} />
                        </div>
                        <span>Tutorial / Como usar</span>
                      </button>

                      <button 
                        onClick={handleSupportClick}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-text-main"
                      >
                        <div className="size-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <MessageCircle size={18} />
                        </div>
                        <div>
                          <p>Suporte</p>
                          <p className="text-xs text-text-sub">Fale no WhatsApp</p>
                        </div>
                      </button>

                      <button 
                         onClick={() => openHelpModal('about')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-text-main"
                      >
                        <div className="size-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                          <Info size={18} />
                        </div>
                        <span>Sobre & Confiança</span>
                      </button>

                      {session && (
                        <>
                          <div className="h-px bg-gray-100 my-1 mx-4"></div>
                          <button 
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600"
                          >
                            <div className="size-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                              <LogOut size={18} />
                            </div>
                            <span>Sair da Conta</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="px-4 pb-3 lg:hidden">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-primary transition-colors">
                <Search size={20} />
              </span>
              <input 
                className="w-full py-3 pl-10 pr-4 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary focus:bg-white placeholder-gray-500 transition-all shadow-inner outline-none" 
                placeholder="O que você procura?" 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1920px] mx-auto w-full">
        {/* Categories Chips */}
        <div className="flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar sticky top-[116px] lg:top-[65px] z-40 bg-background-light/95 backdrop-blur-sm">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary/50 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Section */}
        {featuredAds.length > 0 && (
          <section className="mt-2 px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                <Zap className="text-amber-500 fill-amber-500" size={24} />
                Destaques
              </h2>
              <button 
                onClick={() => onNavigate('FEATURED_ADS')}
                className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
              >
                Ver todos
              </button>
            </div>
            
            {/* Grid for desktop, Scroll for mobile. Adjusted columns for wider screens */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:overflow-visible">
              {featuredAds.map((ad) => (
                <div 
                  key={ad.id}
                  onClick={() => onNavigate('AD_DETAILS', ad)}
                  className="min-w-[280px] w-[280px] md:w-full bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden group flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-40 md:h-48 w-full overflow-hidden">
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-amber-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10 uppercase tracking-wider border border-amber-200 flex items-center gap-1">
                      <Star size={10} className="fill-amber-600" />
                      Destaque
                    </div>

                    {/* Badge Seu Anúncio in Featured */}
                    {ad.isMyAd && (
                        <div className="absolute top-3 right-3 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md z-10">
                            Seu Anúncio
                        </div>
                    )}

                    <div 
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500 ease-out" 
                      style={{ backgroundImage: `url(${ad.image})` }}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-1">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{ad.title}</h3>
                    </div>
                    {ad.specs?.design && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Palette size={12} />
                        <span>{ad.specs.design}</span>
                      </div>
                    )}
                    <p className="text-xl font-black text-primary mb-3">
                      {ad.currency} {ad.price.toLocaleString('pt-PT')}
                    </p>
                    
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={14} />
                        <span className="truncate">{ad.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                        <Phone size={14} />
                        <span>{ad.contact || '+258 84 123 4567'}</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <button 
                        onClick={(e) => handleWhatsAppClick(e, ad)}
                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1faa53] text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Feed - Recents */}
        <section className="mt-4 px-4 flex-1">
          <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            {activeCategory === 'all' ? 'Recentes' : categories.find(c => c.id === activeCategory)?.label}
          </h2>
          
          {recentAds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              {featuredAds.length > 0 ? (
                <>
                   <CheckCircle2 size={48} className="mb-4 text-gray-300" />
                   <p className="text-lg font-semibold">Tudo visto!</p>
                   <p className="text-sm">Veja os destaques acima.</p>
                </>
              ) : (
                <>
                  <Search size={48} className="mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">Nenhum anúncio encontrado</p>
                  <p className="text-sm">Tente mudar os filtros ou a pesquisa.</p>
                </>
              )}
            </div>
          ) : (
            // Responsive Grid for Recent Ads - Expanded columns
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
              {recentAds.map((ad) => (
                <div 
                  key={ad.id}
                  onClick={() => onNavigate('AD_DETAILS', ad)}
                  className={`relative p-3 rounded-2xl shadow-sm border flex sm:flex-col gap-4 h-auto min-h-36 sm:min-h-0 cursor-pointer hover:shadow-md transition-all duration-300 group ${ad.isMyAd ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}
                >
                  {ad.isMyAd && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <span className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md">Seu Anúncio</span>
                    </div>
                  )}
                  
                  <div className="w-32 h-32 sm:w-full sm:h-48 shrink-0 rounded-xl bg-gray-100 overflow-hidden relative">
                    <div 
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                      style={{ backgroundImage: `url(${ad.image})` }}
                    />
                  </div>
                  
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{ad.title}</h3>
                      {ad.specs?.design && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Palette size={12} />
                            <span>{ad.specs.design}</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1 mt-1.5">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {ad.timeAgo}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                          <Phone size={12} />
                          <span>{ad.contact || '+258 84 123 4567'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:mt-4">
                      <p className="text-base font-bold text-primary">
                        {ad.currency} {ad.price.toLocaleString('pt-PT')}
                      </p>
                      
                      {ad.isMyAd ? (
                        <>
                           {!ad.isFeatured ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('BOOST_AD', ad);
                              }}
                              className="w-full mt-2 group flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-1.5 px-3 rounded-lg shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                            >
                              <div className="flex items-center gap-1.5">
                                <Rocket size={14} />
                                <span className="text-xs font-bold">Destacar</span>
                              </div>
                            </button>
                           ) : (
                             <div className="w-full mt-2 flex items-center justify-center gap-1.5 bg-amber-50 text-amber-600 py-1.5 px-3 rounded-lg border border-amber-100">
                                <Crown size={14} className="fill-amber-600" />
                                <span className="text-xs font-bold">Premium Ativo</span>
                             </div>
                           )}
                        </>
                      ) : (
                        <div className="flex justify-end mt-2 sm:hidden">
                          {/* Only show circle button on mobile list view, clean text on desktop card usually */}
                          <button 
                            onClick={(e) => handleWhatsAppClick(e, ad)}
                            className="size-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-[#25D366] hover:text-white transition-colors border border-green-100"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Floating Action Button - Mobile Only (Desktop has Header Button) */}
      <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-30 flex justify-end px-5 pb-6">
        <button 
          onClick={() => onNavigate('CREATE_AD')}
          className="pointer-events-auto flex items-center justify-center size-16 rounded-full bg-primary text-white shadow-2xl shadow-blue-600/40 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Help / About Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsHelpModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Content */}
            <div className="flex flex-col border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between p-4 pb-2">
                <h3 className="text-lg font-bold text-gray-900">Central de Ajuda</h3>
                <button onClick={() => setIsHelpModalOpen(false)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="flex px-4 gap-6">
                <button 
                  onClick={() => setActiveModalTab('tutorial')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeModalTab === 'tutorial' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Como Usar
                </button>
                <button 
                   onClick={() => setActiveModalTab('about')}
                   className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeModalTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Sobre & Confiança
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex flex-col gap-6 pb-8 bg-gray-50/50 min-h-[300px]">
              {activeModalTab === 'tutorial' ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Search size={20} /></div>
                    <div><h4 className="font-bold text-gray-900 mb-1">1. Encontrar</h4><p className="text-sm text-gray-600">Use a pesquisa ou categorias.</p></div>
                  </div>
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="size-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Rocket size={20} /></div>
                    <div><h4 className="font-bold text-gray-900 mb-1">2. Venda Rápida</h4><p className="text-sm text-gray-600">Destaque anúncios para vender 10x mais rápido.</p></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2"><CheckCircle2 className="text-primary" size={24} /><h4 className="font-bold text-gray-900">Segurança</h4></div>
                    <p className="text-sm text-gray-600">Nunca faça pagamentos adiantados.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2">Sobre</h4>
                    <p className="text-sm text-gray-600">Anúncios MZ v1.0.2</p>
                  </div>
                </div>
              )}
               <button onClick={handleSupportClick} className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"><MessageCircle size={20} /> Falar com Suporte</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};