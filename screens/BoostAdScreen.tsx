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
  { id: 'free_boost', name: 'Promocional', price: 0, duration: 90, features: ['Destaque por 3 Meses', 'Selo de Destaque', 'Topo da Página', 'Grátis (Período de Teste)'], isPopular: true },
];

const OPERATORS = [
  { 
    id: 'free', 
    name: 'Ativação Grátis', 
    bgColor: 'bg-green-600', 
    textColor: 'text-white',
    instruction: 'Ative seu destaque gratuitamente por 3 meses',
    codePrefix: 'FREE'
  }
];

type Step = 'PLAN_SELECTION' | 'PAYMENT_FORM' | 'PROCESSING' | 'RESULT';

export const BoostAdScreen: React.FC<BoostAdScreenProps> = ({ onClose, onPaymentSuccess, adId }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('PLAN_SELECTION');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('free_boost');
  const [selectedOperator, setSelectedOperator] = useState<string>('free');
  
  // Form Data
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Logic State
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [resultMessage, setResultMessage] = useState('');

  const activePlan = PLANS.find(p => p.id === selectedPlanId);

  // ------------------------------------------------------------------
  // REAL SUPABASE DEBITO-PAYMENT INTEGRATION
  // ------------------------------------------------------------------
  const confirmPayment = async () => {
    if (!adId || !activePlan) return;

    setIsProcessing(true);
    setStep('PROCESSING');

    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_featured: true })
        .eq('id', adId);

      if (error) throw error;

      setResultStatus('success');
      setResultMessage("Destaque ativado com sucesso por 3 meses! 🚀");
      showToast("Destaque ativado com sucesso!", "success");
      
    } catch (error: any) {
      console.error("Boost Error:", error);
      setResultStatus('error');
      setResultMessage("Erro ao ativar o destaque. Tente novamente.");
      showToast("Erro ao processar", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const startPollingStatus = async (paymentId: string) => {
    if (!paymentId) return;
    
    const poll = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`https://kfhgpyajrjdtuqsdabye.supabase.co/functions/v1/payments-debit?id=${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          }
        });
        const data = await response.json();
        
        if (data.status === 'success' || data.status === 'completed') {
          setResultStatus('success');
          setResultMessage("Pagamento confirmado e anúncio destacado! 🚀");
          return true; // stop polling
        } else if (data.status === 'failed' || data.status === 'error') {
          setResultStatus('error');
          setResultMessage("O pagamento falhou ou foi cancelado.");
          return true; // stop polling
        }
        return false; // continue polling
      } catch (e) {
        console.error("Polling error:", e);
        return false;
      }
    };

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const shouldStop = await poll();
      if (shouldStop || attempts > 30) { // Stop after 5 mins (10s * 30)
        clearInterval(interval);
      }
    }, 10000);
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
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
                   <div className="mt-1 bg-white p-1.5 rounded-full shadow-sm h-fit">
                      <AlertTriangle size={20} className="text-amber-600" />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-sm">Promoção de Lançamento</h3>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        O sistema está a ser atualizado. Aproveite: destacar anúncios é <span className="font-bold text-amber-700">GRÁTIS por 3 meses!</span>
                      </p>
                   </div>
                </div>

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
            <Header onClose={() => setStep('PLAN_SELECTION')} title="Destaque Grátis" backButton />

            <div className="p-8 overflow-y-auto space-y-8 flex-1 flex flex-col items-center justify-center text-center">
               <div className="size-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                  <Rocket size={40} />
               </div>
               
               <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Ativar Destaque Grátis</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">
                    Aproveite nossa promoção de lançamento. Clique no botão abaixo para colocar seu anúncio no topo por 3 meses.
                  </p>
               </div>
            </div>

            <div className="mt-auto border-t border-gray-100 p-6 bg-white">
                <button 
                onClick={confirmPayment}
                className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-3"
                >
                  Ativar Grátis
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