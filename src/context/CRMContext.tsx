import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type LeadStatus = 'new' | 'qualifying' | 'proposal' | 'meeting' | 'negotiation' | 'won' | 'lost';
export type ProjectStatus = 'assessment' | 'engineering' | 'permitting' | 'installation' | 'inspection' | 'commissioning' | 'completed';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'human';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: LeadStatus;
  source: string;
  createdAt: Date;
  consumptionKwh?: number;
  utilityCompany?: string;
  amountDue?: number;
  roofNotes?: string;
  aiHandled: boolean;
  chatHistory: ChatMessage[];
  address?: string;
  assignedTo?: string;
  campaign?: string;
  revenue?: number;
  potenciaInteresse?: string;
  valorProposta?: string;
  formaPagamentoInteresse?: string;
  dataAgendamento?: string;
}

export interface Project {
  id: string;
  leadId: string;
  name: string;
  status: ProjectStatus;
  startDate: Date;
  estimatedCompletionDate?: Date;
  assignedTo?: string;
  notes?: string;
}

export interface Column {
  id: LeadStatus;
  title: string;
}

export interface ProjectColumn {
  id: ProjectStatus;
  title: string;
}

export interface AIConfig {
  systemInstruction: string;
  autoReply: boolean;
  proposalTemplate: string;
}

interface CRMContextType {
  leads: Lead[];
  projects: Project[];
  columns: Column[];
  projectColumns: ProjectColumn[];
  aiConfig: AIConfig;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'chatHistory' | 'aiHandled'>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addChatMessage: (leadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  fetchLeads: () => Promise<void>;
}

const initialColumns: Column[] = [
  { id: 'new', title: 'Novos Leads' },
  { id: 'qualifying', title: 'Qualificação IA' },
  { id: 'proposal', title: 'Apresentação de Proposta' },
  { id: 'meeting', title: 'Reunião Agendada' },
  { id: 'negotiation', title: 'Negociação (Humano)' },
  { id: 'won', title: 'Fechado Ganho' },
  { id: 'lost', title: 'Fechado Perdido' },
];

const initialProjectColumns: ProjectColumn[] = [
  { id: 'assessment', title: 'Avaliação do Local' },
  { id: 'engineering', title: 'Engenharia & Design' },
  { id: 'permitting', title: 'Aprovação (Concessionária)' },
  { id: 'installation', title: 'Instalação' },
  { id: 'inspection', title: 'Vistoria' },
  { id: 'commissioning', title: 'Comissionamento' },
  { id: 'completed', title: 'Concluído' },
];

const initialAIConfig: AIConfig = {
  systemInstruction: `Contexto e Identidade:
Você é o Consultor Especialista de Vendas Sênior da EXP Energia Solar. Você tem profundo conhecimento técnico e de mercado sobre energia solar fotovoltaica. Sua postura é sempre comunicativa, positiva, empática e altamente profissional. Seu objetivo principal é guiar o cliente de forma consultiva para a venda e construção de uma usina solar própria, demonstrando o retorno sobre o investimento e a economia a longo prazo.

Diretrizes de Atendimento:

Abordagem: Inicie as conversas de forma calorosa e prestativa. Celebre o interesse do cliente em energia sustentável e economia.

Clareza Técnica: Explique conceitos complexos (inversores, módulos, homologação) de forma simples e acessível, sem jargões desnecessários.

Foco na Solução (Venda): Se o cliente demonstrar confusão, esclareça gentilmente que a EXP atua na venda e construção da usina para o cliente, garantindo que o ativo seja 100% dele, o que maximiza a economia.

Protocolo de Qualificação de Leads (Gatilhos de CRM):
Durante a conversa, você deve conduzir o diálogo para extrair, de forma natural, as seguintes informações:

Valor médio da fatura de energia atual (em R$).

Tipo de ligação (Monofásico, Bifásico ou Trifásico) ou concessionária local.

Se o telhado tem espaço disponível (ou se há terreno).

Ação Obrigatória do Sistema:
Assim que você coletar o [Valor da Fatura] e o [Tipo de Ligação] e agendar a visita, você deve gerar internamente um resumo estruturado no final da sua resposta (oculto para o usuário final, mas legível para o sistema via API) no formato JSON: {"lead_qualificado": true, "fase_crm": "Visita Agendada", "potencia_interesse": "4,88kWp", "valor_proposta": "R$ 12.000,00", "forma_pagamento_interesse": "financiamento", "data_agendamento": "quinta-feira tarde"}.`,
  autoReply: true,
  proposalTemplate: "Proposta de Sistema Fotovoltaico...\n\nBaseado no seu consumo de {{consumptionKwh}} kWh, recomendamos um sistema de {{systemSize}} kWp.\n\nInvestimento Estimado: R$ {{investment}}\nPayback Estimado: {{payback}} anos."
};

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [aiConfig, setAiConfig] = useState<AIConfig>(initialAIConfig);

