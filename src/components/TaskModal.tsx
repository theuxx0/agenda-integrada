import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { Task, Priority, Category } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    time: string;
    priority: Priority;
    cat: Category;
    notes?: string;
  }) => void;
  initialTask?: Task | null;
  defaultCategory?: Category;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultCategory = 'study',
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<Priority>('med');
  const [cat, setCat] = useState<Category>('study');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setTime(initialTask.time || '09:00');
        setPriority(initialTask.priority);
        setCat(initialTask.cat);
        setNotes(initialTask.notes || '');
      } else {
        setTitle('');
        setTime('09:00');
        setPriority('med');
        setCat(defaultCategory);
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, initialTask, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título da tarefa.');
      return;
    }

    onSave({
      title: title.trim(),
      time: time || '09:00',
      priority,
      cat,
      notes: notes.trim(),
    });
    onClose();
  };

  // Smart AI Quick Fill button
  const handleQuickOptimize = () => {
    if (!title) return;
    const lower = title.toLowerCase();
    if (lower.includes('prova') || lower.includes('urgente') || lower.includes('entrega')) {
      setPriority('high');
    }
    if (lower.includes('treino') || lower.includes('academia') || lower.includes('corrida')) {
      setCat('gym');
      setTime('19:00');
    } else if (lower.includes('médic') || lower.includes('dentista') || lower.includes('remédio')) {
      setCat('saude');
      setTime('11:00');
    } else if (lower.includes('reunião') || lower.includes('cliente') || lower.includes('relatório')) {
      setCat('work');
      setTime('14:00');
    } else {
      setCat('study');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="task-modal-container"
        className="bg-white border border-slate-200/80 w-full max-w-sm rounded-2xl shadow-xl p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            {initialTask ? 'Editar tarefa' : 'Nova tarefa'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pt-4 flex flex-col gap-3.5">
          {error && (
            <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Título
              </label>
              {title && (
                <button
                  type="button"
                  onClick={handleQuickOptimize}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                  title="Detectar categoria e horário automaticamente"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Auto-detectar com IA
                </button>
              )}
            </div>
            <input
              id="modal-task-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: Revisar capítulo 3 de Cálculo..."
              autoFocus
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Horário
              </label>
              <div className="relative">
                <input
                  id="modal-task-time-input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Prioridade
              </label>
              <select
                id="modal-task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
              >
                <option value="high">Alta (Urgente)</option>
                <option value="med">Média (Normal)</option>
                <option value="low">Baixa (Flexível)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Categoria
            </label>
            <select
              id="modal-task-cat-select"
              value={cat}
              onChange={(e) => setCat(e.target.value as Category)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
            >
              <option value="study">Estudo</option>
              <option value="work">Trabalho</option>
              <option value="gym">Academia</option>
              <option value="saude">Saúde</option>
              <option value="general">Geral</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Notas adicionais (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione detalhes, links ou lembretes..."
              rows={2}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="modal-save-task-btn"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialTask ? 'Salvar alterações' : 'Adicionar tarefa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
