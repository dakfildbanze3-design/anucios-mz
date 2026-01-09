import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  ChevronDown, 
  Rocket, 
  Phone, 
  X, 
  ImagePlus, 
  Zap, 
  Car, 
  Home, 
  Smartphone, 
  Loader2,
  MapPin,
  Palette
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('vehicle');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Maputo');
  const [contact, setContact] = useState('');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Specifications State
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [mileage, setMileage] = useState('');
  const [specType, setSpecType] = useState(''); 
  const [design, setDesign] = useState(''); // New Design State
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newPreviews = Array.from(files).map((file: File) => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10));
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePublishClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category) {
      showToast("Preencha Título, Preço e Categoria.", "error");
      return;
    }
    if (imageFiles.length === 0) {
        showToast("Adicione pelo menos uma foto.", "error");
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

      // 1. Upload All Images
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
            const fileExt = file.name.split('.').pop();
            const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_'); 
            const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}_${safeName}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
            .from('ad-images')
            .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
            .from('ad-images')
            .getPublicUrl(filePath);

            uploadedImageUrls.push(publicUrl);
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
        contact,
        image: uploadedImageUrls[0],
        images: uploadedImageUrls,
        specs: Object.keys(specs).length > 0 ? specs : null,
        is_featured: false,
        user_id: user.id // Explicitly bind ad to user
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
        createdAt: new Date().toISOString(), // Use Current Time immediately
        category: data.category,
        specs: data.specs,
        contact: data.contact,
        description: data.description,
        views: data.views || 0
      };

      showToast("Anúncio publicado com sucesso!", "success");

      if (isBoosted) {
        onBoost(newAd);
      } else {
        onPublish(newAd);
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
      {/* Changed max-w-2xl to max-w-4xl */}
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
                  <h3 className="font-bold text-gray-900 text-sm">Fotos do Anúncio</h3>
                  <span className="text-xs text-gray-500">{imagePreviews.length}/10 fotos</span>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  <button 
                      onClick={handleTriggerUpload}
                      className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-primary hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95"
                  >
                      <div className="p-2 bg-white rounded-full shadow-sm">
                          <Camera size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase">Adicionar</span>
                  </button>

                  {imagePreviews.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm group">
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button 
                              onClick={() => removeImage(idx)}
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
              {imagePreviews.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2 text-center py-2">
                      A primeira foto será a capa do seu anúncio.
                  </p>
              )}
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
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm font-medium outline-none focus:border-primary"
                            placeholder="Telefone (84/82...)"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
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
    </div>
  );
};