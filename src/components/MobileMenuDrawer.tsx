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
  X,
  Plus,
  LogIn,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import { TabType, Mode, ThemeId, UserAccount } from '../types';
import { DAYS_OF_WEEK } from '../lib/dateUtils';
import { getThemeConfig } from '../lib/themes';
import { getRoleDetail } from '../lib/authRoles';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentMode: Mode;
  onToggleMode: (mode: Mode) => void;
  currentTheme: ThemeId;
  onOpenThemeModal: () => void;
  streaks: boolean[];
  streakCount: number;
  todayIndex: number;
  onOpenNewTaskModal: () => void;
  pendingTasksCount?: number;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'demo') => void;
  onLogout?: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  currentMode,
  onToggleMode,
  currentTheme,
  onOpenThemeModal,
  streaks,
  streakCount,
  todayIndex,
  onOpenNewTaskModal,
  pendingTasksCount = 0,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  if (!isOpen) return null;

  const themeConfig = getThemeConfig(currentTheme);
  const roleDetail = currentUser ? getRoleDetail(currentUser.role) : null;

  const handleItemClick = (tab: TabType) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        id="mobile-navigation-drawer"
        className="relative w-[85%] max-w-xs bg-white text-slate-900 h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-250 z-10 border-r border-slate-200/80"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight">
                ARKIH
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Agenda & Despacho Inteligente
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* User Profile Card */}
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            {currentUser ? (
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.fullName}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-indigo-600 font-medium truncate">
                      @{currentUser.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 py-1.5 px-2 bg-white rounded-xl border border-slate-100 mb-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate ${roleDetail?.badgeClass}`}>
                    {roleDetail?.badgeLabel || currentUser.roleTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {currentUser.accountType === 'corporativo' ? 'Corporativo' : 'Pessoal'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal?.('demo');
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Perfis</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onLogout?.();
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-rose-50 text-rose-600 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal?.('login');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar ou Cadastrar</span>
              </button>
            )}
          </div>
          {/* Quick Action: Nova Tarefa */}
          <button
            onClick={() => {
              onClose();
              onOpenNewTaskModal();
            }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm shadow-indigo-200 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Tarefa</span>
          </button>

          {/* Seção 1: Navegação Principal */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Navegação Principal
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleItemClick('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleItemClick('tarefas')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'tarefas'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 shrink-0" />
                  <span>Minhas Tarefas</span>
                </div>
                {pendingTasksCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {pendingTasksCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleItemClick('timeline')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'timeline'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>Blocos & Pomodoro</span>
              </button>

              <button
                onClick={() => handleItemClick('habitos')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'habitos'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Hábitos Diários</span>
              </button>

              <button
                onClick={() => handleItemClick('chat')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'chat'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Assistente ARKIH</span>
              </button>

              <button
                onClick={() => handleItemClick('analise')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'analise'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Relatório Executivo</span>
              </button>
            </nav>
          </div>

          {/* Seção 2: Corporativo & SaaS */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
              <span>Corporativo & SaaS</span>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                B2B
              </span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleItemClick('equipes')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'equipes'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Equipes & Despacho</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  Agendamentos
                </span>
              </button>

              <button
                onClick={() => handleItemClick('cashout')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'cashout'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cashout & Pix</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Pix Direto
                </span>
              </button>

              <button
                onClick={() => handleItemClick('integracoes')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'integracoes'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Share2 className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Integrações</span>
              </button>

              <button
                onClick={() => handleItemClick('roadmap')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'roadmap'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Rocket className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Planos</span>
              </button>
            </nav>
          </div>

          {/* Seção 3: Modos de Foco */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Modos de Foco
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onToggleMode(currentMode === 'study' ? null : 'study')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                  currentMode === 'study'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-600 mb-1" />
                <span>Estudo</span>
              </button>

              <button
                onClick={() => onToggleMode(currentMode === 'work' ? null : 'work')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                  currentMode === 'work'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4 text-emerald-600 mb-1" />
                <span>Trabalho</span>
              </button>

              <button
                onClick={() => onToggleMode(currentMode === 'gym' ? null : 'gym')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                  currentMode === 'gym'
                    ? 'bg-orange-50 border-orange-300 text-orange-700 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Dumbbell className="w-4 h-4 text-orange-600 mb-1" />
                <span>Academia</span>
              </button>
            </div>
          </div>

          {/* Seção 4: Seletor de Tema */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Aparência & Tema
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenThemeModal();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs flex items-center justify-center text-[7px] text-white font-bold"
                  style={{ backgroundColor: themeConfig.primaryHex }}
                >
                  ●
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {themeConfig.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Alternar entre 7 paletas
                  </div>
                </div>
              </div>
              <Palette className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Drawer Footer: Produtividade & Streaks */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/80">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Produtividade
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streakCount} dias seguidos</span>
            </div>
          </div>

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
      </div>
    </div>
  );
};
