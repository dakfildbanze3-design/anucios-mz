import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Trash2, 
  Eye, 
  Rocket, 
  Plus,
  LogOut,
  Crown,
  Edit3,
  Camera,
  X,
  Check,
  Loader2,
  Mail
} from 'lucide-react';
import { Ad, ScreenName } from '../types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastContext';

interface ProfileScreenProps {
  session: Session | null;
  userAds: Ad[];
  onBack: () => void;
  onNavigate: (screen: ScreenName, ad?: Ad) => void;
  onDeleteAd: (adId: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  session, 
  userAds, 
  onBack, 
  onNavigate,
  onDeleteAd
}) => {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = session?.user;
  const userMetadata = user?.user_metadata;
  const currentAvatarUrl = userMetadata?.avatar_url;
  const currentName = userMetadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  // Stats
  const totalViews = userAds.reduce((acc, ad) => acc + (ad.views || 0), 0);
  const activeAdsCount = userAds.length;

  // Initialize edit form when opening modal
  useEffect(() => {
    if (isEditingProfile) {
      setEditName(currentName);
      setEditAvatarPreview(currentAvatarUrl);
      setEditAvatarFile(null);
    }
  }, [isEditingProfile, currentName, currentAvatarUrl]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditAvatarFile(file);
      setEditAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showToast('O nome não pode estar vazio.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      let publicAvatarUrl = currentAvatarUrl;

      // 1. Upload new avatar if changed
      if (editAvatarFile && user) {
        const fileExt = editAvatarFile.name.split('.').pop();
        // Use a unique name every time to bypass cache
        const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(fileName, editAvatarFile, { upsert: true });

        if (uploadError) {
            console.error("Upload failed", uploadError);
            throw new Error("Falha ao enviar imagem. Tente outra foto.");
        }

        const { data: { publicUrl } } = supabase.storage
          .from('ad-images')
          .getPublicUrl(fileName);
        
        publicAvatarUrl = publicUrl;
      }

      // 2. Update Auth User Metadata
      const { data: { user: updatedUser }, error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: editName,
          avatar_url: publicAvatarUrl
        }
      });

      if (updateError) throw updateError;

      showToast('Perfil atualizado com sucesso!', 'success');
      setIsEditingProfile(false);
      
      // Force session refresh to update UI immediately
      await supabase.auth.refreshSession();

    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Erro ao atualizar perfil.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, adId: string) => {
    e.stopPropagation(); // Stop click from opening ad details
    
    if (!window.confirm('Tem certeza que deseja eliminar este anúncio? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    setIsDeleting(adId);
    try {
      // 1. Get ad data to find images
      const { data: adData } = await supabase
        .from('ads')
        .select('images, image')
        .eq('id', adId)
        .single();

      // 2. Prepare paths to delete
      const pathsToDelete: string[] = [];
      if (adData) {
        const images = adData.images || (adData.image ? [adData.image] : []);
        images.forEach((url: string) => {
            try {
                // Handle different URL formats safely
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/ad-images/');
                if (pathParts.length > 1) {
                    pathsToDelete.push(decodeURIComponent(pathParts[1]));
                }
            } catch (e) { 
                console.log("Ignored invalid image URL:", url); 
            }
        });
      }

      // 3. Remove files from storage (best effort)
      if (pathsToDelete.length > 0) {
        await supabase.storage.from('ad-images').remove(pathsToDelete);
      }

      // 4. Delete payments first (foreign key constraint)
      await supabase.from('payments').delete().eq('ad_id', adId);
      
      // 5. Delete ad
      const { error } = await supabase.from('ads').delete().eq('id', adId);
      if (error) throw error;

      onDeleteAd(adId);
      showToast('Anúncio eliminado.', 'success');

    } catch (err: any) {
      console.error(err);
      showToast('Erro ao eliminar: ' + (err.message || 'Tente novamente.'), 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    showToast('Sessão terminada.', 'info');
    onBack();
  };

  return (
    <div className="min-h-screen bg-background-light font-display pb-10 relative">
      {/* Header Profile Card */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto">
            {/* Nav Bar */}
            <div className="flex items-center justify-between p-4">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex gap-2">
                    <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors text-sm font-bold">
                        <LogOut size={16} />
                        <span>Sair</span>
                    </button>
                </div>
            </div>

            {/* User Info Display */}
            <div className="flex flex-col items-center pb-8 px-6 text-center">
                <div className="relative shrink-0 group mb-4">
                    <div className="size-28 md:size-32 rounded-full bg-gray-900 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-gray-300">
                        {currentAvatarUrl ? (
                            <img src={currentAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} className="fill-gray-600" />
                        )}
                    </div>
                    {/* Floating Edit Button over Avatar for quick access */}
                    <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-700 hover:text-primary transition-colors"
                    >
                        <Edit3 size={16} />
                    </button>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 justify-center">
                        <h1 className="text-2xl font-black text-gray-900">{currentName}</h1>
                        <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="text-gray-400 hover:text-primary transition-colors"
                        >
                            <Edit3 size={18} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail size={12} />
                        {user?.email}
                    </p>

                    <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex flex-col items-center px-4">
                            <span className="font-black text-gray-900 text-xl">{activeAdsCount}</span>
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Publicações</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex flex-col items-center px-4">
                            <span className="font-black text-gray-900 text-xl">{totalViews}</span>
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Visitas Totais</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6 mt-4">
            <h2 className="text-xl font-bold text-gray-900">
                Minhas Publicações
            </h2>
            <button 
                onClick={() => onNavigate('CREATE_AD')}
                className="flex items-center gap-1.5 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
                <Plus size={18} />
                <span>Anunciar</span>
            </button>
        </div>

        {userAds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center px-6">
                <div className="size-16 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4">
                    <Rocket size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Comece a vender!</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">Você ainda não tem anúncios ativos.</p>
                <button 
                    onClick={() => onNavigate('CREATE_AD')}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all text-sm"
                >
                    Criar meu primeiro anúncio
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userAds.map((ad) => (
                    <div 
                        key={ad.id} 
                        onClick={() => onNavigate('AD_DETAILS', ad)}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all relative flex flex-col group h-full"
                    >
                        {/* Image Header */}
                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                             {/* Featured Badge */}
                             {ad.isFeatured && (
                                <div className="absolute top-2 right-2 z-10">
                                    <span className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20">
                                        Destaque
                                    </span>
                                </div>
                            )}

                            <div 
                                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                style={{ backgroundImage: `url(${ad.image})` }}
                            />
                            
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 flex items-end justify-between">
                                <div className="flex items-center gap-1 text-white/90 text-[10px] font-bold">
                                    <Eye size={12} />
                                    <span>{ad.views || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-3 flex flex-col gap-1 flex-1">
                            <h3 className="font-bold text-gray-900 text-sm line-clamp-1 leading-tight">{ad.title}</h3>
                            <p className="text-primary font-black text-sm mb-2">
                                {ad.currency} {ad.price.toLocaleString()}
                            </p>
                            
                            {/* Card Footer Actions */}
                            <div className="mt-auto flex items-center gap-2 pt-2 border-t border-gray-50">
                                {/* Boost Button */}
                                {!ad.isFeatured ? (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate('BOOST_AD', ad);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-primary py-2 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        <Rocket size={14} />
                                        <span>Top</span>
                                    </button>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 py-2 rounded-lg text-[10px] font-bold uppercase">
                                        <Crown size={14} className="fill-green-700" />
                                        <span>Ativo</span>
                                    </div>
                                )}

                                {/* Delete Button - Styled like screenshot */}
                                <button 
                                    onClick={(e) => handleDelete(e, ad.id)}
                                    disabled={isDeleting === ad.id}
                                    className="shrink-0 size-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition-colors"
                                    title="Eliminar"
                                >
                                    {isDeleting === ad.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditingProfile(false)}></div>
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Editar Perfil</h3>
                    <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 flex flex-col gap-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleAvatarSelect}
                            onClick={(e) => { (e.target as HTMLInputElement).value = '' }} // Ensure same file can be selected again
                        />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative size-28 rounded-full bg-gray-100 border-4 border-white shadow-lg cursor-pointer hover:border-blue-100 transition-all group overflow-hidden"
                        >
                            {editAvatarPreview ? (
                                <img src={editAvatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User size={48} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={32} />
                            </div>
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-primary font-bold mt-3 hover:underline"
                        >
                            Alterar Foto
                        </button>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nome de Exibição</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Seu nome"
                        />
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {isSavingProfile ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Check size={20} />
                                <span>Salvar Alterações</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};