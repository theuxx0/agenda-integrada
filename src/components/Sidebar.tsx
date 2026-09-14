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
  Users,
  Wallet,
  BookOpen,
  Briefcase,
  Dumbbell,
  Sparkles,
  Flame,
  Palette,
  Shield,
  ArrowRightLeft,
  LogIn,
} from 'lucide-react';
import { TabType, Mode, ThemeId, UserAccount } from '../types';
import { DAYS_OF_WEEK } from '../lib/dateUtils';
import { getThemeConfig } from '../lib/themes';
import { getRoleDetail } from '../lib/authRoles';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentMode: Mode;
  onToggleMode: (mode: Mode) => void;
  currentTheme: ThemeId;
  onOpenThemeModal: () => void;
  streaks: boolean[];
  streakCount: number;
  todayIndex: number;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'demo') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentMode,
  onToggleMode,
  currentTheme,
  onOpenThemeModal,
  streaks,
  streakCount,
  todayIndex,
  currentUser,
  onOpenAuthModal,
}) => {
  const themeConfig = getThemeConfig(currentTheme);
  const roleDetail = currentUser ? getRoleDetail(currentUser.role) : null;
  return (
    <aside className="hidden md:flex w-56 shrink-0 bg-slate-50/80 backdrop-blur border-r border-slate-200/80 flex-col justify-between select-none h-full min-h-screen">
      <div>
        {/* Logo Header */}
        <div className="p-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight">
                ARKIH
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
            id="nav-equipes-btn"
            onClick={() => onSelectTab('equipes')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'equipes'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Equipes & Despacho</span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                currentTab === 'equipes'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              Corporativo
            </span>
          </button>

          <button
            id="nav-cashout-btn"
            onClick={() => onSelectTab('cashout')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'cashout'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Cashout & Pix</span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                currentTab === 'cashout'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              Finanças
            </span>
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
            <span>Planos</span>
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

        {/* Theme Quick Switcher in Sidebar */}
        <div className="px-3 pt-3 pb-1">
          <button
            id="sidebar-theme-palette-btn"
            onClick={onOpenThemeModal}
            className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/70 hover:bg-white text-slate-700 transition-all cursor-pointer shadow-2xs group"
            title="Alterar Tema Visual"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs flex items-center justify-center text-[7px] text-white font-bold"
                style={{ backgroundColor: themeConfig.primaryHex }}
              >
                ●
              </div>
              <div className="text-left truncate">
                <div className="text-[11px] font-semibold text-slate-900 leading-tight truncate">
                  {themeConfig.name}
                </div>
                <div className="text-[9px] text-slate-400 font-medium leading-none truncate">
                  Paleta de Temas
                </div>
              </div>
            </div>
            <Palette className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors ml-1" />
          </button>
        </div>

        {/* User Account / Profile Card */}
        <div className="px-3 pt-3 pb-1">
          {currentUser ? (
            <div
              id="sidebar-user-card"
              onClick={() => onOpenAuthModal?.('demo')}
              className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs group"
              title="Clique para alternar perfil ou gerenciar cadastro"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    @{currentUser.username}
                  </div>
                </div>
                <ArrowRightLeft className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
              </div>
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate ${roleDetail?.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                  {roleDetail?.badgeLabel || currentUser.roleTitle}
                </span>
                <span className="text-[9px] text-slate-400">
                  {currentUser.accountType === 'corporativo' ? 'Corporativo' : 'Pessoal'}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuthModal?.('login')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}
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
