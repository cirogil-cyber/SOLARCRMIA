import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRM, ChatMessage } from '../context/CRMContext';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Bot, User, Send, Paperclip, Mic, Image as ImageIcon, 
  Video, FileText, CheckCircle, BrainCircuit, MapPin, Zap, PhoneCall, Search
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  chatWithLead, quickReplySuggestion, analyzeEnergyBill, 
  analyzeRoofVideo, transcribeAudioNote, generateComplexProposal,
  generateVoiceMessage, checkLocationIrradiance, searchUtilityRates
} from '../services/ai';
import { LiveCallModal } from '../components/LiveCallModal';

export const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { leads, updateLead, updateLeadStatus, addChatMessage, aiConfig } = useCRM();
  
  const lead = leads.find(l => l.id === id);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lead?.chatHistory, isTyping, isThinking]);

  if (!lead) return <div className="p-8">Lead não encontrado.</div>;

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setInputMessage('');
    
    addChatMessage(lead.id, { role: 'user', text: userMsg });

    if (lead.aiHandled) {
      setIsTyping(true);
      try {
        let response = await chatWithLead(lead.chatHistory, userMsg, aiConfig.systemInstruction);
        
        // Parse and remove JSON from response
        const jsonRegex = /\{[\s\S]*?"lead_qualificado"[\s\S]*?\}/;
        const match = response.match(jsonRegex);
        
        if (match) {
          try {
            const jsonStr = match[0];
            const data = JSON.parse(jsonStr);
            
            if (data.lead_qualificado) {
              if (data.fase_crm === "Apresentação de Proposta") {
                updateLeadStatus(lead.id, 'proposal');
                if (data.fatura) {
                  const faturaNum = parseFloat(data.fatura.replace(/[^\d,.-]/g, '').replace(',', '.'));
                  if (!isNaN(faturaNum)) {
                    updateLead(lead.id, { amountDue: faturaNum });
                  }
                }
              } else if (data.fase_crm === "Visita Agendada") {
                updateLeadStatus(lead.id, 'meeting');
                updateLead(lead.id, {
                  potenciaInteresse: data.potencia_interesse,
                  valorProposta: data.valor_proposta,
                  formaPagamentoInteresse: data.forma_pagamento_interesse,
                  dataAgendamento: data.data_agendamento
                });
              }
            }
            
            response = response.replace(jsonStr, '').trim();
          } catch (e) {
            console.error("Failed to parse JSON from AI response", e);
          }
        }

        // Generate voice message for the AI response
        let audioUrl;
        try {
          const base64Audio = await generateVoiceMessage(response);
          if (base64Audio) {
            audioUrl = `data:audio/mp3;base64,${base64Audio}`;
          }
        } catch (e) {
          console.error("Erro ao gerar áudio:", e);
        }

        addChatMessage(lead.id, { role: 'agent', text: response, audioUrl });
      } catch (error: any) {
        console.error("Erro na IA:", error);
        const errorMessage = error?.message || error?.response?.data?.error?.message || String(error);
        addChatMessage(lead.id, { role: 'agent', text: `Erro na API: ${errorMessage}` });
      } finally {
        setIsTyping(false);
      }
    } else {
      addChatMessage(lead.id, { role: 'human', text: userMsg });
    }
  };

  const handleTakeover = () => {
    updateLead(lead.id, { aiHandled: false });
    addChatMessage(lead.id, { role: 'human', text: "Olá! Sou o consultor humano e assumi o atendimento a partir de agora. Como posso ajudar?" });
  };

  const handleGetSuggestions = async () => {
    setIsThinking(true);
    try {
      const context = lead.chatHistory.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n');
      const text = await quickReplySuggestion(context);
      const opts = text.split('\n').filter(l => l.trim().length > 0).slice(0, 3);
      setSuggestions(opts.map(o => o.replace(/^\d+\.\s*/, '')));
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setIsThinking(true);
      
      try {
        if (type === 'image') {
          addChatMessage(lead.id, { role: 'user', text: "[Conta de Luz Enviada]" });
          const data = await analyzeEnergyBill(base64, file.type);
          updateLead(lead.id, { 
            consumptionKwh: data.consumptionKwh, 
            utilityCompany: data.utilityCompany,
            amountDue: data.amountDue 
          });
          addChatMessage(lead.id, { role: 'agent', text: `Conta analisada: **${data.consumptionKwh} kWh** (${data.utilityCompany}), valor R$ ${data.amountDue}. Podemos reduzir isso em até 95% com energia solar. Deseja ver uma proposta?` });
        } else if (type === 'video') {
          addChatMessage(lead.id, { role: 'user', text: "[Vídeo do Telhado Enviado]" });
          const analysis = await analyzeRoofVideo(base64, file.type);
          updateLead(lead.id, { roofNotes: analysis });
          addChatMessage(lead.id, { role: 'agent', text: `Analisei o vídeo do seu telhado: \n\n${analysis}\n\nParece excelente para a instalação!` });
        } else if (type === 'audio') {
          addChatMessage(lead.id, { role: 'user', text: "[Áudio Enviado]" });
          const transcription = await transcribeAudioNote(base64, file.type);
          addChatMessage(lead.id, { role: 'agent', text: `Transcrição do áudio: "${transcription}"\n\nEntendi perfeitamente. Como posso ajudar com base nisso?` });
        }
      } catch (error) {
        console.error(error);
        addChatMessage(lead.id, { role: 'agent', text: "Não consegui analisar o arquivo no momento." });
      } finally {
        setIsThinking(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateProposal = async () => {
    setIsThinking(true);
    try {
      const proposal = await generateComplexProposal(lead);
      addChatMessage(lead.id, { role: 'agent', text: proposal });
      updateLead(lead.id, { status: 'proposal' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCheckLocation = async () => {
    if (!lead.address) {
      const addr = prompt("Digite o endereço do lead para análise de irradiação:");
      if (addr) {
        updateLead(lead.id, { address: addr });
        setIsThinking(true);
        try {
          const res = await checkLocationIrradiance(addr);
          addChatMessage(lead.id, { role: 'agent', text: `Análise do local (${addr}):\n\n${res.text}` });
        } catch (e) {
          console.error(e);
        } finally {
          setIsThinking(false);
        }
      }
    } else {
      setIsThinking(true);
      try {
        const res = await checkLocationIrradiance(lead.address);
        addChatMessage(lead.id, { role: 'agent', text: `Análise do local (${lead.address}):\n\n${res.text}` });
      } catch (e) {
        console.error(e);
      } finally {
        setIsThinking(false);
      }
    }
  };

  const handleSearchRates = async () => {
    const region = prompt("Digite a região/estado para buscar tarifas (ex: São Paulo):");
    if (region) {
      setIsThinking(true);
      try {
        const res = await searchUtilityRates(region);
        addChatMessage(lead.id, { role: 'agent', text: `Tarifas e Regulamentações em ${region}:\n\n${res}` });
      } catch (e) {
        console.error(e);
      } finally {
        setIsThinking(false);
      }
    }
  };

  return (
    <div className="flex h-full bg-white relative">
      {isLiveCallOpen && (
        <LiveCallModal leadName={lead.name} onClose={() => setIsLiveCallOpen(false)} />
      )}
      
      {/* Left Panel: Lead Info */}
      <div className="w-1/3 border-r border-neutral-200 flex flex-col bg-neutral-50 overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 flex items-center gap-4 sticky top-0 bg-neutral-50 z-10">
          <button onClick={() => navigate('/kanban')} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900">{lead.name}</h2>
            <p className="text-sm text-neutral-500">{lead.status.toUpperCase()}</p>
          </div>
          <button 
            onClick={() => setIsLiveCallOpen(true)}
            className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full transition-colors"
            title="Ligar para o Lead (Live API)"
          >
            <PhoneCall className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Contato</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-neutral-700">Telefone:</span> <span>{lead.phone}</span></p>
              <p><span className="font-medium text-neutral-700">Email:</span> <span>{lead.email}</span></p>
              <p><span className="font-medium text-neutral-700">Origem:</span> <span>{lead.source}</span></p>
              <p><span className="font-medium text-neutral-700">Endereço:</span> <span>{lead.address || 'Não informado'}</span></p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              Dados Técnicos
              <div className="flex gap-2">
                <button onClick={handleCheckLocation} className="text-emerald-600 hover:text-emerald-700" title="Analisar Local no Maps">
                  <MapPin className="w-4 h-4" />
                </button>
                <button onClick={handleSearchRates} className="text-blue-600 hover:text-blue-700" title="Buscar Tarifas (Google Search)">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-neutral-700">Consumo:</span> <span>{lead.consumptionKwh ? `${lead.consumptionKwh} kWh/mês` : 'Pendente'}</span></p>
              <p><span className="font-medium text-neutral-700">Concessionária:</span> <span>{lead.utilityCompany || 'Pendente'}</span></p>
              <p><span className="font-medium text-neutral-700">Fatura:</span> <span>{lead.amountDue ? `R$ ${lead.amountDue}` : 'Pendente'}</span></p>
            </div>
            {lead.roofNotes && (
              <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
                <span className="font-medium text-neutral-700 block mb-1">Análise do Telhado:</span>
                <span>{lead.roofNotes}</span>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Ações de IA (Pro)</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors text-center">
                <ImageIcon className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-xs font-medium text-neutral-600">Ler Conta</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
              </label>
              <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors text-center">
                <Video className="w-5 h-5 text-purple-500 mb-1" />
                <span className="text-xs font-medium text-neutral-600">Ver Telhado</span>
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
              </label>
              <button onClick={handleGenerateProposal} className="col-span-2 flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold">Gerar Proposta (Thinking)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-neutral-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            {lead.aiHandled ? (
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <Bot className="w-4 h-4" />
                Agente IA no Controle
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <User className="w-4 h-4" />
                Atendimento Humano
              </div>
            )}
          </div>
          
          {lead.aiHandled && (
            <button 
              onClick={handleTakeover}
              className="text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Assumir Atendimento
            </button>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {lead.chatHistory.length === 0 && (
            <div className="text-center text-neutral-400 mt-10">
              Nenhuma mensagem ainda. A IA iniciará o contato em breve.
            </div>
          )}
          
          {lead.chatHistory.map((msg) => {
            const isLead = msg.role === 'user';
            const isAgent = msg.role === 'agent';
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex gap-4 max-w-[80%] ${isLead ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  isLead ? 'bg-neutral-200 text-neutral-600' : 
                  isAgent ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isLead ? <User className="w-4 h-4" /> : isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                
                <div className={`p-4 rounded-2xl shadow-sm ${
                  isLead ? 'bg-white border border-neutral-200 rounded-tl-none' : 
                  isAgent ? 'bg-emerald-50 border border-emerald-100 rounded-tr-none' : 
                  'bg-amber-50 border border-amber-100 rounded-tr-none'
                }`}>
                  <div className="text-xs font-medium mb-1 opacity-50 flex justify-between items-center">
                    <span>{isLead ? lead.name : isAgent ? 'Agente Solar IA' : 'Consultor Humano'}</span>
                    <span className="ml-4">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="text-sm text-neutral-800 prose prose-sm max-w-none">
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                  {msg.audioUrl && (
                    <audio controls src={msg.audioUrl} className="mt-3 h-8 w-full max-w-[200px]" />
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {(isTyping || isThinking) && (
            <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 rounded-tr-none flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                {isThinking && <span className="text-xs text-emerald-600 ml-2 font-medium">Analisando (Pro)...</span>}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (Flash Lite) */}
        {!lead.aiHandled && suggestions.length > 0 && (
          <div className="px-6 py-3 bg-white border-t border-neutral-100 flex gap-2 overflow-x-auto">
            {suggestions.map((sug, i) => (
              <button 
                key={i}
                onClick={() => setInputMessage(sug)}
                className="whitespace-nowrap px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-medium transition-colors"
              >
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-neutral-200">
          {!lead.aiHandled && suggestions.length === 0 && (
            <button 
              onClick={handleGetSuggestions}
              className="mb-2 text-xs font-medium text-amber-600 flex items-center gap-1 hover:text-amber-700"
            >
              <Zap className="w-3 h-3" /> Sugerir Resposta Rápida (Flash Lite)
            </button>
          )}
          
          <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
            <div className="flex-1 bg-neutral-100 rounded-2xl border border-neutral-200 flex items-end p-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
              <label className="p-3 text-neutral-400 hover:text-neutral-600 transition-colors relative cursor-pointer">
                <Paperclip className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
              </label>
              <textarea 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={lead.aiHandled ? "Simular mensagem do lead..." : "Digite sua mensagem..."}
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-2 text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <label className="p-3 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer">
                <Mic className="w-5 h-5" />
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />
              </label>
            </div>
            <button 
              type="submit"
              disabled={!inputMessage.trim() || isTyping || isThinking}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-colors shadow-sm flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

