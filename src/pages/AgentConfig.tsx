import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { motion } from 'motion/react';
import { Bot, Save, Settings2, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

export const AgentConfig: React.FC = () => {
  const { aiConfig, updateAIConfig } = useCRM();
  const [config, setConfig] = useState(aiConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    updateAIConfig(config);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 overflow-y-auto h-full bg-neutral-50"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
              <Bot className="w-8 h-8 text-emerald-600" />
              Configuração do Agente IA
            </h1>
            <p className="text-neutral-500 mt-2">Treine e ajuste o comportamento do seu vendedor autônomo.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* System Instruction */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Settings2 className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">Instrução do Sistema (Prompt Principal)</h2>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              Defina a personalidade, tom de voz e os objetivos principais do agente. Isso guiará todas as interações com os leads.
            </p>
            <textarea
              value={config.systemInstruction}
              onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
              className="w-full h-48 p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm font-mono"
              placeholder="Você é um consultor..."
            />
          </div>

          {/* Proposal Template */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">Template de Proposta</h2>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              Estrutura base que a IA usará para gerar propostas complexas. Use variáveis como {'{{consumptionKwh}}'}.
            </p>
            <textarea
              value={config.proposalTemplate}
              onChange={(e) => setConfig({ ...config, proposalTemplate: e.target.value })}
              className="w-full h-48 p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm font-mono"
              placeholder="Proposta de Sistema Fotovoltaico..."
            />
          </div>

          {/* Automations */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Atendimento Automático</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Permitir que a IA inicie conversas e responda automaticamente a novos leads.
                </p>
              </div>
              <button 
                onClick={() => setConfig({ ...config, autoReply: !config.autoReply })}
                className={`p-2 rounded-full transition-colors ${config.autoReply ? 'text-emerald-600 bg-emerald-50' : 'text-neutral-400 bg-neutral-100'}`}
              >
                {config.autoReply ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
