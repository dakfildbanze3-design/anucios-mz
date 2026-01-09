import React, { useState, useRef } from 'react';
import { X, Mail, ArrowRight, Loader2, Lock, User, Camera, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Avatar State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validations
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (!fullName.trim()) {
            throw new Error('Por favor, insira seu nome completo.');
        }

        // 1. Sign Up User
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              // We'll update avatar_url after upload if needed
            }
          }
        });

        if (signUpError) throw signUpError;

        // 2. Upload Avatar if selected
        if (authData.user && avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `avatar_${authData.user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Assuming 'ad-images' bucket exists from previous context, 
            // ideally this should be a 'avatars' bucket with public access.
            const { error: uploadError } = await supabase.storage
                .from('ad-images') 
                .upload(filePath, avatarFile);

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('ad-images')
                    .getPublicUrl(filePath);

                // Update user metadata with avatar URL
                await supabase.auth.updateUser({
                    data: { avatar_url: publicUrl }
                });
            }
        }

        showToast('Conta criada com sucesso! Verifique seu email.', 'success');
        onClose();

      } else {
        // Login Logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        showToast('Login efetuado com sucesso!', 'success');
        onClose(); 
      }
    } catch (error: any) {
      showToast(error.message || 'Ocorreu um erro.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-background-light/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Main Card */}
      <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="px-8 py-10 relative flex flex-col items-center">
          
          {/* Header */}
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {isSignUp ? 'Criar Perfil' : 'Bem-vindo'}
          </h2>
          <p className="text-sm text-gray-500 mb-8 text-center max-w-[200px]">
             {isSignUp ? 'Preencha seus dados para começar.' : 'Entre para gerenciar seus anúncios.'}
          </p>

          <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
            
            {/* Avatar Upload (Only for Sign Up) */}
            {isSignUp && (
                <div className="flex flex-col items-center mb-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleAvatarChange}
                    />
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative size-24 rounded-full bg-gray-100 border-4 border-white shadow-lg cursor-pointer hover:bg-gray-200 transition-colors group overflow-hidden"
                    >
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User size={40} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <span className="text-xs text-primary font-bold mt-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {avatarPreview ? 'Alterar foto' : 'Adicionar foto'}
                    </span>
                </div>
            )}

            {isSignUp && (
                <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Nome Completo"
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-full text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-transparent focus:border-primary/50 transition-all"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                    />
                </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="seu@email.com"
                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-full text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-transparent focus:border-primary/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-full text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-transparent focus:border-primary/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isSignUp && (
                <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmar Senha"
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-full text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-transparent focus:border-primary/50 transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={isSignUp}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            )}

            <button 
              disabled={loading}
              className="mt-2 w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-full shadow-[0_10px_30px_-10px_rgba(19,91,236,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={toggleMode}
              className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-gray-50"
            >
              {isSignUp ? 'Já tem conta? Entrar' : 'Novo por aqui? Criar conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};