  const fetchLeads = async () => {
    if (!user) return;
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*');
    
    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
    } else if (leadsData) {
      // Fetch interactions for all leads
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interacoes_chat')
        .select('*')
        .order('timestamp', { ascending: true });
        
      if (interactionsError) console.error('Error fetching interactions:', interactionsError);

      const formattedLeads: Lead[] = leadsData.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone || '',
        email: l.email || '',
        status: l.fase_crm as LeadStatus,
        source: l.source || '',
        createdAt: new Date(l.created_at),
        consumptionKwh: l.consumption_kwh,
        utilityCompany: l.utility_company,
        amountDue: l.amount_due,
        roofNotes: l.roof_notes,
        aiHandled: l.ai_handled,
        address: l.address,
        assignedTo: l.assigned_to,
        campaign: l.campaign,
        revenue: l.revenue,
        potenciaInteresse: l.potencia_interesse,
        valorProposta: l.valor_proposta,
        formaPagamentoInteresse: l.forma_pagamento_interesse,
        dataAgendamento: l.data_agendamento,
        chatHistory: (interactionsData || [])
          .filter(i => i.lead_id === l.id)
          .map(i => ({
            id: i.id,
            role: i.role as 'user' | 'agent' | 'human',
            text: i.text,
            audioUrl: i.audio_url,
            timestamp: new Date(i.timestamp)
          }))
      }));
      setLeads(formattedLeads);
    }
  };

  useEffect(() => {
    if (!user) {
      setLeads([]);
      setProjects([]);
      return;
    }

    const fetchData = async () => {
      await fetchLeads();

      // Fetch Projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
        
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      } else if (projectsData) {
        const formattedProjects: Project[] = projectsData.map(p => ({
          id: p.id,
          leadId: p.lead_id,
          name: p.name,
          status: p.status as ProjectStatus,
          startDate: new Date(p.start_date),
          estimatedCompletionDate: p.estimated_completion_date ? new Date(p.estimated_completion_date) : undefined,
          assignedTo: p.assigned_to,
          notes: p.notes
        }));
        setProjects(formattedProjects);
      }

      // Fetch Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching settings:', settingsError);
      } else if (settingsData) {
        setAiConfig({
          systemInstruction: settingsData.system_instruction || initialAIConfig.systemInstruction,
          autoReply: settingsData.auto_reply ?? initialAIConfig.autoReply,
          proposalTemplate: settingsData.proposal_template || initialAIConfig.proposalTemplate
        });
      }
    };

    fetchData();
  }, [user]);

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'chatHistory' | 'aiHandled'>) => {
    if (!user) return;
    
    const newId = uuidv4();
    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdAt: new Date(),
      chatHistory: [],
      aiHandled: true,
    };
    
    const { error } = await supabase.from('leads').insert({
      id: newId,
      user_id: user.id,
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      fase_crm: leadData.status,
      source: leadData.source,
      consumption_kwh: leadData.consumptionKwh,
      utility_company: leadData.utilityCompany,
      amount_due: leadData.amountDue,
      roof_notes: leadData.roofNotes,
      ai_handled: true,
      address: leadData.address,
      assigned_to: leadData.assignedTo,
      campaign: leadData.campaign,
      revenue: leadData.revenue,
      potencia_interesse: leadData.potenciaInteresse,
      valor_proposta: leadData.valorProposta,
      forma_pagamento_interesse: leadData.formaPagamentoInteresse,
      data_agendamento: leadData.dataAgendamento
    });

    if (error) {
      console.error('Error adding lead:', error);
      alert('Erro ao criar lead: ' + error.message);
      return;
    }

    // Update state only after successful insert
    setLeads(prev => [...prev, newLead]);
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    if (!user) return;

    // Optimistic update
    setLeads(prev => {
      const newLeads = prev.map(l => l.id === id ? { ...l, status } : l);
      
      if (status === 'won') {
        const lead = prev.find(l => l.id === id);
        if (lead && !projects.find(p => p.leadId === id)) {
          const newProject: Project = {
            id: uuidv4(),
            leadId: lead.id,
            name: `Instalação - ${lead.name}`,
            status: 'assessment',
            startDate: new Date(),
          };
          setProjects(p => [...p, newProject]);
          
          // Also save project to Supabase
          supabase.from('projects').insert({
            id: newProject.id,
            lead_id: newProject.leadId,
            name: newProject.name,
            status: newProject.status,
            start_date: newProject.startDate.toISOString()
          }).then(({error}) => {
            if (error) console.error('Error adding project:', error);
          });
        }
      }
      return newLeads;
    });

    const { error } = await supabase.from('leads').update({ fase_crm: status }).eq('id', id);
    if (error) console.error('Error updating lead status:', error);
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    if (!user) return;

    // Optimistic update
    setLeads(prev => {
      const newLeads = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      
      if (updates.status === 'won') {
        const lead = prev.find(l => l.id === id);
        if (lead && !projects.find(p => p.leadId === id)) {
          const newProject: Project = {
            id: uuidv4(),
            leadId: lead.id,
            name: `Instalação - ${updates.name || lead.name}`,
            status: 'assessment',
            startDate: new Date(),
          };
          setProjects(p => [...p, newProject]);
          
          // Also save project to Supabase
          supabase.from('projects').insert({
            id: newProject.id,
            lead_id: newProject.leadId,
            name: newProject.name,
            status: newProject.status,
            start_date: newProject.startDate.toISOString()
          }).then(({error}) => {
            if (error) console.error('Error adding project:', error);
          });
        }
      }
      return newLeads;
    });

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.status !== undefined) dbUpdates.fase_crm = updates.status;
    if (updates.source !== undefined) dbUpdates.source = updates.source;
    if (updates.consumptionKwh !== undefined) dbUpdates.consumption_kwh = updates.consumptionKwh;
    if (updates.utilityCompany !== undefined) dbUpdates.utility_company = updates.utilityCompany;
    if (updates.amountDue !== undefined) dbUpdates.amount_due = updates.amountDue;
    if (updates.roofNotes !== undefined) dbUpdates.roof_notes = updates.roofNotes;
    if (updates.aiHandled !== undefined) dbUpdates.ai_handled = updates.aiHandled;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.campaign !== undefined) dbUpdates.campaign = updates.campaign;
    if (updates.revenue !== undefined) dbUpdates.revenue = updates.revenue;
    if (updates.potenciaInteresse !== undefined) dbUpdates.potencia_interesse = updates.potenciaInteresse;
    if (updates.valorProposta !== undefined) dbUpdates.valor_proposta = updates.valorProposta;
    if (updates.formaPagamentoInteresse !== undefined) dbUpdates.forma_pagamento_interesse = updates.formaPagamentoInteresse;
    if (updates.dataAgendamento !== undefined) dbUpdates.data_agendamento = updates.dataAgendamento;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('leads').update(dbUpdates).eq('id', id);
      if (error) console.error('Error updating lead:', error);
    }
  };

  const addChatMessage = async (leadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!user) return;

    const newId = uuidv4();
    const newMessage: ChatMessage = {
      ...message,
      id: newId,
      timestamp: new Date()
    };
    
    // Optimistic update
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, chatHistory: [...l.chatHistory, newMessage] };
      }
      return l;
    }));

    const { error } = await supabase.from('interacoes_chat').insert({
      id: newId,
      lead_id: leadId,
      role: message.role,
      text: message.text,
      audio_url: message.audioUrl
    });

    if (error) console.error('Error adding chat message:', error);
  };

  const updateAIConfig = async (config: Partial<AIConfig>) => {
    if (!user) return;
    
    const newConfig = { ...aiConfig, ...config };
    setAiConfig(newConfig);

    const { error } = await supabase.from('settings').upsert({
      user_id: user.id,
      system_instruction: newConfig.systemInstruction,
      auto_reply: newConfig.autoReply,
      proposal_template: newConfig.proposalTemplate
    });

    if (error) console.error('Error updating settings:', error);
  };

  const updateProjectStatus = async (id: string, status: ProjectStatus) => {
    if (!user) return;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    const { error } = await supabase.from('projects').update({ status }).eq('id', id);
    if (error) console.error('Error updating project status:', error);
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate.toISOString();
    if (updates.estimatedCompletionDate !== undefined) dbUpdates.estimated_completion_date = updates.estimatedCompletionDate?.toISOString();
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
      if (error) console.error('Error updating project:', error);
    }
  };

  return (
    <CRMContext.Provider value={{ 
      leads, projects, columns: initialColumns, projectColumns: initialProjectColumns, aiConfig, 
      addLead, updateLeadStatus, updateLead, addChatMessage, updateAIConfig,
      updateProjectStatus, updateProject, fetchLeads
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
