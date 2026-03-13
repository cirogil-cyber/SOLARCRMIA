import React from 'react';
import { useCRM } from '../context/CRMContext';
import { motion } from 'motion/react';
import { Users, Zap, CheckCircle, TrendingUp, HardHat } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { leads, projects } = useCRM();

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status)).length;
  const conversionRate = totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';
  const activeProjects = projects.filter(p => p.status !== 'completed').length;

  const stats = [
    { label: 'Total de Leads', value: totalLeads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Leads Ativos', value: activeLeads, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Vendas Fechadas', value: wonLeads, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Projetos Ativos', value: activeProjects, icon: HardHat, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 overflow-y-auto h-full"
    >
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-8">Visão Geral Comercial</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h2 className="text-lg font-semibold mb-4">Desempenho da IA (Agente)</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Leads Qualificados Automaticamente</span>
              <span className="font-medium text-emerald-600">
                {leads.filter(l => l.aiHandled && l.status !== 'new').length}
              </span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">A IA está qualificando 85% dos leads sem intervenção humana inicial.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h2 className="text-lg font-semibold mb-4">Últimos Leads</h2>
          <div className="space-y-3">
            {leads.slice(-4).reverse().map(lead => (
              <div key={lead.id} className="flex justify-between items-center p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-neutral-900">{lead.name}</p>
                  <p className="text-xs text-neutral-500">{lead.source}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-md">
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
