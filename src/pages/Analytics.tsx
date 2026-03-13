import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Filter, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { leads, projects } = useCRM();
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [filterRep, setFilterRep] = useState('all');

  // Derive unique campaigns and reps
  const campaigns = Array.from(new Set(leads.map(l => l.campaign).filter(Boolean)));
  const reps = Array.from(new Set(leads.map(l => l.assignedTo).filter(Boolean)));

  // Apply filters
  const filteredLeads = leads.filter(l => {
    if (filterCampaign !== 'all' && l.campaign !== filterCampaign) return false;
    if (filterRep !== 'all' && l.assignedTo !== filterRep) return false;
    return true;
  });

  // Metrics
  const totalLeads = filteredLeads.length;
  const wonLeads = filteredLeads.filter(l => l.status === 'won').length;
  const conversionRate = totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';
  const totalRevenue = filteredLeads.reduce((sum, l) => sum + (l.revenue || 0), 0);
  const aiHandledCount = filteredLeads.filter(l => l.aiHandled).length;
  const aiPerformanceRate = totalLeads ? ((aiHandledCount / totalLeads) * 100).toFixed(1) : '0.0';

  // Data for charts
  const sourceData = filteredLeads.reduce((acc: any, lead) => {
    const source = lead.source || 'Desconhecido';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(sourceData).map(key => ({ name: key, value: sourceData[key] }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  const statusData = filteredLeads.reduce((acc: any, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(statusData).map(key => ({ name: key, count: statusData[key] }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 overflow-y-auto h-full bg-neutral-50"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Relatórios e Analytics</h1>
          <p className="text-neutral-500 mt-1">Análise avançada de vendas e performance.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200 shadow-sm">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select 
              value={filterCampaign} 
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 text-neutral-700"
            >
              <option value="all">Todas Campanhas</option>
              {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200 shadow-sm">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select 
              value={filterRep} 
              onChange={(e) => setFilterRep(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 text-neutral-700"
            >
              <option value="all">Todos Vendedores</option>
              {reps.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-100">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Total de Leads</p>
            <p className="text-2xl font-bold text-neutral-900"><span>{totalLeads}</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-100">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-neutral-900"><span>{conversionRate}%</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-purple-100">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Receita Gerada</p>
            <p className="text-2xl font-bold text-neutral-900">
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}</span>
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-amber-100">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Atendimento IA</p>
            <p className="text-2xl font-bold text-neutral-900"><span>{aiPerformanceRate}%</span></p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h2 className="text-lg font-semibold mb-6">Leads por Origem</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h2 className="text-lg font-semibold mb-6">Funil de Vendas (Status)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
