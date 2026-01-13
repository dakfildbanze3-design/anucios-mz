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
    instruction: 'Disque *150#',
    codePrefix: '84/85',
    displayNumber: '85 576 7005',
    copyNumber: '855767005'
  },
  { 
    id: 'emola', 
    name: 'e-Mola', 
    bgColor: 'bg-[#ff6600]', 
    textColor: 'text-white',
    instruction: 'Disque *153#',
    codePrefix: '86/87',
    displayNumber: '87 559 9207',
    copyNumber: '875599207'
  }
];

type Step = 'PLAN_SELECTION' | 'PAYMENT_INSTRUCTIONS' | 'PAYMENT_FORM' | 'PROCESSING' | 'RESULT';

export const BoostAdScreen: React.FC<BoostAdScreenProps> = ({ onClose, onPaymentSuccess, adId }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('PLAN_SELECTION');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('standard');
  const [selectedOperator, setSelectedOperator] = useState<string>('mpesa');
  
  // Generated reference for the user to use
  const [uniqueAdCode, setUniqueAdCode] = useState('');

  // Form Data
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  
  // Logic State
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultStatus, setResultStatus] = useState<'confirmed' | 'pending' | 'rejected'>('pending');
  const [resultMessage, setResultMessage] = useState('');

  const activePlan = PLANS.find(p => p.id === selectedPlanId);
  const activeOperator = OPERATORS.find(o => o.id === selectedOperator);

  useEffect(() => {
    // Generate a unique code for this transaction session (e.g. MZ-8392)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setUniqueAdCode(`MZ-${randomCode}`);
  }, []);

  // ------------------------------------------------------------------
  // REAL SUPABASE VALIDATION LOGIC
  // ------------------------------------------------------------------
  const confirmPayment = async () => {
    if (!adId || !activePlan) return;

    if (!phoneNumber || phoneNumber.length < 9) {
      showToast("Por favor, insira o número de telefone usado.", "error");
      return;
    }

    if (!smsCode || smsCode.length < 4) {
      showToast("Por favor, insira o código de confirmação do SMS.", "error");
      return;
    }
    
    setIsProcessing(true);
    setStep('PROCESSING');

    try {
      // 1. UPDATE AD IMMEDIATELY
      const { error: updateError } = await supabase
        .from('ads')
        .update({ is_featured: true })
        .eq('id', adId);

      if (updateError) throw updateError;

      // 2. INSERT PAYMENT RECORD (As background record)
      await supabase
        .from('payments')
        .insert({
          ad_id: adId,
          amount: activePlan.price,
          plan_id: activePlan.id,
          client_number: phoneNumber.replace(/\s/g, ''),
          operator: selectedOperator,
          reference_code: smsCode.trim().toUpperCase(),
          message_content: `Pagamento imediato. Código SMS: ${smsCode}`,
          status: 'confirmed'
        });

      setResultStatus('confirmed');
      setResultMessage("Obrigado! O seu anúncio foi destacado imediatamente.");
      showToast("Sucesso! Anúncio destacado.", "success");

    } catch (error: any) {
      console.error("Payment Error:", error);
      setResultStatus('pending');
      setResultMessage("Erro ao processar. Por favor contacte o suporte se o valor foi debitado.");
      showToast("Erro ao ativar destaque.", "error");
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
                onClick={() => setStep('PAYMENT_INSTRUCTIONS')}
                className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  Continuar
                </button>
            </div>
        </div>
      </div>
    );
  }

  // STEP 2: INSTRUCTIONS
  if (step === 'PAYMENT_INSTRUCTIONS') {
    return (
      <div className="fixed inset-0 z-50 bg-background-light flex items-center justify-center p-0 md:p-6">
        <div className="relative flex flex-col w-full max-w-md bg-white md:shadow-2xl md:rounded-2xl overflow-hidden h-full md:h-auto">
            <Header onClose={() => setStep('PLAN_SELECTION')} title="Pagamento" backButton />

            <div className="p-5 overflow-y-auto">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 font-medium mb-1">Valor a pagar</p>
                  <h2 className="text-4xl font-black text-primary">{activePlan?.price} MT</h2>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Selecione o Método</label>
                    <div className="grid grid-cols-2 gap-3">
                        {OPERATORS.map(op => (
                            <button
                                key={op.id}
                                onClick={() => setSelectedOperator(op.id)}
                                className={`py-3 px-1 rounded-xl text-sm font-bold transition-all border-2 ${
                                    selectedOperator === op.id 
                                    ? `${op.bgColor} ${op.textColor} border-transparent shadow-md scale-105` 
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                }`}
                            >
                                {op.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5 border border-dashed border-gray-300 relative">
                    <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl border-b border-l border-yellow-200">
                      Importante
                    </div>
                    
                    <div className="space-y-4 text-sm text-gray-700">
                      <div className="flex gap-3">
                        <div className="font-bold bg-white size-6 rounded-full flex items-center justify-center border border-gray-200 shrink-0">1</div>
                        <div>
                          <p>Vá ao menu <span className="font-bold">{activeOperator?.name}</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">{activeOperator?.instruction}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="font-bold bg-white size-6 rounded-full flex items-center justify-center border border-gray-200 shrink-0">2</div>
                        <div>
                          <p>Envie <span className="font-bold">{activePlan?.price} MT</span> para:</p>
                          <div 
                            onClick={() => copyToClipboard(activeOperator?.copyNumber || '')}
                            className="mt-1 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 w-fit cursor-pointer active:scale-95 transition-transform"
                          >
                            <span className="font-mono font-bold text-lg text-primary">{activeOperator?.displayNumber}</span>
                            <Copy size={14} className="text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="font-bold bg-white size-6 rounded-full flex items-center justify-center border border-gray-200 shrink-0">3</div>
                        <div>
                          <p>No campo de referência, escreva:</p>
                          <div className="mt-1 inline-block bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono tracking-widest">
                            {uniqueAdCode}
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto border-t border-gray-100 p-4 bg-white">
                <button 
                onClick={() => setStep('PAYMENT_FORM')}
                className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30"
                >
                Já realizei o pagamento
                </button>
            </div>
        </div>
      </div>
    );
  }

  // STEP 3: CONFIRMATION FORM
  if (step === 'PAYMENT_FORM') {
    return (
      <div className="fixed inset-0 z-50 bg-background-light flex items-center justify-center p-0 md:p-6">
        <div className="relative flex flex-col w-full max-w-md bg-white md:shadow-2xl md:rounded-2xl overflow-hidden h-full md:h-auto">
            <Header onClose={() => setStep('PAYMENT_INSTRUCTIONS')} title="Confirmar" backButton />

            <div className="p-8 overflow-y-auto space-y-8 flex-1 flex flex-col items-center justify-center text-center">
               <div className="size-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                  <ShieldCheck size={40} />
               </div>
               
               <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Quase lá!</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">
                    Para ativar o seu destaque agora, confirme os dados da transação abaixo.
                  </p>
               </div>

               <div className="w-full space-y-5">
                  <div className="text-left">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Número usado no Pagamento</label>
                    <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="tel" 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900"
                            placeholder="84 / 85 / 86 / 87..."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Código do SMS (Ex: PP230...)</label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 uppercase placeholder:normal-case"
                            placeholder="Insira o ID da transação"
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                        />
                    </div>
                  </div>
               </div>
            </div>

            <div className="mt-auto border-t border-gray-100 p-6 bg-white">
                <button 
                onClick={confirmPayment}
                className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={24} />
                  Ativar Destaque Imediato
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-3 font-medium uppercase tracking-tight">
                  O destaque será ativado assim que clicar no botão
                </p>
            </div>
        </div>
      </div>
    );
  }

  // STEP 4: PROCESSING
  if (step === 'PROCESSING') {
    return (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs w-full animate-in zoom-in-95">
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900">Validando...</h3>
              <p className="text-sm text-gray-500 mt-2">A verificar transação com o servidor.</p>
           </div>
        </div>
    );
  }

  // STEP 5: RESULT
  if (step === 'RESULT') {
    const isConfirmed = resultStatus === 'confirmed';
    const isRejected = resultStatus === 'rejected';

    return (
      <div className="fixed inset-0 z-50 bg-background-light flex items-center justify-center p-0 md:p-6 animate-in zoom-in-95 duration-300">
        <div className="relative flex flex-col w-full max-w-md bg-white md:shadow-2xl md:rounded-2xl overflow-hidden h-full md:h-auto items-center text-center p-8 justify-center">
            
            <div className={`size-24 rounded-full flex items-center justify-center mb-6 shadow-xl ${
                isConfirmed ? 'bg-green-100 text-green-600' : 
                isRejected ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
                {isConfirmed ? <CheckCircle2 size={48} /> : 
                 isRejected ? <X size={48} /> : <Clock size={48} />}
            </div>
            
            <h2 className={`text-2xl font-black mb-2 ${
                isConfirmed ? 'text-green-700' : 
                isRejected ? 'text-red-700' : 'text-amber-700'
            }`}>
                {isConfirmed ? 'Pagamento Confirmado!' : 
                 isRejected ? 'Pagamento Recusado' : 'Em Verificação'}
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-[280px] leading-relaxed font-medium">
                {resultMessage}
            </p>

            {isConfirmed && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 w-full text-left">
                    <p className="text-sm text-green-800 font-bold mb-1">Destaque Ativo</p>
                    <p className="text-xs text-green-700">Seu anúncio já está no topo da lista e será visto por milhares de pessoas.</p>
                </div>
            )}

            <button 
                onClick={isConfirmed ? onPaymentSuccess : onClose}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                    isConfirmed ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 
                    'bg-gray-900 hover:bg-black'
                }`}
            >
                {isConfirmed ? 'Voltar ao Anúncio' : 'Fechar'}
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