import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Rocket, PlusCircle, TrendingUp, CreditCard, Play, Home, User, PlusSquare } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Bem-vindo ao Anúncios MZ",
    description: "Navegue pelo nosso Feed para encontrar ofertas incríveis em Moçambique.",
    icon: (
      <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-blue-200 relative shadow-inner">
        {/* Mock Home Screen */}
        <div className="absolute top-0 inset-x-0 h-10 bg-blue-600 flex items-center px-4">
           <div className="w-20 h-4 bg-blue-400 rounded"></div>
        </div>
        <div className="mt-12 p-2 grid grid-cols-2 gap-2">
           <div className="h-20 bg-white rounded shadow-sm border border-gray-100 flex flex-col p-1">
             <div className="h-10 bg-gray-200 rounded mb-1"></div>
             <div className="w-10 h-2 bg-blue-200 rounded mb-1"></div>
             <div className="w-6 h-2 bg-gray-200 rounded"></div>
           </div>
           <div className="h-20 bg-white rounded shadow-sm border border-blue-300 ring-2 ring-blue-100 flex flex-col p-1">
             <div className="h-10 bg-yellow-100 rounded mb-1 flex items-center justify-center"><span className="text-[8px] font-bold text-yellow-600 uppercase">Destaque</span></div>
             <div className="w-10 h-2 bg-blue-200 rounded mb-1"></div>
             <div className="w-6 h-2 bg-gray-200 rounded"></div>
           </div>
        </div>
      </div>
    ),
    color: "bg-blue-50",
    screenInfo: "No Feed você verá anúncios normais e destacados (em amarelo)."
  },
  {
    title: "Crie seu anúncio grátis",
    description: "Publique em segundos. Anúncios normais são grátis para todos os usuários.",
    icon: (
      <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-200 relative shadow-inner">
        {/* Mock Create Ad Screen */}
        <div className="p-4 flex flex-col gap-2">
           <div className="w-full h-6 bg-white border border-gray-200 rounded"></div>
           <div className="w-full h-12 bg-white border border-gray-200 rounded"></div>
           <div className="w-full h-6 bg-white border border-gray-200 rounded"></div>
           <div className="w-full h-8 bg-green-500 rounded flex items-center justify-center"><span className="text-white text-[10px] font-bold uppercase">Publicar Grátis</span></div>
        </div>
      </div>
    ),
    color: "bg-green-50",
    screenInfo: "Anúncios normais aparecem na ordem de publicação."
  },
  {
    title: "Venda mais rápido",
    description: "Destaque seu anúncio por apenas 50MT (3 dias), 100MT (7 dias) ou 150MT (14 dias).",
    icon: (
      <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-purple-200 relative shadow-inner">
        {/* Mock Featured Ad */}
        <div className="p-4 flex flex-col items-center justify-center h-full">
           <div className="w-full h-36 bg-white rounded-lg border-2 border-yellow-400 p-2 shadow-lg scale-105 relative">
              {/* Badge on the right */}
              <div className="absolute top-2 right-2 bg-yellow-400 text-[8px] font-bold text-yellow-900 px-2 py-0.5 rounded-full uppercase">
                 Destaque
              </div>
              <div className="w-full h-16 bg-yellow-50 rounded mb-2 flex items-center justify-center">
                 <TrendingUp size={24} className="text-yellow-600" />
              </div>
              <div className="flex flex-col gap-1 mb-2">
                 <div className="w-24 h-3 bg-gray-200 rounded"></div>
                 <div className="w-16 h-3 bg-yellow-500 rounded"></div>
              </div>
              {/* Big WhatsApp Button */}
              <div className="w-full h-8 bg-green-500 rounded-lg flex items-center justify-center gap-2">
                 <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                 </div>
                 <span className="text-white text-[10px] font-bold uppercase">WhatsApp</span>
              </div>
           </div>
        </div>
      </div>
    ),
    color: "bg-purple-50",
    screenInfo: "O destaque garante que seu anúncio seja visto primeiro por todos."
  },
  {
    title: "Pagamentos e Perfil",
    description: "Gerencie suas vendas e pagamentos via M-Pesa ou e-Mola com facilidade.",
    icon: (
      <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-teal-200 relative shadow-inner flex flex-col">
        {/* Mock Profile/Payment */}
        <div className="p-2 border-b border-gray-200 flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center"><User size={16} className="text-teal-600" /></div>
           <div className="w-20 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="p-4 flex flex-col gap-2">
           <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
              <span className="text-[10px] font-bold">Saldo e-Mola</span>
              <span className="text-[10px] text-teal-600">800 MT</span>
           </div>
           <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
              <span className="text-[10px] font-bold">M-Pesa Ativo</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
           </div>
        </div>
      </div>
    ),
    color: "bg-teal-50",
    screenInfo: "Acompanhe suas estatísticas e destaque seus anúncios pelo Perfil."
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowConfirm(true);
    }
  };

  const handleFinalComplete = () => {
    setShowConfirm(false);
    onComplete();
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 transition-colors duration-500 ${slide.color}`}>
      <div className="w-full max-w-md flex flex-col h-full max-h-[700px] relative">
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-8 w-full">
            {slide.icon}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {slide.title}
          </h2>
          <p className="text-gray-700 text-xl mb-6 leading-relaxed">
            {slide.description}
          </p>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-base text-gray-600 italic border border-white/20 shadow-sm">
             {slide.screenInfo}
          </div>
        </div>

        <div className="p-4 pb-12 flex flex-col gap-6">
          <div className="flex justify-center gap-2.5 mb-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-10 bg-blue-600' : 'w-2.5 bg-gray-400'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={nextSlide}
              className="w-full bg-blue-600 text-white font-black text-2xl py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-600/30"
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Começar <Play size={28} fill="currentColor" />
                </>
              ) : (
                <>
                  Próximo <ChevronRight size={28} />
                </>
              )}
            </button>

            <div className="flex items-center justify-between gap-4">
              {currentSlide > 0 ? (
                <button
                  onClick={prevSlide}
                  className="flex-1 flex items-center justify-center h-14 rounded-2xl border-2 border-gray-400 text-gray-800 font-bold hover:bg-gray-100 transition-all active:scale-95 shadow-sm bg-white/80"
                >
                  <ChevronLeft size={24} className="mr-2" /> Voltar
                </button>
              ) : (
                <div className="flex-1" />
              )}
              
              <button
                onClick={onComplete}
                className="flex-1 text-gray-600 font-bold h-14 rounded-2xl border-2 border-transparent hover:text-gray-900 transition-colors uppercase tracking-wider text-sm"
              >
                Pular tour
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-[60] bg-black/50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-8 text-center max-w-[80%] shadow-2xl animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play size={32} className="text-blue-600 ml-1" fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tudo pronto!</h3>
              <p className="text-gray-500 mb-6">Você conhece as principais funcionalidades do app. Confirmar início?</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFinalComplete}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Sim, vamos lá
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full text-gray-400 font-medium py-2"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;