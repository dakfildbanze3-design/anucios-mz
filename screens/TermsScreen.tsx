import React from 'react';
import { ArrowLeft, ShieldAlert, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface TermsScreenProps {
  onBack: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light font-display">
      <div className="relative flex flex-col max-w-3xl mx-auto bg-white shadow-xl min-h-screen md:min-h-0 md:my-8 md:rounded-2xl overflow-hidden">
        {/* Top App Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-text-main">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-hand font-normal tracking-wide text-text-main pb-1">Termos e Condições</h1>
          <div className="w-10"></div> 
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 pb-10 bg-gray-50/50">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center text-primary mb-3">
              <FileText size={32} />
            </div>
            <h2 className="text-3xl font-display font-bold text-center text-gray-900">Regras de Utilização</h2>
            <p className="text-sm text-center text-gray-500 mt-1">Última atualização: Outubro 2023</p>
          </div>

          <div className="space-y-6">
            {/* Section 1: General */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="bg-gray-100 size-6 rounded flex items-center justify-center text-xs">1</span>
                Responsabilidade
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                O <strong>Classificados MZ</strong> é uma plataforma de conexão entre vendedores e compradores. Não nos responsabilizamos pela qualidade dos produtos, veracidade dos anúncios ou transações financeiras realizadas entre as partes.
              </p>
            </section>

            {/* Section 2: Prohibited Items */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="bg-gray-100 size-6 rounded flex items-center justify-center text-xs">2</span>
                O que é PROIBIDO anunciar
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-gray-600">
                  <XCircle className="text-red-500 shrink-0" size={20} />
                  <span>Produtos ilegais, roubados ou de origem duvidosa.</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-600">
                  <XCircle className="text-red-500 shrink-0" size={20} />
                  <span>Armas de fogo, munições ou explosivos.</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-600">
                  <XCircle className="text-red-500 shrink-0" size={20} />
                  <span>Drogas, medicamentos controlados ou suplementos proibidos.</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-600">
                  <XCircle className="text-red-500 shrink-0" size={20} />
                  <span>Conteúdo adulto ou ofensivo.</span>
                </li>
              </ul>
            </section>

            {/* Section 3: Safety Tips */}
            <section className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-amber-600" size={24} />
                <h3 className="font-bold text-gray-900">Segurança (Muito Importante)</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1">
                    <CheckCircle className="text-green-600" size={16} />
                  </div>
                  <div>
                    <strong className="text-sm block text-gray-900">Encontros Públicos</strong>
                    <p className="text-sm text-gray-600">Marque encontros sempre em locais públicos movimentados (Shoppings, Bombas de Combustível, Esquadras).</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1">
                    <ShieldAlert className="text-red-600" size={16} />
                  </div>
                  <div>
                    <strong className="text-sm block text-gray-900">Pagamentos Antecipados</strong>
                    <p className="text-sm text-gray-600">NUNCA envie dinheiro via M-Pesa/e-Mola como "sinal" ou "reserva" sem ver o produto pessoalmente.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1">
                    <CheckCircle className="text-green-600" size={16} />
                  </div>
                  <div>
                    <strong className="text-sm block text-gray-900">Teste o Produto</strong>
                    <p className="text-sm text-gray-600">Verifique o funcionamento de eletrónicos e mecânica de viaturas antes de pagar.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Privacy */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="bg-gray-100 size-6 rounded flex items-center justify-center text-xs">3</span>
                Privacidade de Dados
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Ao criar um anúncio, o seu número de telefone ficará visível publicamente para que os compradores possam contactá-lo. Não partilhamos os seus dados com terceiros para fins de marketing sem o seu consentimento.
              </p>
            </section>

             <div className="pt-4 text-center">
               <p className="text-xs text-gray-400">Classificados MZ © 2024</p>
             </div>
          </div>
        </main>

        <div className="bg-white border-t border-gray-200 p-4">
          <button 
            onClick={onBack}
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Li e Concordo
          </button>
        </div>
      </div>
    </div>
  );
};