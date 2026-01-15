import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  ChevronDown, 
  Rocket, 
  Phone, 
  X, 
  Zap, 
  Car, 
  Home, 
  Smartphone, 
  Loader2, 
  MapPin, 
  Palette,
  Link as LinkIcon,
  Copy,
  ImagePlus,
  Code,
  CheckCircle2,
  Search,
  Download,
  Globe,
  Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Ad } from '../types';
import { useToast } from '../components/ToastContext';

interface CreateAdScreenProps {
  onBack: () => void;
  onOpenTerms: () => void;
  onPublish: (data: Partial<Ad>) => void;
  onBoost: (ad: Ad) => void;
}

export const CreateAdScreen: React.FC<CreateAdScreenProps> = ({ 
  onBack, 
  onOpenTerms, 
  onPublish, 
  onBoost 
}) => {
  const { showToast } = useToast();
  
  // Unified Media State (Files + URLs)
  const [mediaItems, setMediaItems] = useState<{ url: string; file?: File }[]>([]);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('vehicle');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Maputo');
  const [contact, setContact] = useState('');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareSuggestion, setShowShareSuggestion] = useState(false);

  // HTML Import Modal State
  const [showHtmlImport, setShowHtmlImport] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');
  const [extractedCandidates, setExtractedCandidates] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [isProcessingHtml, setIsProcessingHtml] = useState(false);

  // Specifications State
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [mileage, setMileage] = useState('');
  const [specType, setSpecType] = useState(''); 
  const [design, setDesign] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste Event Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // If modal is open, let default paste behavior happen in the textarea
      if (showHtmlImport) return;

      try {
        let foundImages = false;

        // 1. Handle Files (Images copied directly to clipboard from file system)
        if (e.clipboardData?.files.length) {
          const files = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
          if (files.length > 0) {
              const newItems = files.map(file => ({
                  url: URL.createObjectURL(file),
                  file: file
              }));
              setMediaItems(prev => [...prev, ...newItems].slice(0, 10));
              showToast(`${files.length} imagem(ns) colada(s)!`, 'success');
              foundImages = true;
          }
        } 
        
        // 2. Handle HTML (Copying selection from a website)
        const html = e.clipboardData?.getData('text/html');
        if (!foundImages && html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const images = doc.querySelectorAll('img');
            const newUrls: string[] = [];

            images.forEach(img => {
                if (img.src && (img.src.startsWith('http') || img.src.startsWith('data:image'))) {
                    newUrls.push(img.src);
                }
            });

            if (newUrls.length > 0) {
                setMediaItems(prev => {
                    const existingCount = prev.length;
                    const availableSlots = 10 - existingCount;
                    const toAdd = newUrls.slice(0, availableSlots).map(url => ({ url }));
                    return [...prev, ...toAdd];
                });
                showToast(`${newUrls.length} imagens extraídas do HTML!`, 'success');
                foundImages = true;
            }
        }

        // 3. Handle Text (URL or Raw HTML Code)
        if (!foundImages) {
            const text = e.clipboardData?.getData('text');
            if (text) {
                if (text.includes('<img') || text.includes('http')) {
                   // If user pastes code or url, suggest opening the tool
                   // But if it's a direct image link, just add it
                   if (text.match(/\.(jpeg|jpg|gif|png)$/) != null && (text.startsWith('http') || text.startsWith('data:image'))) {
                        setMediaItems(prev => [...prev, { url: text }].slice(0, 10));
                        showToast("Link de imagem adicionado!", 'success');
                   } 
                }
            }
        }
      } catch (err) {
        console.error("Paste error:", err);
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [showToast, showHtmlImport]);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTriggerUrl = () => {
    const url = window.prompt("Insira o link da imagem (URL):");
    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
        setMediaItems(prev => [...prev, { url }].slice(0, 10));
    }
  };

  const handleTriggerHtml = () => {
    setShowHtmlImport(true);
  };

  const processHtmlInput = () => {
    if (!htmlInput.trim()) return;
    setIsProcessingHtml(true);

    setTimeout(() => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlInput, 'text/html');
            const imgTags = Array.from(doc.querySelectorAll('img'));
            
            // Strategy 1: src attributes
            let urls = imgTags
                .map(img => img.getAttribute('src'))
                .filter(src => src && (src.startsWith('http') || src.startsWith('data:'))) as string[];

            // Strategy 2: Regex for image URLs in the text (good for CSS, JSON blobs, or plain text list)
            const urlRegex = /(https?:\/\/[^\s<"']+\.(?:jpg|jpeg|png|webp|gif|svg))/gi;
            const matches = htmlInput.match(urlRegex);
            if (matches) {
                urls = [...urls, ...matches];
            }
            
            // Deduplicate
            const uniqueUrls = Array.from(new Set(urls));
            
            setExtractedCandidates(uniqueUrls);
            setSelectedCandidates(new Set(uniqueUrls)); // Select all by default
            
            if(uniqueUrls.length === 0) {
                showToast("Nenhuma imagem encontrada no código.", "error");
            } else {
                showToast(`${uniqueUrls.length} imagens encontradas!`, "success");
            }
        } catch (e) {
            showToast("Erro ao processar HTML.", "error");
        } finally {
            setIsProcessingHtml(false);
        }
    }, 500); // Fake delay for UX
  };

  const toggleCandidate = (url: string) => {
    const newSet = new Set(selectedCandidates);
    if (newSet.has(url)) {
        newSet.delete(url);
    } else {
        newSet.add(url);
    }
    setSelectedCandidates(newSet);
  };

  const confirmHtmlImport = () => {
    const toAdd = Array.from(selectedCandidates).map(url => ({ url }));
    const availableSlots = 10 - mediaItems.length;
    
    if (toAdd.length > availableSlots) {
        showToast(`Adicionado apenas ${availableSlots} imagens (limite de 10).`, 'info');
        setMediaItems(prev => [...prev, ...toAdd.slice(0, availableSlots)]);
    } else {
        setMediaItems(prev => [...prev, ...toAdd]);
        showToast(`${toAdd.length} imagens adicionadas!`, 'success');
    }
    
    // Reset and Close
    setShowHtmlImport(false);
    setHtmlInput('');
    setExtractedCandidates([]);
    setSelectedCandidates(new Set());
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Anúncios MZ',
      text: '📢 Descobri um app grátis para anunciar e encontrar serviços em Moçambique 🇲🇿\nPublique anúncios, encontre clientes e oportunidades perto de você.',
      url: 'https://anucios-mz.vercel.app/',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast("Obrigado por partilhar!", "success");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showToast("Link copiado! Partilhe com os seus amigos.", "success");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    } finally {
      setShowShareSuggestion(false);
      onPublish({}); // Proceed to home as per original logic, but we already called it or will
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newItems = Array.from(files).map((file: File) => ({
        url: URL.createObjectURL(file),
        file: file
      }));
      setMediaItems(prev => [...prev, ...newItems].slice(0, 10));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setMediaItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePublishClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericPrice = parseFloat(price);
    
    // Mozambique prefix is handled by UI, so we just prep the number for storage
    const fullContact = contact.startsWith('258') ? contact : `258${contact}`;
    
    if (!title.trim() || !price || isNaN(numericPrice) || !category || !description.trim() || !location.trim() || !contact.trim()) {
      showToast("Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }

    if (category === 'vehicle' && (!fuel || !transmission || !mileage)) {
      showToast("Por favor, preencha as especificações do veículo.", "error");
      return;
    }

    if ((category === 'real-estate' || category === 'electronics') && !specType) {
      showToast("Por favor, selecione o tipo.", "error");
      return;
    }

    if (mediaItems.length === 0) {
        showToast("Adicione pelo menos uma foto ou link.", "error");
        return;
    }
    setShowUpsellModal(true);
  };

  const saveToSupabase = async (isBoosted: boolean) => {
    setIsSubmitting(true);
    try {
      // Get User ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        return;
      }

      const uploadedImageUrls: string[] = [];

      // 1. Process Images (Upload Files, Keep URLs)
      if (mediaItems.length > 0) {
        for (const item of mediaItems) {
            if (item.file) {
                // Upload File
                const fileExt = item.file.name.split('.').pop();
                const safeName = item.file.name.replace(/[^a-zA-Z0-9]/g, '_'); 
                const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}_${safeName}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                .from('ad-images')
                .upload(fileName, item.file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                .from('ad-images')
                .getPublicUrl(fileName);

                uploadedImageUrls.push(publicUrl);
            } else {
                // Use URL directly
                uploadedImageUrls.push(item.url);
            }
        }
      }

      // 2. Construct Specs
      const specs: any = {};
      if (category === 'vehicle') {
        if (fuel) specs.fuel = fuel;
        if (transmission) specs.transmission = transmission;
        if (mileage) specs.mileage = `${mileage} km`;
      } else if (category === 'real-estate' || category === 'electronics') {
        if (specType) specs.type = specType;
      }
      
      // Add Design to specs if present
      if (design) specs.design = design;

      // 3. Insert into DB
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) {
        throw new Error("O preço informado inválido.");
      }

      const categoryTyped = category as 'vehicle' | 'real-estate' | 'electronics' | 'other';

      const payload = {
        title,
        price: numericPrice,
        currency: 'MT',
        location: location,
        category: categoryTyped,
        description,
        contact: fullContact,
        image: uploadedImageUrls[0],
        images: uploadedImageUrls,
        specs: Object.keys(specs).length > 0 ? specs : null,
        is_featured: false,
        user_id: user.id
      };

      const { data, error: insertError } = await supabase
        .from('ads')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      const newAd: Ad = {
        id: data.id,
        title: data.title,
        price: data.price,
        currency: data.currency,
        location: data.location,
        image: data.image,
        images: data.images,
        isFeatured: data.is_featured,
        isMyAd: true,
        timeAgo: 'Agora mesmo',
        createdAt: new Date().toISOString(),
        category: data.category,
        specs: data.specs,
        contact: data.contact,
        description: data.description,
        views: data.views || 0
      };

      if (isBoosted) {
        showToast("Anúncio salvo! Prossiga para ativar o destaque grátis.", "success");
        onBoost(newAd);
      } else {
        showToast("Anúncio publicado com sucesso!", "success");
        setShowShareSuggestion(true);
        // We delay the actual onPublish navigation to let them see the share suggestion
        setTimeout(() => {
          if (!showShareSuggestion) onPublish(newAd);
        }, 500);
      }

    } catch (error: any) {
      console.error('Error saving ad:', error);
      showToast(error.message || 'Erro ao publicar.', "error");
    } finally {
      setIsSubmitting(false);
      setShowUpsellModal(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen py-0 md:py-8 font-display">
      <div className="relative flex flex-col max-w-4xl mx-auto bg-gray-50 md:bg-white md:shadow-xl md:rounded-2xl overflow-hidden">
        {/* Top App Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b border-gray-100">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Novo Anúncio</h1>
          <div className="w-10"></div> 
        </header>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          multiple 
          accept="image/*"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32">
          
          {/* IMAGE SECTION */}
          <div className="p-4 bg-white mb-3 md:mb-6 md:rounded-b-2xl">
              <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <ImagePlus size={18} className="text-primary"/>
                    Fotos do Anúncio
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">{mediaItems.length}/10 fotos</span>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  <button 
                      onClick={handleTriggerUpload}
                      type="button"
                      className="aspect-square rounded-xl bg-blue-50/50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-1 text-primary hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-95 group"
                  >
                      <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          <Camera size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase">Camera</span>
                  </button>

                  <button 
                      onClick={handleTriggerUrl}
                      type="button"
                      className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-primary hover:bg-gray-100 hover:border-gray-400 transition-all active:scale-95 group"
                  >
                      <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          <LinkIcon size={20} className="text-gray-600" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase">Link URL</span>
                  </button>

                  <button 
                      onClick={handleTriggerHtml}
                      type="button"
                      className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-primary hover:bg-gray-100 hover:border-gray-400 transition-all active:scale-95 group"
                  >
                      <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          <Code size={20} className="text-gray-600" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase">HTML</span>
                  </button>

                  {mediaItems.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group animate-in zoom-in-50 duration-200">
                          <img src={item.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button 
                              onClick={() => removeImage(idx)}
                              type="button"
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 backdrop-blur-sm hover:bg-red-500 transition-colors"
                          >
                              <X size={12} />
                          </button>
                          {idx === 0 && (
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1 pt-4">
                                  <p className="text-[9px] font-bold text-white text-center uppercase tracking-wider">Capa</p>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
              
              <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-3 items-center">
                  <div className="shrink-0 bg-white p-1.5 rounded-full shadow-sm text-primary">
                      <Copy size={16} />
                  </div>
                  <div className="text-xs text-gray-600">
                      <span className="font-bold text-gray-800">Dica:</span> Pode copiar imagens de sites ou código HTML e <span className="font-bold">Colar (Ctrl+V)</span> diretamente aqui.
                  </div>
              </div>
          </div>

          <div className="md:px-4 flex flex-col gap-3">
            {/* DETAILS SECTION */}
            <div className="p-4 bg-white md:rounded-xl md:border md:border-gray-200 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título</label>
                    <input 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder:font-normal focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Ex: Toyota Corolla 2020"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preço (MT)</label>
                        <input 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="0.00"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="vehicle">Veículos</option>
                                <option value="real-estate">Imóveis</option>
                                <option value="electronics">Eletrónicos</option>
                                <option value="other">Outros</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</label>
                    <textarea 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder:font-normal focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-32"
                        placeholder="Descreva os detalhes do seu produto..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>

            {/* SPECIFICATIONS SECTION */}
            {category !== 'other' && (
                <div className="p-4 bg-white md:rounded-xl md:border md:border-gray-200">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        {category === 'vehicle' && <Car size={20} />}
                        {category === 'real-estate' && <Home size={20} />}
                        {category === 'electronics' && <Smartphone size={20} />}
                        <h3 className="font-bold text-gray-900 text-sm">Especificações</h3>
                    </div>

                    {category === 'vehicle' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Combustível</label>
                                <select className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm py-2.5 px-3" value={fuel} onChange={(e) => setFuel(e.target.value)}>
                                    <option value="">Selecionar</option>
                                    <option value="Gasolina">Gasolina</option>
                                    <option value="Diesel">Diesel</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Transmissão</label>
                                <select className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm py-2.5 px-3" value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                                    <option value="">Selecionar</option>
                                    <option value="Automática">Automática</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            </div>
                            <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Quilometragem (Km)</label>
                                <input type="number" className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm py-2.5 px-3" placeholder="Ex: 45000" value={mileage} onChange={(e) => setMileage(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {(category === 'real-estate' || category === 'electronics') && (
                        <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">
                                {category === 'real-estate' ? 'Tipo de Imóvel' : 'Modelo / Tipo'}
                            </label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm py-2.5 px-3" 
                                placeholder={category === 'real-estate' ? "Ex: Apartamento T3" : "Ex: iPhone 14 Pro"} 
                                value={specType} 
                                onChange={(e) => setSpecType(e.target.value)} 
                            />
                        </div>
                    )}

                    {/* Generic Design Input for all structured categories */}
                    <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">
                            {category === 'vehicle' ? 'Carroçaria / Design' : 
                             category === 'real-estate' ? 'Estilo / Arquitetura' : 'Cor / Acabamento'}
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full pl-9 bg-gray-50 border-gray-200 rounded-lg text-sm py-2.5 px-3" 
                                placeholder={
                                    category === 'vehicle' ? "Ex: SUV, Sedan, Desportivo" :
                                    category === 'real-estate' ? "Ex: Moderno, Minimalista" : "Ex: Preto Matte, Dourado"
                                }
                                value={design} 
                                onChange={(e) => setDesign(e.target.value)} 
                            />
                            <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        </div>
                    </div>
                </div>
            )}

            {/* CONTACT SECTION */}
            <div className="p-4 bg-white md:rounded-xl md:border md:border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Localização e Contacto</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm font-medium outline-none focus:border-primary"
                            placeholder="Cidade, Província"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                          <span className="text-base">🇲🇿</span>
                          <span className="text-xs font-bold text-gray-600">+258</span>
                        </div>
                        <input 
                            className="w-full pl-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm font-medium outline-none focus:border-primary"
                            placeholder="84 123 4567"
                            value={contact}
                            onChange={(e) => {
                                let val = e.target.value;
                                // Remove any non-numeric characters
                                val = val.replace(/\D/g, '');
                                setContact(val);
                            }}
                            type="tel"
                        />
                    </div>
                </div>
            </div>
            
            <p className="px-4 text-center text-[10px] text-gray-400">
                Ao clicar em publicar, você aceita os Termos de Uso do Classificados MZ.
            </p>
          </div>

        </main>

        {/* Footer Action */}
        <div className="fixed md:absolute bottom-0 z-20 w-full bg-white border-t border-gray-100 p-4 pb-8 md:pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handlePublishClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-center font-bold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] hover:bg-blue-700"
          >
            <span>Publicar Anúncio</span>
            <Rocket size={20} />
          </button>
        </div>

        {/* HTML Import Modal */}
        {showHtmlImport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowHtmlImport(false)}></div>
                <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-primary">
                                <Code size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Importar Imagens via HTML</h3>
                                <p className="text-xs text-gray-500">Cole código de um site ou URLs para extrair imagens.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowHtmlImport(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                        <div className="relative">
                            <textarea 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none h-32"
                                placeholder="<img src='...' /> ou cole uma lista de links https://..."
                                value={htmlInput}
                                onChange={(e) => setHtmlInput(e.target.value)}
                            />
                            <div className="absolute bottom-3 right-3 flex gap-2">
                                <button 
                                    onClick={() => setHtmlInput('')}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Limpar
                                </button>
                                <button 
                                    onClick={processHtmlInput}
                                    disabled={isProcessingHtml || !htmlInput}
                                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-black disabled:opacity-50"
                                >
                                    {isProcessingHtml ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                                    Processar HTML
                                </button>
                            </div>
                        </div>

                        {extractedCandidates.length > 0 ? (
                             <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <Globe size={16} className="text-blue-500" />
                                        Imagens Encontradas ({extractedCandidates.length})
                                    </h4>
                                    <button 
                                        onClick={() => {
                                            if (selectedCandidates.size === extractedCandidates.length) {
                                                setSelectedCandidates(new Set());
                                            } else {
                                                setSelectedCandidates(new Set(extractedCandidates));
                                            }
                                        }}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        {selectedCandidates.size === extractedCandidates.length ? 'Desmarcar Todas' : 'Marcar Todas'}
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {extractedCandidates.map((url, idx) => {
                                        const isSelected = selectedCandidates.has(url);
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => toggleCandidate(url)}
                                                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-300'}`}
                                            >
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    {isSelected && <CheckCircle2 className="text-white fill-primary" size={24} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                             </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                <ImagePlus size={32} className="mb-2 opacity-50" />
                                <p className="text-xs font-medium">As imagens aparecerão aqui.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                        <button 
                            onClick={() => setShowHtmlImport(false)}
                            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmHtmlImport}
                            disabled={selectedCandidates.size === 0}
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} />
                            Importar ({selectedCandidates.size})
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Upsell Modal */}
        {showUpsellModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => !isSubmitting && setShowUpsellModal(false)}
            ></div>
            
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="animate-spin text-primary mb-4" size={48} />
                  <p className="text-gray-900 font-bold text-lg">Publicando...</p>
                  <p className="text-gray-500 text-sm">Enviando suas fotos para o servidor.</p>
                </div>
              ) : (
                <>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="size-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg text-primary animate-bounce">
                        <Rocket size={40} className="fill-primary" />
                      </div>
                      <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm">
                        +10x Visitas
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-center flex flex-col items-center">
                    <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">
                      Quer vender muito mais rápido?
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      Anúncios destacados aparecem no topo da lista e vendem até <strong className="text-primary">10x mais rápido</strong>.
                    </p>

                    <button 
                      onClick={() => saveToSupabase(true)} // Boost = true
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 mb-3 active:scale-[0.98] transition-transform"
                    >
                      <Zap size={20} className="fill-white" />
                      Sim, quero destacar!
                    </button>

                    <button 
                      onClick={() => saveToSupabase(false)} // Boost = false (Free)
                      className="w-full bg-transparent hover:bg-gray-50 text-gray-500 font-semibold py-3 rounded-xl transition-colors text-sm"
                    >
                      Não, publicar gratuitamente
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Share Suggestion Modal */}
      {showShareSuggestion && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Share2 size={40} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Gostou do app?</h3>
            <p className="text-gray-500 mb-8 text-lg">Compartilhe com um amigo 👇</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleShareApp}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl text-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <Share2 size={24} />
                Compartilhar app
              </button>
              <button
                onClick={() => onPublish({})}
                className="w-full text-gray-400 font-bold py-2 hover:text-gray-600 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};