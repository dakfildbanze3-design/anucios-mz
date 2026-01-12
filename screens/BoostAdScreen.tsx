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
  const [referenceCode, setReferenceCode] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  
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
    
    setIsProcessing(true);
    setStep('PROCESSING');

    const cleanPhone = phoneNumber.replace(/\s/g, '').replace('+258', '');
    const cleanRef = referenceCode.trim().toUpperCase();
    
    let riskScore = 0;
    const reasons: string[] = [];

    // 1. Validation: Phone Number Format (Mozambique)
    const mozPhoneRegex = /^(84|85|82|83|86|87)\d{7}$/;
    if (!mozPhoneRegex.test(cleanPhone)) {
      riskScore += 40;
      reasons.push("Número de telefone inválido ou formato incorreto.");
    }

    // 2. Validation: Message Keywords
    const msgLower = paymentMessage.toLowerCase();
    const keywords = ['transfer', 'pago', 'confirm', 'sucesso', 'transacao', 'id', 'ref', 'enviado', 'recebido'];
    const hasKeywords = keywords.some(k => msgLower.includes(k));
    
    if (paymentMessage.length < 5) {
      riskScore += 20;
      reasons.push("Mensagem muito curta.");
    } else if (!hasKeywords) {
      riskScore += 10;
      reasons.push("Mensagem não parece conter confirmação.");
    }

    // 3. Validation: Reference Format
    if (cleanRef.length < 5 || cleanRef.length > 25) {
      riskScore += 30;
      reasons.push("Código de referência com tamanho inválido.");
    }

    try {
      // 4. DATABASE CHECK: Check for duplicate reference
      // Accessing Supabase directly
      const { data: existingRef } = await supabase
        .from('payments')
        .select('id, status')
        .eq('reference_code', cleanRef)
        .maybeSingle();

      if (existingRef) {
        riskScore += 100; // Immediate Fail
        reasons.push("Este código de referência já foi utilizado.");
      }

      // Determine Status
      // If risk is low (< 50), we Auto-Confirm
      const finalStatus = riskScore < 50 ? 'confirmed' : 'pending';

      // 5. INSERT PAYMENT RECORD
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          ad_id: adId,
          amount: activePlan.price,
          plan_id: activePlan.id,
          client_number: cleanPhone,
          operator: selectedOperator,
          reference_code: cleanRef,
          message_content: paymentMessage,
          status: finalStatus,
          risk_score: riskScore,
          risk_reasons: reasons
        });

      if (insertError) throw insertError;

      // 6. UPDATE AD (If Confirmed)
      if (finalStatus === 'confirmed') {
        const { error: updateError } = await supabase
          .from('ads')
          .update({ is_featured: true })
          .eq('id', adId);

        if (updateError) {
          console.error("Failed to activate ad", updateError);
          showToast("Erro ao ativar destaque, contacte o suporte.", "error");
        }
      }

      setResultStatus(finalStatus);
      if (finalStatus === 'confirmed') {
        setResultMessage("Pagamento validado! O seu anúncio foi destacado.");
        showToast("Sucesso! Anúncio destacado.", "success");
      } else if (reasons.includes("Este código de referência já foi utilizado.")) {
        setResultStatus('rejected');
        setResultMessage("Referência duplicada. Verifique os dados.");
        showToast("Código de referência duplicado.", "error");
      } else {
        setResultMessage("Pagamento em análise. Iremos notificar brevemente.");
        showToast("Pagamento enviado para análise.", "info");
      }

    } catch (error: any) {
      console.error("Payment Error:", error);
      setResultStatus('pending'); // Default to pending on error to be safe
      setResultMessage("Erro de conexão. O pagamento ficou pendente para revisão.");
      showToast("Erro de conexão. Tente novamente.", "error");
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

            <div className="p-5 overflow-y-auto space-y-4">
               <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 text-sm text-blue-800 border border-blue-100">
                  <ShieldCheck size={20} />
                  <p>Insira os dados do SMS que recebeu.</p>
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Seu Número de Telefone</label>
                  <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                          type="tel" 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium text-gray-900"
                          placeholder="84 123 4567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Código de Transação (ID)</label>
                  <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                          type="text" 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium uppercase placeholder:normal-case text-gray-900"
                          placeholder="Ex: 8H3KL92..."
                          value={referenceCode}
                          onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                      />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 pl-1">O código que vem no SMS (Ex: PP230...)</p>
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Mensagem do SMS (Cole aqui)</label>
                  <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                      <textarea 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none h-24 text-gray-900"
                          placeholder="Ex: Confirmado. Transferiu 50MT para..."
                          value={paymentMessage}
                          onChange={(e) => setPaymentMessage(e.target.value)}
                      />
                  </div>
               </div>
            </div>

            <div className="mt-auto border-t border-gray-100 p-4 bg-white">
                <button 
                onClick={confirmPayment}
                className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Confirmar Pagamento
                </button>
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