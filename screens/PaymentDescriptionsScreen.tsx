import React from 'react';
import { ArrowLeft, ShieldCheck, Smartphone, CheckCircle2, Clock, MessageSquare, ShieldAlert } from 'lucide-react';

interface PaymentDescriptionsScreenProps {
  onBack: () => void;
}

export const PaymentDescriptionsScreen: React.FC<PaymentDescriptionsScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light font-display pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="ml-2 text-xl font-black text-gray-900">Métodos de Pagamento</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        {/* Intro */}
        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Pagamentos Seguros em Moçambique</h2>
            <p className="text-blue-50 font-medium leading-relaxed">
              Utilizamos as principais carteiras móveis do país para garantir que as suas transações sejam rápidas, seguras e fáceis.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-20">
            <ShieldCheck size={200} />
          </div>
        </div>

        {/* M-Pesa Section */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-14 bg-[#E60000] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <span className="font-black text-xl">M</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">M-Pesa (Vodacom)</h3>
              <p className="text-sm text-gray-500 font-medium">O método mais popular de Moçambique</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-1 size-6 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-[#E60000]">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pagamentos instantâneos via confirmação direta no seu telemóvel (Push STK).
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 size-6 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-[#E60000]">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                A confirmação do seu destaque é imediata após a introdução do PIN no seu telemóvel.
              </p>
            </div>
          </div>
        </div>

        {/* E-Mola Section */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-14 bg-[#FFD700] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
              <span className="font-black text-xl">E</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">E-Mola (Movitel)</h3>
              <p className="text-sm text-gray-500 font-medium">Simples e acessível em todo o país</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-1 size-6 shrink-0 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Introduza o seu número Movitel e receba o pedido de autorização para o pagamento.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 size-6 shrink-0 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Baixas taxas de serviço e ativação ultra-rápida do seu anúncio.
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Ativação Rápida</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Não precisa de esperar dias. Uma vez confirmado o pagamento, o seu destaque é ativado no sistema em segundos.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 mb-4">
              <Smartphone size={20} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Suporte 24/7</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Tem problemas com o pagamento? A nossa equipa de suporte está disponível para o ajudar via WhatsApp ou e-mail.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 flex items-start gap-3 bg-amber-50 rounded-2xl border border-amber-100">
          <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
            Certifique-se sempre de que está a utilizar os canais oficiais da Anúncios MZ. Nunca partilhe o seu PIN de transação com ninguém, ele deve ser introduzido apenas no seu telemóvel quando solicitado pelo sistema oficial da operadora.
          </p>
        </div>
      </div>
    </div>
  );
};
