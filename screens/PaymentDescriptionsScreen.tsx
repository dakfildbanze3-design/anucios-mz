import React from 'react';
import { ArrowLeft, ShieldCheck, Smartphone, CheckCircle2, Clock, ShieldAlert, CreditCard, Zap, Globe } from 'lucide-react';

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
          <h1 className="ml-2 text-xl font-black text-gray-900">Sistemas de Pagamento</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        {/* Intro */}
        <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Como Funcionam os Pagamentos</h2>
            <p className="text-blue-50 font-medium leading-relaxed">
              A Anúncios MZ integra-se com as principais redes de pagamento de Moçambique para oferecer uma experiência segura e automatizada.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-20">
            <Globe size={200} />
          </div>
        </div>

        {/* Security Architecture */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <ShieldCheck size={24} />
            <h3 className="text-xl font-bold">Arquitetura de Segurança</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            O nosso sistema utiliza protocolos de comunicação encriptados para comunicar diretamente com as APIs das operadoras móveis. Nunca armazenamos os seus dados sensíveis ou códigos PIN nos nossos servidores.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Zap className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold text-sm block">Processamento em Tempo Real</span>
                <p className="text-xs text-gray-500">As transações são verificadas instantaneamente através de webhooks seguros.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operators Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 ml-2">Integração com Operadoras</h3>
          
          {/* M-Pesa Info */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 bg-[#E60000] rounded-xl flex items-center justify-center text-white font-black">M</div>
              <h4 className="font-bold">M-Pesa (Vodacom)</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              A nossa integração com o M-Pesa utiliza o sistema STK Push. Isto significa que, após iniciar o processo na nossa plataforma, receberá uma notificação oficial da Vodacom diretamente no seu telemóvel para autorizar a transação com o seu PIN.
            </p>
          </div>

          {/* E-Mola Info */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 bg-[#FFD700] rounded-xl flex items-center justify-center text-black font-black">E</div>
              <h4 className="font-bold">E-Mola (Movitel)</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              O sistema comunica com o gateway da Movitel para validar o número de conta e processar o débito de forma segura. O utilizador recebe um pedido de confirmação via USSD ou Notificação no telemóvel registado.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 p-6 rounded-3xl text-white">
            <CreditCard className="text-primary mb-4" size={24} />
            <h4 className="font-bold mb-2">Sem Intermediários</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              O pagamento vai diretamente da sua conta móvel para a conta da plataforma, reduzindo taxas e tempos de espera.
            </p>
          </div>
          <div className="bg-green-600 p-6 rounded-3xl text-white">
            <Clock className="text-white mb-4" size={24} />
            <h4 className="font-bold mb-2">Ativação Automática</h4>
            <p className="text-xs text-green-100 leading-relaxed">
              O nosso sistema deteta o sucesso do pagamento e ativa as funcionalidades premium do seu anúncio imediatamente.
            </p>
          </div>
        </div>

        {/* Footer Warning */}
        <div className="p-4 flex items-start gap-3 bg-amber-50 rounded-2xl border border-amber-100">
          <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <p className="text-[11px] text-amber-800 font-medium leading-relaxed uppercase tracking-wider">
            AVISO DE SEGURANÇA: A Anúncios MZ nunca solicita o seu PIN por telefone ou chat. O PIN deve ser introduzido apenas no menu de pop-up oficial do seu telemóvel.
          </p>
        </div>
      </div>
    </div>
  );
};
