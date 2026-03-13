import React, { useState, useEffect } from 'react';
import { useCRM, LeadStatus } from '../context/CRMContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bot, User, Phone, Mail, Zap, DollarSign, Calendar, CreditCard, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

export const Kanban: React.FC = () => {
  const { leads, columns, updateLeadStatus, fetchLeads } = useCRM();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    const loadLeads = async () => {
      setIsLoading(true);
      try {
        await fetchLeads();
      } catch (err) {
        error('Erro ao carregar leads');
      } finally {
        setIsLoading(false);
      }
    };
    loadLeads();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      await updateLeadStatus(draggableId, destination.droppableId as LeadStatus);
      success('Lead movido com sucesso');
    } catch (err) {
      error('Erro ao mover lead');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-neutral-600 font-medium">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full bg-neutral-100 p-6 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Pipeline Comercial</h1>
        <button
          onClick={() => navigate('/leads')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Adicionar Lead Manual
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {columns.map((column) => {
            const columnLeads = leads.filter((lead) => lead.status === column.id);

            return (
              <div key={column.id} className="flex flex-col w-80 shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="font-semibold text-neutral-700">{column.title}</h2>
                  <span className="bg-neutral-200 text-neutral-600 text-xs font-bold px-2 py-1 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[500px] rounded-xl p-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-emerald-50 border-2 border-dashed border-emerald-200' : 'bg-neutral-200/50'
                      }`}
                    >
                      {columnLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => navigate(`/leads/${lead.id}`)}
                              className={`bg-white p-4 rounded-xl shadow-sm border border-neutral-100 mb-3 cursor-pointer group hover:border-emerald-300 transition-all ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-emerald-500 ring-opacity-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                                  {lead.name}
                                </h3>
                                {lead.aiHandled ? (
                                  <span title="Atendido por IA"><Bot className="w-4 h-4 text-emerald-500" /></span>
                                ) : (
                                  <span title="Atendimento Humano"><User className="w-4 h-4 text-amber-500" /></span>
                                )}
                              </div>
                              
                              <div className="space-y-1 mb-3">
                                <div className="flex items-center text-xs text-neutral-500 gap-2">
                                  <Phone className="w-3 h-3" />
                                  <span>{lead.phone}</span>
                                </div>
                                <div className="flex items-center text-xs text-neutral-500 gap-2 truncate">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                              </div>

                              {lead.status === 'meeting' && (
                                <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                                  {lead.potenciaInteresse && (
                                    <div className="flex items-center text-xs text-neutral-600 gap-2">
                                      <Zap className="w-3 h-3 text-amber-500" />
                                      <span className="font-medium">Potência:</span> <span>{lead.potenciaInteresse}</span>
                                    </div>
                                  )}
                                  {lead.valorProposta && (
                                    <div className="flex items-center text-xs text-neutral-600 gap-2">
                                      <DollarSign className="w-3 h-3 text-emerald-500" />
                                      <span className="font-medium">Valor:</span> <span>{lead.valorProposta}</span>
                                    </div>
                                  )}
                                  {lead.formaPagamentoInteresse && (
                                    <div className="flex items-center text-xs text-neutral-600 gap-2">
                                      <CreditCard className="w-3 h-3 text-blue-500" />
                                      <span className="font-medium">Pagamento:</span> <span>{lead.formaPagamentoInteresse}</span>
                                    </div>
                                  )}
                                  {lead.dataAgendamento && (
                                    <div className="flex items-center text-xs text-neutral-600 gap-2 bg-emerald-50 text-emerald-700 p-1.5 rounded-md mt-2">
                                      <Calendar className="w-3 h-3" />
                                      <span className="font-semibold">Visita:</span> <span>{lead.dataAgendamento}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-100">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                                  {lead.source}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  {format(lead.createdAt, "dd MMM", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </motion.div>
  );
};
