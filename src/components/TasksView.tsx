import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Task, Category, Priority } from '../types';
import { TaskItem } from './TaskItem';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search
        if (searchTerm.trim()) {
          const match =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase()));
          if (!match) return false;
        }
        // Status
        if (statusFilter === 'pending' && task.done) return false;
        if (statusFilter === 'done' && !task.done) return false;
        // Category
        if (categoryFilter !== 'all' && task.cat !== categoryFilter) return false;
        // Priority
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Top Header & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="tasks-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tarefas pelo nome ou detalhes..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova tarefa</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-400 mr-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Status buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({tasks.length - doneCount})
            </button>
            <button
              onClick={() => setStatusFilter('done')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                statusFilter === 'done'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Concluídas ({doneCount})
            </button>
          </div>

          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
            className="text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg outline-none"
          >
            <option value="all">Todas categorias</option>
            <option value="study">Estudo</option>
            <option value="work">Trabalho</option>
            <option value="gym">Academia</option>
            <option value="saude">Saúde</option>
          </select>

          {/* Priority Select */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg outline-none"
          >
            <option value="all">Todas prioridades</option>
            <option value="high">Alta prioridade</option>
            <option value="med">Média prioridade</option>
            <option value="low">Baixa prioridade</option>
          </select>

          {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setPriorityFilter('all');
              }}
              className="text-[11px] text-rose-600 hover:underline font-semibold ml-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Task List Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Hoje — {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa' : 'tarefas'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Ordenado por horário
          </span>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="flex flex-col gap-2">
            {(filteredTasks || []).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-700">Nenhuma tarefa encontrada</p>
            <p className="text-[11px] text-slate-400 max-w-sm">
              Não há tarefas correspondentes aos filtros selecionados. Crie uma nova tarefa ou use a Nexus AI para planejar seu dia.
            </p>
            <button
              onClick={onOpenNewTaskModal}
              className="mt-2 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              + Adicionar tarefa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
