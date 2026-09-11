import React from 'react';
import { Plus, Calendar, Sparkles } from 'lucide-react';
import { TabType, Mode } from '../types';
import { formatFullDate } from '../lib/dateUtils';

interface TopBarProps {
  currentTab: TabType;
  currentMode: Mode;
  onOpenNewTaskModal: () => void;
  onOpenQuickPrompt?: (prompt: string) => void;
}

const TAB_TITLES: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Visão geral da sua produtividade e rotina diária',
  },
  tarefas: {
    title: 'Minhas Tarefas',
    subtitle: 'Gerenciamento completo e organização de afazeres',
  },
  timeline: {
    title: 'Blocos de Tempo & Cronograma',
    subtitle: 'Time-blocking visual e timer de foco Pomodoro integrado',
  },
  habitos: {
    title: 'Hábitos Diários & Rotinas',
    subtitle: 'Construção de consistência e acompanhamento semanal',
  },
  integracoes: {
    title: 'Integrações (Slide 6)',
    subtitle: 'Conectar o ARKIH AI ao Google Calendar, Outlook, e-mail e mensageria',
  },
  chat: {
    title: 'Assistente ARKIH AI',
    subtitle: 'Inteligência artificial para planejamento e criação de tarefas',
  },
  analise: {
    title: 'Relatório Executivo & Análise',
    subtitle: 'Diagnóstico inteligente por IA, score e exportação de calendário',
  },
  roadmap: {
    title: 'Roadmap & Evolução SaaS (Slides 9 & 10)',
    subtitle: 'Fases de desenvolvimento, evolução para SaaS e planos de monetização',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  currentMode,
  onOpenNewTaskModal,
}) => {
  const info = TAB_TITLES[currentTab];
  const dateStr = formatFullDate();

  return (
    <header className="px-6 py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            {info.title}
          </h1>
          {currentMode && (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                currentMode === 'study'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : currentMode === 'work'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}
            >
              Modo: {currentMode === 'study' ? 'Estudo' : currentMode === 'work' ? 'Trabalho' : 'Academia'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          id="topbar-new-task-btn"
          onClick={onOpenNewTaskModal}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova tarefa</span>
        </button>
      </div>
    </header>
  );
};
