import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Link, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const Integrations: React.FC = () => {
  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [mailchimpConnected, setMailchimpConnected] = useState(true);
  const [googleAdsConnected, setGoogleAdsConnected] = useState(false);

  const handleConnect = (service: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    // Simulate connection
    setTimeout(() => {
      setter(true);
      alert(`${service} conectado com sucesso!`);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-5xl mx-auto h-full overflow-y-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Integrações de Marketing</h1>
        <p className="text-neutral-500 mt-2">Conecte suas ferramentas favoritas para sincronização bidirecional de dados.</p>
      </div>

      <div className="space-y-6">
        {/* HubSpot */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#ff7a59]/10 rounded-xl flex items-center justify-center shrink-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HubSpot_Logo.svg/1024px-HubSpot_Logo.svg.png" alt="HubSpot" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">HubSpot CRM</h3>
              <p className="text-sm text-neutral-500">Sincronize leads, contatos e negócios automaticamente.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hubspotConnected ? (
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4" /> Conectado
              </span>
            ) : (
              <button 
                onClick={() => handleConnect('HubSpot', setHubspotConnected)}
                className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <Link className="w-4 h-4" /> Conectar
              </button>
            )}
            <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mailchimp */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FFE01B]/20 rounded-xl flex items-center justify-center shrink-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Mailchimp_Freddie_Icon.svg/1024px-Mailchimp_Freddie_Icon.svg.png" alt="Mailchimp" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Mailchimp</h3>
              <p className="text-sm text-neutral-500">Envie leads para listas de e-mail e campanhas de nutrição.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {mailchimpConnected ? (
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4" /> Conectado
              </span>
            ) : (
              <button 
                onClick={() => handleConnect('Mailchimp', setMailchimpConnected)}
                className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <Link className="w-4 h-4" /> Conectar
              </button>
            )}
            <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Google Ads */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Ads_logo.svg/1024px-Google_Ads_logo.svg.png" alt="Google Ads" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Google Ads</h3>
              <p className="text-sm text-neutral-500">Importe dados de campanhas e envie conversões offline.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {googleAdsConnected ? (
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4" /> Conectado
              </span>
            ) : (
              <button 
                onClick={() => handleConnect('Google Ads', setGoogleAdsConnected)}
                className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <Link className="w-4 h-4" /> Conectar
              </button>
            )}
            <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <div className="flex items-start gap-4">
          <RefreshCw className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
          <div>
            <h4 className="text-base font-bold text-blue-900">Sincronização Bidirecional Ativa</h4>
            <p className="text-sm text-blue-800 mt-1">
              Quando conectadas, as integrações sincronizam os dados a cada 15 minutos. Alterações feitas no CRM refletirão nas plataformas de marketing e vice-versa, garantindo que suas campanhas usem os dados mais recentes de qualificação da IA.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
