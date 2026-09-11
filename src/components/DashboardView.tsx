import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Send,
  Sparkles,
  Plus,
  Loader2,
  CalendarCheck,
  Share2,
  Rocket,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Task, ChatMessage, Priority, TabType } from '../types';
import { TaskItem } from './TaskItem';

interface DashboardViewProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  aiMessages: ChatMessage[];
  onSendAIMessage: (text: string) => Promise<void>;
  isAILoading: boolean;
  streakCount: number;
  onNavigateTab?: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskModal,
  aiMessages,
  onSendAIMessage,
  isAILoading,
  streakCount,
  onNavigateTab,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'done'>('all');

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;
  const pendingTasks = tasks.filter((t) => !t.done);
  const highPriorityPending = pendingTasks.filter((t) => t.priority === 'high');
  const progressPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Filtered tasks for the main list
  const filteredTasks = tasks
    .filter((t) => {
      if (filterState === 'pending') return !t.done;
      if (filterState === 'done') return t.done;
      return true;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAILoading) return;
    const text = chatInput.trim();
    setChatInput('');
    onSendAIMessage(text);
  };

  const handleQuickPrompt = (promptText: string) => {
    onSendAIMessage(promptText);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Tarefas hoje
            </span>
            <CalendarCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{total}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            <span className="text-emerald-600 font-semibold">{doneCount}</span> concluídas
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Alta prioridade
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {highPriorityPending.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {highPriorityPending.length > 0 ? (
              <span className="text-rose-600 font-semibold">afazeres urgentes</span>
            ) : (
              <span className="text-emerald-600 font-semibold">Tudo sob controle</span>
            )}
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Progresso
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {progressPercent}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Streak
            </span>
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1">
            <span>{streakCount}</span>
            <span className="text-base">🔥</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            dias consecutivos
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Prioridade Alta */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Prioridade alta
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                {highPriorityPending.length} pendentes
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {highPriorityPending.length > 0 ? (
                highPriorityPending.slice(0, 3).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                  />
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <p className="text-xs font-medium text-slate-600">
                    Nenhuma tarefa urgente pendente 👍
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Aproveite para focar nas atividades de média prioridade.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="mt-3 w-full py-2 px-3 border border-dashed border-slate-300 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar nova tarefa</span>
          </button>
        </div>

        {/* Right Column: Mini Nexus AI Chat */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  ARKIH AI <Sparkles className="w-3 h-3 text-indigo-400" />
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                Assistente ativo
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 mb-3 scrollbar-thin">
              {aiMessages.slice(-3).map((msg) => (
                <div
                  key={msg.id}
                  className={`text-xs p-2.5 rounded-xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white ml-auto max-w-[85%]'
                      : 'bg-slate-800/90 text-slate-200 mr-auto max-w-[90%] border border-slate-700/60'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.suggestedTask && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-[10px] flex items-center gap-2 text-emerald-300 font-medium">
                      <CalendarCheck className="w-3 h-3 shrink-0" />
                      <span>Agendado: {msg.suggestedTask.title} ({msg.suggestedTask.time})</span>
                    </div>
                  )}
                </div>
              ))}
              {isAILoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 p-2 rounded-xl w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>ARKIH AI está processando...</span>
                </div>
              )}
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => handleQuickPrompt('Amanhã tenho prova de Cálculo às 09:00')}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700/80 transition-colors cursor-pointer"
              >
                + Prova amanhã às 9h
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('Treino de perna hoje às 19:00')}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700/80 transition-colors cursor-pointer"
              >
                + Treino às 19h
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('Otimizar minha rotina de hoje')}
                className="text-[10px] bg-indigo-950 hover:bg-indigo-900 text-indigo-300 px-2 py-1 rounded-md border border-indigo-800/80 transition-colors cursor-pointer"
              >
                ⚡ Otimizar dia
              </button>
            </div>
          </div>

          {/* Chat Input Row */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              id="dashboard-ai-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder='Ex: "Amanhã tenho prova às 9h"'
              className="flex-1 bg-slate-800/90 text-white placeholder:text-slate-400 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isAILoading || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all shrink-0 cursor-pointer shadow-sm"
              title="Enviar para ARKIH AI"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Highlights for Slide 6 and Slides 9 & 10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Slide 6 Card */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('integracoes')}
          className="bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-100 rounded-2xl p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  Slide 6
                </span>
                <h4 className="text-xs font-bold text-slate-900">Integrações ARKIH AI</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Google Calendar, Outlook e captura inteligente via e-mail e mensageria
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Slides 9 & 10 Card */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('roadmap')}
          className="bg-gradient-to-br from-amber-50/60 to-white border border-amber-100 rounded-2xl p-4 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                  Slides 9 & 10
                </span>
                <h4 className="text-xs font-bold text-slate-900">Roadmap & Modelo SaaS</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Fases 1 a 6 de desenvolvimento e planos de monetização (Gratuito, Pro, Equipes)
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>

      {/* Main Section: Todas as tarefas de hoje */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Todas as tarefas de hoje
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredTasks.length} de {tasks.length}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterState('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterState === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterState('pending')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterState === 'pending'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pendentes ({pendingTasks.length})
            </button>
            <button
              onClick={() => setFilterState('done')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterState === 'done'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Concluídas ({doneCount})
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-medium text-slate-500">Nenhuma tarefa encontrada neste filtro.</p>
              <button
                onClick={onOpenNewTaskModal}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                + Criar uma nova tarefa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
