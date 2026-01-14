import React, { useState, useEffect } from 'react';
import { 
  X, 
  Rocket, 
  Check, 
  Lock,
  Smartphone,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Copy,
  ShieldCheck
} from 'lucide-react';
import { PricingPlan } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastContext';

interface BoostAdScreenProps {
  onClose: () => void;
  onPaymentSuccess: () => void;
  adId?: string;
}

const PLANS: PricingPlan[] = [
  { id: 'basic', name: 'Rápido', price: 50, duration: 3, features: ['Destaque por 3 dias', 'Selo de Destaque'] },
  { id: 'standard', name: 'Semanal', price: 100, duration: 7, features: ['Destaque por 7 dias', 'Selo de Destaque', 'Topo da Página'], isPopular: true },
  { id: 'premium', name: 'Quinzenal', price: 150, duration: 14, features: ['Destaque por 14 dias', 'Selo de Destaque', 'Topo da Página', 'Suporte Prioritário'] },
];

const OPERATORS = [
  { 
    id: 'mpesa', 
    name: 'M-Pesa', 
    bgColor: 'bg-[#e60000]', 
    textColor: 'text-white',
    instruction: 'Confirme o pagamento no seu celular',
    codePrefix: '84/85'
  },
  { 
    id: 'emola', 
    name: 'e-Mola', 
    bgColor: 'bg-[#ff6600]', 
    textColor: 'text-white',
    instruction: 'Confirme o pagamento no seu celular',
    codePrefix: '86/87'
  },
  { 
    id: 'mkesh', 
    name: 'mKesh', 
    bgColor: 'bg-[#ffcc00]', 
    textColor: 'text-gray-900',
    instruction: 'Confirme o pagamento no seu celular',
    codePrefix: '82'
  }
];

type Step = 'PLAN_SELECTION' | 'PAYMENT_FORM' | 'PROCESSING' | 'RESULT';

