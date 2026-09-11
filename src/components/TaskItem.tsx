import React from 'react';
import { Check, Clock, Trash2, Edit3 } from 'lucide-react';
import { Task, Category, Priority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (task: Task) => void;
}

const CATEGORY_LABELS: Record<Category, { label: string; className: string }> = {
  study: {
    label: 'Estudo',
    className: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  work: {
    label: 'Trabalho',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  gym: {
    label: 'Academia',
    className: 'bg-orange-50 text-orange-700 border-orange-200/80',
  },
  saude: {
    label: 'Saúde',
    className: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  general: {
    label: 'Geral',
    className: 'bg-slate-50 text-slate-700 border-slate-200/80',
  },
};

const PRIORITY_DOTS: Record<Priority, { color: string; label: string }> = {
  high: { color: 'bg-rose-500 ring-rose-200', label: 'Alta prioridade' },
  med: { color: 'bg-amber-500 ring-amber-200', label: 'Média prioridade' },
  low: { color: 'bg-emerald-500 ring-emerald-200', label: 'Baixa prioridade' },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const cat = CATEGORY_LABELS[task.cat] || CATEGORY_LABELS.general;
  const prio = PRIORITY_DOTS[task.priority] || PRIORITY_DOTS.med;

  return (
    <div
      id={`task-item-${task.id}`}
      className={`group flex items-center gap-3 p-3 rounded-xl border bg-white transition-all hover:border-slate-300 hover:shadow-xs ${
        task.done ? 'bg-slate-50/70 border-slate-200/70' : 'border-slate-200 shadow-xs'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        id={`task-check-${task.id}`}
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
          task.done
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'border-slate-300 hover:border-indigo-500 bg-white'
        }`}
        aria-label={task.done ? 'Marcar como pendente' : 'Marcar como concluída'}
      >
        {task.done && <Check className="w-3 h-3 stroke-[3]" />}
      </button>

      {/* Priority Indicator */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${prio.color}`}
        title={prio.label}
      />

      {/* Title */}
      <span
        onClick={() => onToggle(task.id)}
        className={`flex-1 text-xs font-medium cursor-pointer select-none transition-all ${
          task.done
            ? 'line-through text-slate-400'
            : 'text-slate-800 group-hover:text-slate-900'
        }`}
      >
        {task.title}
      </span>

      {/* Category Tag */}
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.className}`}
      >
        {cat.label}
      </span>

      {/* Time */}
      <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-medium">
        <Clock className="w-3 h-3" />
        <span>{task.time}</span>
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            title="Editar tarefa"
            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            title="Excluir tarefa"
            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
