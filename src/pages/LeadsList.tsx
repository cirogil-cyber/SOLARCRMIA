import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Search, Filter, MoreVertical, Phone, Mail, Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const LeadsList: React.FC = () => {
  const { leads, addLead, fetchLeads } = useCRM();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', source: 'Manual' });

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm)
  );

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;
    addLead({ ...newLead, status: 'new' });
    setIsModalOpen(false);
    setNewLead({ name: '', phone: '', email: '', source: 'Manual' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 overflow-y-auto h-full bg-neutral-50"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Gestão de Leads</h1>
          <p className="text-neutral-500 mt-1">Acompanhe todos os contatos e atendimentos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Lead
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex gap-4 items-center bg-neutral-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Buscar leads por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-neutral-200 bg-white">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50/50 text-xs uppercase font-semibold text-neutral-500 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Atendimento</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-neutral-50 transition-colors group cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{lead.name}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{lead.source}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-neutral-600 mb-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 text-xs">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{lead.email || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-md">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {lead.aiHandled ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-md w-fit">
                        <Bot className="w-3.5 h-3.5" /> IA
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600 font-medium text-xs bg-amber-50 px-2 py-1 rounded-md w-fit">
                        <User className="w-3.5 h-3.5" /> Humano
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    <span>{format(lead.createdAt, "dd MMM yyyy", { locale: ptBR })}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Adicionar Novo Lead</h2>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Completo</label>
                <input 
                  type="text" required
                  value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Telefone (WhatsApp)</label>
                <input 
                  type="tel" required
                  value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Origem</label>
                <select 
                  value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Manual">Manual</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Site">Site</option>
                  <option value="Instagram">Instagram</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                  Salvar Lead
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