export const BoostAdScreen: React.FC<BoostAdScreenProps> = ({ onClose, onPaymentSuccess, adId }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('PLAN_SELECTION');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('standard');
  const [selectedOperator, setSelectedOperator] = useState<string>('mpesa');
  
  // Form Data
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Logic State
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [resultMessage, setResultMessage] = useState('');

  const activePlan = PLANS.find(p => p.id === selectedPlanId);

  // ------------------------------------------------------------------
  // REAL SUPABASE CLEVER-API INTEGRATION
  // ------------------------------------------------------------------
  const confirmPayment = async () => {
    if (!adId || !activePlan) return;

    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length !== 9 || !cleanPhone.startsWith('8')) {
      showToast("Número inválido. Deve começar com 8 e ter 9 dígitos.", "error");
      return;
    }
    
    setIsProcessing(true);
    setStep('PROCESSING');

    try {
      const response = await fetch('https://kfhgpyajrjdtuqsdabye.supabase.co/functions/v1/debito-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero: cleanPhone,
          valor: activePlan.price,
          provider: selectedOperator
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResultStatus('success');
        setResultMessage("Pagamento enviado com sucesso! ✅");
        showToast("Pagamento enviado com sucesso!", "success");
      } else {
        setResultStatus('error');
        setResultMessage(data.error || "Erro ao enviar pagamento ❌");
        showToast(data.error || "Erro no pagamento", "error");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      setResultStatus('error');
      setResultMessage("Erro ao processar o pagamento. Verifique sua conexão.");
      showToast("Erro de conexão", "error");
    } finally {
      setIsProcessing(false);
      setStep('RESULT');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Número copiado!", "success");
  };

  // ------------------------------------------------------------------
  // RENDER STEPS
  // ------------------------------------------------------------------

  // STEP 1: PLAN SELECTION
  if (step === 'PLAN_SELECTION') {
    return (
      <div className="fixed inset-0 z-50 bg-background-light flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
        <div className="relative flex flex-col w-full max-w-md bg-white md:shadow-2xl md:rounded-2xl overflow-hidden h-full md:h-auto md:max-h-[90vh]">
            <Header onClose={onClose} title="Escolha o Plano" />
            
            <div className="p-5 space-y-4 overflow-y-auto">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                   <div className="mt-1 bg-white p-1.5 rounded-full shadow-sm h-fit">
                      <Rocket size={20} className="text-primary" />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-sm">Venda 10x Mais Rápido</h3>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Anúncios destacados aparecem primeiro e recebem até 95% dos cliques dos compradores.
                      </p>
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                    {PLANS.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                        <button 
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all w-full text-left ${
                            isSelected 
                            ? 'bg-white border-primary shadow-lg scale-[1.02] z-10' 
                            : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                        >
                        {plan.isPopular && (
                            <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                            Popular
                            </div>
                        )}
                        
                        <div>
                            <h3 className={`font-black ${isSelected ? 'text-primary' : 'text-gray-900'}`}>{plan.name}</h3>
                            <div className="flex flex-col gap-0.5 mt-1">
                              {plan.features.map((f, i) => (
                                <span key={i} className="text-xs text-gray-500 flex items-center gap-1">
                                  <Check size={10} className="text-green-500" /> {f}
                                </span>
                              ))}
                            </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                            <span className="block text-2xl font-black text-gray-900">{plan.price} MT</span>
                            <span className="text-[10px] font-medium text-gray-400 uppercase">Preço Único</span>
                        </div>
                        </button>
                    );
                    })}
                </div>
            </div>

            <div className="mt-auto border-t border-gray-100 p-4 bg-white">
                <button 
                onClick={() => setStep('PAYMENT_FORM')}
                className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  Continuar
                </button>
            </div>
        </div>
      </div>
    );
  }

  // STEP 2: PAYMENT FORM
  if (step === 'PAYMENT_FORM') {
    return (
      <div className="fixed inset-0 z-50 bg-background-light flex items-center justify-center p-0 md:p-6">
        <div className="relative flex flex-col w-full max-w-md bg-white md:shadow-2xl md:rounded-2xl overflow-hidden h-full md:h-auto">
            <Header onClose={() => setStep('PLAN_SELECTION')} title="Pagamento" backButton />

            <div className="p-8 overflow-y-auto space-y-8 flex-1 flex flex-col items-center justify-center text-center">
               <div className="size-20 bg-blue-100 rounded-full flex items-center justify-center text-primary mb-2">
                  <Smartphone size={40} />
               </div>
               
               <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Pagar com Carteira</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">
                    Escolha sua carteira móvel e insira seu número.
                  </p>
               </div>

               <div className="w-full space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                      {OPERATORS.map(op => (
                          <button
                              key={op.id}
                              onClick={() => setSelectedOperator(op.id)}
                              className={`py-3 px-1 rounded-xl text-xs font-bold transition-all border-2 ${
                                  selectedOperator === op.id 
                                  ? `${op.bgColor} ${op.textColor} border-transparent shadow-md scale-105` 
                                  : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                              }`}
                          >
                              {op.name}
                          </button>
                      ))}
                  </div>

                  <div className="text-left">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Número da Carteira</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-gray-200 pr-3 mr-3">
                          <span className="text-lg">🇲🇿</span>
                          <span className="text-sm font-bold text-gray-500">+258</span>
                        </div>
                        <input 
                            type="tel" 
                            maxLength={9}
                            className="w-full pl-28 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900"
                            placeholder="8x xxx xxxx"
                            value={phoneNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length <= 9) setPhoneNumber(val);
                            }}
                        />
                    </div>
                  </div>
               </div>
            </div>

            <div className="mt-auto border-t border-gray-100 p-6 bg-white">
                <button 
                onClick={confirmPayment}
                className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
                >
                  Pagar {activePlan?.price} MT
                </button>
            </div>
        </div>
      </div>
    );
  }

  // STEP 3: PROCESSING
  if (step === 'PROCESSING') {
    return (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs w-full animate-in zoom-in-95">
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900">Processando...</h3>
              <p className="text-sm text-gray-500 mt-2">Aguarde a notificação no seu celular.</p>
           </div>
        </div>
    );
  }

  // STEP 4: RESULT
  if (step === 'RESULT') {
    const isSuccess = resultStatus === 'success';

    return (
      <div className="fixed inset-0 z-50 bg-background-light flex items-center justify-center p-0 md:p-6 animate-in zoom-in-95 duration-300">
        <div className="relative flex flex-col w-full max-w-md bg-white md:shadow-2xl md:rounded-2xl overflow-hidden h-full md:h-auto items-center text-center p-8 justify-center">
            
            <div className={`size-24 rounded-full flex items-center justify-center mb-6 shadow-xl ${
                isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
                {isSuccess ? <CheckCircle2 size={48} /> : <X size={48} />}
            </div>
            
            <h2 className={`text-2xl font-black mb-2 ${
                isSuccess ? 'text-green-700' : 'text-red-700'
            }`}>
                {isSuccess ? 'Pagamento Iniciado!' : 'Erro no Pagamento'}
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-[280px] leading-relaxed font-medium">
                {resultMessage}
            </p>

            <button 
                onClick={isSuccess ? onPaymentSuccess : onClose}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                    isSuccess ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-gray-900 hover:bg-black'
                }`}
            >
                {isSuccess ? 'Concluído' : 'Tentar Novamente'}
            </button>
        </div>
      </div>
    );
  }

  return null;
};

// Simple Header Component
const Header = ({ onClose, title, backButton }: { onClose: () => void, title: string, backButton?: boolean }) => (
  <div className="flex items-center bg-white p-4 sticky top-0 z-20 border-b border-gray-100 shadow-sm shrink-0">
    <button 
      onClick={onClose}
      className="text-gray-500 flex size-10 items-center justify-center hover:bg-gray-50 rounded-full transition-colors"
    >
      {backButton ? <div className="font-bold text-sm">Voltar</div> : <X size={24} />}
    </button>
    <h2 className="text-gray-900 text-lg font-bold flex-1 text-center pr-10">{title}</h2>
  </div>
);