import React from 'react';
import { useCRM, ProjectStatus } from '../context/CRMContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Calendar, User, Wrench } from 'lucide-react';

export const ProjectsKanban: React.FC = () => {
  const { projects, projectColumns, updateProjectStatus } = useCRM();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    updateProjectStatus(draggableId, destination.droppableId as ProjectStatus);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full bg-neutral-100 p-6 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Gestão de Projetos (Pós-Venda)</h1>
          <p className="text-neutral-500 mt-1">Acompanhe o status das instalações e vistorias.</p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {projectColumns.map((column) => {
            const columnProjects = projects.filter((project) => project.status === column.id);

            return (
              <div key={column.id} className="flex flex-col w-80 shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="font-semibold text-neutral-700">{column.title}</h2>
                  <span className="bg-neutral-200 text-neutral-600 text-xs font-bold px-2 py-1 rounded-full">
                    {columnProjects.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[500px] rounded-xl p-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-200' : 'bg-neutral-200/50'
                      }`}
                    >
                      {columnProjects.map((project, index) => (
                        <Draggable key={project.id} draggableId={project.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-xl shadow-sm border border-neutral-100 mb-3 cursor-pointer group hover:border-blue-300 transition-all ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-neutral-900 group-hover:text-blue-700 transition-colors">
                                  {project.name}
                                </h3>
                                <Wrench className="w-4 h-4 text-blue-500" />
                              </div>
                              
                              <div className="space-y-1 mb-3">
                                <div className="flex items-center text-xs text-neutral-500 gap-2">
                                  <User className="w-3 h-3" />
                                  <span>{project.assignedTo || 'Não atribuído'}</span>
                                </div>
                                <div className="flex items-center text-xs text-neutral-500 gap-2">
                                  <Calendar className="w-3 h-3 shrink-0" />
                                  <span>Início: {format(project.startDate, "dd/MM/yyyy")}</span>
                                </div>
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
    </motion.div>
  );
};
