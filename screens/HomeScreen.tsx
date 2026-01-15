import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Zap, 
  MapPin, 
  Phone, 
  Clock, 
  Rocket, 
  Star, 
  MessageCircle, 
  Info, 
  X, 
  CheckCircle2, 
  Plus, 
  User, 
  LogOut, 
  Crown, 
  LayoutGrid, 
  Palette, 
  Car, 
  Home, 
  Smartphone, 
  ShoppingBag, 
  Grid, 
  Globe,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown
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
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'price-asc' | 'price-desc'>('recent');
  const [locationFilter, setLocationFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  
  // Menu States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'tutorial' | 'about'>('tutorial');

  const categories = [
    { id: 'all', label: 'Todos', icon: Grid },
    { id: 'vehicle', label: 'Veículos', icon: Car },
    { id: 'real-estate', label: 'Imóveis', icon: Home },
    { id: 'electronics', label: 'Eletrónicos', icon: Smartphone },
    { id: 'other', label: 'Outros', icon: ShoppingBag }
  ];

  const filteredAds = ads.filter(ad => {
    // Search in title, location, category and description for global reach
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
                          ad.title.toLowerCase().includes(searchLower) || 
                          ad.location.toLowerCase().includes(searchLower) ||
                          ad.description?.toLowerCase().includes(searchLower) ||
                          ad.category.toLowerCase().includes(searchLower);

    const matchesCategory = activeCategory === 'all' || ad.category === activeCategory;
    const matchesMinPrice = priceRange.min === '' || ad.price >= Number(priceRange.min);
    const matchesMaxPrice = priceRange.max === '' || ad.price <= Number(priceRange.max);
    const matchesLocation = locationFilter === '' || ad.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    let matchesTime = true;
    if (timeFilter !== 'all' && ad.createdAt) {
      const now = new Date();
      const adDate = new Date(ad.createdAt);
      const diffMs = now.getTime() - adDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (timeFilter === '24h') matchesTime = diffHours <= 24;
      else if (timeFilter === '7d') matchesTime = diffHours <= 24 * 7;
      else if (timeFilter === '30d') matchesTime = diffHours <= 24 * 30;
    }
    
    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesLocation && matchesTime;
  });

  // Featured carousel specifically for featured ads, newest boost/creation first
  // Syncing with filters as requested
  const featuredAds = filteredAds
    .filter(ad => ad.isFeatured)
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  // Recent ads: Global chronological order (newest first), regardless of featured status
  const recentAds = [...filteredAds].sort((a, b) => {
    if (sortBy === 'recent') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    if (sortBy === 'oldest') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    }
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

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

  const formatMozDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', {
      timeZone: 'Africa/Maputo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  return (
    <div className="flex min-h-screen bg-background-light relative">
      
      {/* =======================
          DESKTOP SIDEBAR 
         ======================= */}
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-50">
        {/* Sidebar Header / Logo */}
        <div className="h-[73px] flex items-center px-6 border-b border-gray-100">
           <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setActiveCategory('all')}>
              <div className="relative">
                <span className="font-hand text-2xl text-[#111318] leading-none">Anúncios</span>
                <svg viewBox="0 0 100 20" className="absolute -bottom-2 -left-1 w-full h-auto text-[#111318] -rotate-1 opacity-90">
                    <path d="M2,10 Q40,16 90,4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-display text-2xl font-black text-primary italic">MZ</span>
            </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            
            {/* Create Button */}
            <button 
                onClick={() => onNavigate('CREATE_AD')}
                className="w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                <span>Anunciar Agora</span>
            </button>

            {/* Menu Links */}
            <div className="flex flex-col gap-1">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
                
                <button 
                  onClick={() => onNavigate('HOME')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'all' && searchQuery === '' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Grid size={18} />
                    <span>Início</span>
                </button>

                {session && (
                    <button 
                        onClick={() => onNavigate('PROFILE')}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <User size={18} />
                        <span>Meu Perfil</span>
                    </button>
                )}
                
                <button 
                    onClick={() => onNavigate('FEATURED_ADS')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <Zap size={18} />
                    <span>Destaques</span>
                </button>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-1">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categorias</p>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            activeCategory === cat.id 
                            ? 'bg-blue-50 text-primary font-bold' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <cat.icon size={18} />
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

             {/* Support & Legal */}
             <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-1">
                <button onClick={handleSupportClick} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <MessageCircle size={16} />
                    <span>Suporte</span>
                </button>
                <button onClick={() => openHelpModal('about')} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <Info size={16} />
                    <span>Sobre</span>
                </button>
             </div>
        </div>

        {/* User Footer Desktop */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
            {session ? (
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-white border border-gray-200 overflow-hidden shadow-sm shrink-0">
                        {userAvatar ? (
                            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User size={20} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                        <button onClick={handleSignOut} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                            <LogOut size={10} /> Sair
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={onOpenAuth}
                    className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors"
                >
                    Entrar na Conta
                </button>
            )}
        </div>
      </aside>

      {/* =======================
          MAIN CONTENT WRAPPER 
         ======================= */}
      <main className="flex-1 flex flex-col min-h-screen w-full lg:pl-72 transition-all">
        
        {/* Sticky Header (Mobile + Desktop Search) */}
        <header className="sticky top-0 z-40 bg-surface-light border-b border-gray-200 shadow-sm">
          <div className="max-w-[1920px] mx-auto">
            {/* Flex Container: Column on Mobile to stack Search below Logo, Row on Desktop */}
            <div className="flex flex-col lg:flex-row lg:items-center px-4 py-3 gap-3 lg:gap-0">
              
              {/* Mobile Top Row: Menu + Logo + Profile (Hidden on LG) */}
              <div className="flex items-center justify-between w-full lg:hidden">
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600" onClick={() => setIsMenuOpen(true)}>
                      <Menu size={24} />
                    </button>
                    
                    <div className="flex items-center gap-1.5 pt-1 cursor-pointer select-none" onClick={() => setActiveCategory('all')}>
                      <div className="relative">
                        <span className="font-hand text-2xl text-[#111318] leading-none">Anúncios</span>
                        <svg viewBox="0 0 100 20" className="absolute -bottom-2 -left-1 w-full h-auto text-[#111318] -rotate-1 opacity-90">
                           <path d="M2,10 Q40,16 90,4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="font-display text-2xl font-black text-primary italic">MZ</span>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button 
                      onClick={() => session ? onNavigate('PROFILE') : setIsMenuOpen(!isMenuOpen)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                    >
                      <div className={`size-10 rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-gray-200 ${session ? 'bg-white' : 'bg-gray-100 text-gray-500'}`}>
                        {session && userAvatar ? (
                            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className={session ? "text-primary fill-primary/10" : "fill-current"} />
                        )}
                      </div>
                    </button>
                  </div>
              </div>
              
              {/* Search Bar - Row 2 on Mobile, Row 1 (Centered/Expanded) on Desktop */}
              <div className="w-full lg:flex-1 lg:max-w-2xl lg:mx-auto flex items-center gap-2">
                <div className="relative group flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Search size={18} />
                  </span>
                  <input 
                    className="w-full py-2.5 pl-9 pr-4 bg-gray-100 lg:bg-white lg:border lg:border-gray-200 border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white placeholder-gray-500 transition-all outline-none" 
                    placeholder="Pesquisar..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'}`}
                >
                  <SlidersHorizontal size={20} />
                  <span className="hidden md:inline text-sm font-bold">Filtros</span>
                </button>
              </div>

            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="px-4 py-4 bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preço (MT)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder="Mín"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="text-gray-400">-</span>
                      <input 
                        type="number" 
                        placeholder="Máx"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Localização</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Cidade ou província"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Sorting */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordenar por</label>
                    <div className="relative">
                      <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                      >
                        <option value="recent">Mais recentes</option>
                        <option value="oldest">Mais antigos</option>
                        <option value="price-asc">Preço: Menor ao Maior</option>
                        <option value="price-desc">Preço: Maior ao Menor</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Time Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Período</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select 
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                      >
                        <option value="all">Todo o tempo</option>
                        <option value="24h">Últimas 24 horas</option>
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <div className="max-w-4xl mx-auto mt-4 pt-4 border-t border-gray-50 flex justify-end gap-3">
                   <button 
                    onClick={() => {
                      setPriceRange({ min: '', max: '' });
                      setLocationFilter('');
                      setSortBy('recent');
                      setTimeFilter('all');
                    }}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                   >
                    Limpar Filtros
                   </button>
                   <button 
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
                   >
                    Aplicar
                   </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 w-full max-w-[1920px] mx-auto pb-24 lg:pb-8">
            
            {/* Mobile Categories Chips (Hidden on LG) */}
            {/* Adjusted sticky top position to account for the taller 2-row header on mobile (approx 120px) */}
            <div className="lg:hidden flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar sticky top-[120px] z-30 bg-background-light/95 backdrop-blur-sm">
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
            <section className="mt-2 lg:mt-6 px-4 lg:px-6 overflow-hidden">
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
                
                {/* Horizontal scroll on all screens */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-1 -mx-1 snap-x snap-mandatory">
                {featuredAds.map((ad) => (
                    <div 
                    key={ad.id}
                    onClick={() => onNavigate('AD_DETAILS', ad)}
                    className="min-w-[280px] w-[280px] bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden group flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 snap-start"
                    >
                    <div className="relative h-40 md:h-44 w-full overflow-hidden">
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-amber-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10 uppercase tracking-wider border border-amber-200 flex items-center gap-1">
                        <Star size={10} className="fill-amber-600" />
                        Destaque
                        </div>

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
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{ad.title}</h3>
                        </div>
                        {ad.specs?.design && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Palette size={12} />
                            <span>{ad.specs.design}</span>
                        </div>
                        )}
                        <p className="text-lg font-black text-primary mb-3">
                        {ad.currency} {ad.price.toLocaleString('pt-PT')}
                        </p>
                        
                        <div className="flex flex-col gap-1 mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={14} />
                            <span className="truncate">{ad.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                            <Clock size={14} />
                            <span>{formatMozDate(ad.createdAt)}</span>
                        </div>
                        </div>

                        <div className="mt-auto">
                        <button 
                            onClick={(e) => handleWhatsAppClick(e, ad)}
                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1faa53] text-white py-2 rounded-lg text-sm font-semibold shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
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
            <section className="mt-4 px-4 lg:px-6 flex-1">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                {activeCategory === 'all' ? 'Recentes' : categories.find(c => c.id === activeCategory)?.label}
            </h2>
            
            {recentAds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
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
                // Responsive Grid for Recent Ads
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 px-[1px]">
                {recentAds.map((ad) => (
                    <div 
                    key={ad.id}
                    onClick={() => onNavigate('AD_DETAILS', ad)}
                    className={`relative p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm border flex flex-col gap-2 sm:gap-4 h-auto cursor-pointer hover:shadow-md transition-all duration-300 group ${ad.isMyAd ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}
                    >
                    {ad.isMyAd && (
                        <div className="absolute -top-2 -right-2 z-10">
                        <span className="bg-gray-900 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-white font-bold shadow-md">Seu Anúncio</span>
                        </div>
                    )}

                    {ad.isFeatured && (
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-400 text-white text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                            <Star size={10} className="fill-white" />
                            Destaque
                        </div>
                    )}
                    
                    <div className="w-full aspect-square sm:aspect-auto sm:h-44 shrink-0 rounded-lg sm:rounded-xl bg-gray-100 overflow-hidden relative">
                        <div 
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                        style={{ backgroundImage: `url(${ad.image})` }}
                        />
                    </div>
                    
                    <div className="flex flex-col justify-between flex-1">
                        <div>
                        <h3 className="text-[13px] sm:text-[15px] font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{ad.title}</h3>
                        
                        <div className="flex flex-col gap-0.5 mt-1 sm:mt-1.5">
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                                <MapPin size={10} className="sm:size-3" />
                                <span className="truncate">{ad.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                                <Clock size={10} className="sm:size-3" />
                                {formatMozDate(ad.createdAt)}
                            </div>
                        </div>
                        </div>
                        
                        <div className="mt-1.5 sm:mt-3">
                        <p className="text-sm sm:text-base font-black text-primary">
                            {ad.currency} {ad.price.toLocaleString('pt-PT')}
                        </p>
                        
                        {ad.isMyAd && (
                            <div className="mt-2">
                                {!ad.isFeatured ? (
                                    <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNavigate('BOOST_AD', ad);
                                    }}
                                    className="w-full flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1 rounded-lg shadow-md active:scale-95 transition-all"
                                    >
                                    <Rocket size={12} />
                                    <span className="text-[10px] font-bold">Destacar</span>
                                    </button>
                                ) : (
                                    <div className="w-full flex items-center justify-center gap-1 bg-amber-50 text-amber-600 py-1 rounded-lg border border-amber-100">
                                        <Crown size={12} className="fill-amber-600" />
                                        <span className="text-[10px] font-bold">Premium</span>
                                    </div>
                                )}
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
      </main>

      {/* Floating Action Button - Mobile Only */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-30 flex justify-end px-5">
        <button 
          onClick={() => onNavigate('CREATE_AD')}
          className="pointer-events-auto flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-2xl shadow-blue-600/40 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Mobile Menu Dropdown (Only renders on mobile if open) */}
      {isMenuOpen && (
        <>
            <div 
                className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" 
                onClick={() => setIsMenuOpen(false)} 
            />
            <div className="lg:hidden fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-200 flex flex-col">
                {/* Mobile Menu Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                         <div className="relative">
                            <span className="font-hand text-xl text-[#111318] leading-none">Anúncios</span>
                            <svg viewBox="0 0 100 20" className="absolute -bottom-2 -left-1 w-full h-auto text-[#111318] -rotate-1 opacity-90">
                                <path d="M2,10 Q40,16 90,4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                         </div>
                         <span className="font-display text-xl font-black text-primary italic">MZ</span>
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-gray-500">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Mobile Menu Auth Section */}
                <div className="p-4 bg-white border-b border-gray-100">
                    {session ? (
                        <div className="flex items-center gap-3">
                             <div className="size-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                {userAvatar ? (
                                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User size={20} />
                                    </div>
                                )}
                             </div>
                             <div>
                                <p className="font-bold text-sm text-gray-900">{userName}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{session.user.email}</p>
                             </div>
                        </div>
                    ) : (
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenAuth();
                          }}
                          className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-500/20"
                        >
                          Entrar / Criar Conta
                        </button>
                    )}
                </div>

                {/* Mobile Menu Links */}
                <div className="flex-1 overflow-y-auto p-2">
                    {session && (
                        <button 
                            onClick={() => {
                                setIsMenuOpen(false);
                                onNavigate('PROFILE');
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
                        >
                            <LayoutGrid size={18} className="text-primary" />
                            <span>Meu Perfil</span>
                        </button>
                    )}
                    
                    <button 
                        onClick={() => {
                            setIsMenuOpen(false);
                            onNavigate('FEATURED_ADS');
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
                    >
                        <Zap size={18} className="text-amber-500" />
                        <span>Destaques</span>
                    </button>
                    
                    

                    <button 
                         onClick={() => openHelpModal('about')}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
                    >
                        <Info size={18} className="text-purple-500" />
                        <span>Sobre</span>
                    </button>

                    <button 
                        onClick={handleSupportClick}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
                    >
                        <MessageCircle size={18} className="text-green-500" />
                        <span>Suporte</span>
                    </button>

                    {session && (
                         <button 
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600 mt-2"
                        >
                            <LogOut size={18} />
                            <span>Sair da Conta</span>
                        </button>
                    )}
                </div>
            </div>
        </>
      )}

      {/* Help / About Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
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