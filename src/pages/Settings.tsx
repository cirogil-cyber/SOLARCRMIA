import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Building, User, Bell, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Tab = 'empresa' | 'perfil' | 'notificacoes' | 'seguranca';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('empresa');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [companyData, setCompanyData] = useState({
    razaoSocial: 'Solar Tech Soluções Ltda',
    cnpj: '00.000.000/0001-00',
    endereco: 'Av. Paulista, 1000 - São Paulo, SP',
    telefone: '(11) 3000-0000',
    email: 'contato@solartech.com.br'
  });

  useEffect(() => {
    if (user?.user_metadata?.companyData) {
      setCompanyData(user.user_metadata.companyData);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setToast(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { companyData }
      });

      if (error) throw error;
      setToast({ message: 'Configurações salvas com sucesso!', type: 'success' });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setToast({ message: 'Erro ao salvar: ' + error.message, type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 overflow-y-auto h-full bg-neutral-50 relative"
    >
      {toast && (
        <div className={`absolute top-4 right-4 px-4 py-3 rounded-md shadow-lg text-sm font-medium z-50 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-neutral-600" />
            Configurações
          </h1>
          <p className="text-neutral-500 mt-2">Gerencie sua conta, perfil da empresa e preferências do sistema.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Menu Lateral Config */}
          <div className="col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('empresa')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'empresa' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-neutral-600 hover:bg-white hover:text-neutral-900'}`}
            >
              <Building className="w-5 h-5" />
              <span>Empresa</span>
            </button>
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'perfil' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-neutral-600 hover:bg-white hover:text-neutral-900'}`}
            >
              <User className="w-5 h-5" />
              <span>Perfil</span>
            </button>
            <button 
              onClick={() => setActiveTab('notificacoes')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'notificacoes' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-neutral-600 hover:bg-white hover:text-neutral-900'}`}
            >
              <Bell className="w-5 h-5" />
              <span>Notificações</span>
            </button>
            <button 
              onClick={() => setActiveTab('seguranca')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${activeTab === 'seguranca' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-neutral-600 hover:bg-white hover:text-neutral-900'}`}
            >
              <Shield className="w-5 h-5" />
              <span>Segurança</span>
            </button>
          </div>

          {/* Conteúdo Config */}
          <div className="col-span-2 space-y-6">
            {activeTab === 'empresa' && (
              <>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-6">Dados da Empresa</h2>
                  
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Razão Social</label>
                        <input 
                          type="text" 
                          value={companyData.razaoSocial}
                          onChange={e => setCompanyData({...companyData, razaoSocial: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">CNPJ</label>
                        <input 
                          type="text" 
                          value={companyData.cnpj}
                          onChange={e => setCompanyData({...companyData, cnpj: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Endereço Principal</label>
                      <input 
                        type="text" 
                        value={companyData.endereco}
                        onChange={e => setCompanyData({...companyData, endereco: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Telefone Comercial</label>
                        <input 
                          type="text" 
                          value={companyData.telefone}
                          onChange={e => setCompanyData({...companyData, telefone: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Email de Contato</label>
                        <input 
                          type="email" 
                          value={companyData.email}
                          onChange={e => setCompanyData({...companyData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button 
                        type="button" 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                      >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Integrações</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.939 6.937 0 3.825-3.113 6.938-6.939 6.938z"/></svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-900">WhatsApp Business API</h3>
                          <p className="text-xs text-neutral-500">Conectado (+55 11 3000-0000)</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                        <span>Desconectar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'perfil' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Meu Perfil</h2>
                <p className="text-neutral-500">Configurações de perfil em desenvolvimento.</p>
              </div>
            )}

            {activeTab === 'notificacoes' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Notificações</h2>
                <p className="text-neutral-500">Configurações de notificações em desenvolvimento.</p>
              </div>
            )}

            {activeTab === 'seguranca' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Segurança</h2>
                <p className="text-neutral-500">Configurações de segurança em desenvolvimento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
