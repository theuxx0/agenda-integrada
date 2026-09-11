import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Award,
  MessageSquare,
  BarChart3,
  Share2,
  Rocket,
  BookOpen,
  Briefcase,
  Dumbbell,
  Sparkles,
  Flame,
} from 'lucide-react';
import { TabType, Mode } from '../types';
import { DAYS_OF_WEEK } from '../lib/dateUtils';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentMode: Mode;
  onToggleMode: (mode: Mode) => void;
  streaks: boolean[];
  streakCount: number;
  todayIndex: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentMode,
  onToggleMode,
  streaks,
  streakCount,
  todayIndex,
}) => {
  return (
    <aside className="w-56 bg-slate-50/80 backdrop-blur border-r border-slate-200/80 flex flex-col justify-between select-none h-full min-h-screen">
      <div>
        {/* Logo Header */}
        <div className="p-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
                ARKIH AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  SaaS
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Agenda Inteligente</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="py-3 px-2 flex flex-col gap-1">
          <button
            id="nav-dashboard-btn"
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tarefas-btn"
            onClick={() => onSelectTab('tarefas')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'tarefas'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>Tarefas</span>
          </button>

          <button
            id="nav-timeline-btn"
            onClick={() => onSelectTab('timeline')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Blocos de Tempo</span>
          </button>

          <button
            id="nav-habitos-btn"
            onClick={() => onSelectTab('habitos')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'habitos'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Hábitos</span>
          </button>

          <button
            id="nav-integracoes-btn"
            onClick={() => onSelectTab('integracoes')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'integracoes'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Integrações</span>
          </button>

          <button
            id="nav-chat-btn"
            onClick={() => onSelectTab('chat')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Assistente IA</span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                currentTab === 'chat'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              Online
            </span>
          </button>

          <button
            id="nav-analise-btn"
            onClick={() => onSelectTab('analise')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'analise'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Relatório & Análise</span>
          </button>

          <button
            id="nav-roadmap-btn"
            onClick={() => onSelectTab('roadmap')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Rocket className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Roadmap & SaaS</span>
          </button>
        </nav>

        {/* Modo Atual */}
        <div className="px-3 pt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Modo Atual
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              id="mode-study-btn"
              onClick={() => onToggleMode(currentMode === 'study' ? null : 'study')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                currentMode === 'study'
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Estudo</span>
              {currentMode === 'study' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>

            <button
              id="mode-work-btn"
              onClick={() => onToggleMode(currentMode === 'work' ? null : 'work')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                currentMode === 'work'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Trabalho</span>
              {currentMode === 'work' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              id="mode-gym-btn"
              onClick={() => onToggleMode(currentMode === 'gym' ? null : 'gym')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                currentMode === 'gym'
                  ? 'bg-orange-50 border-orange-300 text-orange-700 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Academia</span>
              {currentMode === 'gym' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Streak / Produtividade Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-100/50">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Produtividade
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{streakCount} dias</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium mb-1.5">Semana atual</div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day, idx) => {
            const isToday = idx === todayIndex;
            const isDone = streaks[idx];
            return (
              <div
                key={day}
                className={`h-7 rounded-md flex flex-col items-center justify-center text-[10px] font-semibold border transition-all ${
                  isToday
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : isDone
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    : 'bg-white text-slate-400 border-slate-200'
                }`}
                title={`${day}: ${isDone ? 'Metas batidas' : 'Pendente'}`}
              >
                <span>{day.substring(0, 1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
