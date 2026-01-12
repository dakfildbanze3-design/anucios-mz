import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Rocket, PlusCircle, TrendingUp, CreditCard, Play, Home, User, PlusSquare } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Bem-vindo ao Anúncios MZ",
    description: "Navegue pelo nosso Feed principal para encontrar as melhores ofertas em Moçambique.",
    icon: <Home size={80} className="text-blue-500" />,
    color: "bg-blue-50",
    screenInfo: "Esta é a tela de Início (Home) onde você vê todos os anúncios."
  },
  {
    title: "Crie seu anúncio grátis",
    description: "Use o botão '+' no menu para publicar seu veículo, imóvel ou eletrônico rapidamente.",
    icon: <PlusSquare size={80} className="text-green-500" />,
    color: "bg-green-50",
    screenInfo: "A tela de Criação permite preencher fotos, preço e contato."
  },
  {
    title: "Venda mais rápido",
    description: "Destaque seus anúncios para que apareçam na seção de 'Destaques' e no topo das buscas.",
    icon: <TrendingUp size={80} className="text-purple-500" />,
    color: "bg-purple-50",
    screenInfo: "Nos Detalhes do Anúncio, você encontrará a opção 'Impulsionar'."
  },
  {
    title: "Pagamentos seguros",
    description: "Aceitamos M-Pesa e e-Mola para pagamentos instantâneos e seguros via celular.",
    icon: <CreditCard size={80} className="text-orange-500" />,
    color: "bg-orange-50",
    screenInfo: "A tela de Pagamento mostra as instruções para transferência via USSD ou App."
  },
  {
    title: "Gerencie seu Perfil",
    description: "Acompanhe seus anúncios publicados e edite suas informações de contato a qualquer momento.",
    icon: <User size={80} className="text-teal-500" />,
    color: "bg-teal-50",
    screenInfo: "Na tela de Perfil você tem controle total sobre suas vendas."
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
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[600px] relative">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 animate-bounce">
            {slide.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {slide.title}
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            {slide.description}
          </p>
          <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-500 italic border border-gray-200">
             {slide.screenInfo}
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex flex-col gap-4">
          <div className="flex justify-center gap-2 mb-4">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            {currentSlide > 0 ? (
              <button
                onClick={prevSlide}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="w-12" />
            )}

            <button
              onClick={nextSlide}
              className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Começar <Play size={20} fill="currentColor" />
                </>
              ) : (
                <>
                  Próximo <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
          
          <button
            onClick={onComplete}
            className="text-gray-400 font-medium hover:text-gray-600 transition-colors"
          >
            Pular tour
          </button>
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