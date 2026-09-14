import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Palette, Menu, User, LogIn, LogOut, ArrowRightLeft, Shield, Building2, Phone, FileText } from 'lucide-react';
import { TabType, Mode, ThemeId, UserAccount } from '../types';
import { formatFullDate } from '../lib/dateUtils';
import { getThemeConfig } from '../lib/themes';
import { getRoleDetail } from '../lib/authRoles';

interface TopBarProps {
  currentTab: TabType;
  currentMode: Mode;
  currentTheme: ThemeId;
  onOpenNewTaskModal: () => void;
  onOpenThemeModal: () => void;
  onOpenMobileMenu: () => void;
  onOpenQuickPrompt?: (prompt: string) => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'demo') => void;
  onLogout?: () => void;
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
    title: 'Integrações',
    subtitle: 'Conectar o ARKIH ao Google Calendar, Outlook, e-mail e mensageria',
  },
  equipes: {
    title: 'Equipes & Despacho Corporativo',
    subtitle: 'Agendamento de consultas, delegação de entregas e despacho inteligente',
  },
  cashout: {
    title: 'Cashout & Gestão Financeira',
    subtitle: 'Liquidação de receitas de serviços, saques instantâneos via Pix e comprovantes',
  },
  chat: {
    title: 'Assistente ARKIH',
    subtitle: 'Inteligência e automação para planejamento e criação de tarefas',
  },
  analise: {
    title: 'Relatório Executivo & Análise',
    subtitle: 'Diagnóstico inteligente, score de produtividade e exportação de calendário',
  },
  roadmap: {
    title: 'Planos',
    subtitle: 'Planos de acesso, recursos corporativos e modalidades de assinatura',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  currentMode,
  currentTheme,
  onOpenNewTaskModal,
  onOpenThemeModal,
  onOpenMobileMenu,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const info = TAB_TITLES[currentTab];
  const dateStr = formatFullDate();
  const themeConfig = getThemeConfig(currentTheme);
  const roleDetail = currentUser ? getRoleDetail(currentUser.role) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="px-3 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-20 flex items-center justify-between gap-2">
      {/* Left side: Hamburger button (mobile) + Title & Date */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          id="topbar-mobile-menu-btn"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 cursor-pointer transition-colors shrink-0 shadow-2xs"
          aria-label="Abrir menu de navegação"
          title="Menu principal"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight truncate">
              {info.title}
            </h1>
            {currentMode && (
              <span
                className={`hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
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
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5">
            <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Right side: User Profile, Theme Switcher & New Task Action */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* User Profile Pill / Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          {currentUser ? (
            <button
              id="topbar-user-profile-btn"
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs group"
              title={`${currentUser.fullName} (${currentUser.roleTitle})`}
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.fullName}
                className="w-7 h-7 rounded-lg object-cover border border-slate-200"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                  {roleDetail?.badgeLabel || currentUser.roleTitle}
                </div>
              </div>
              <span className={`hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${roleDetail?.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                {roleDetail?.badgeLabel || 'Usuário'}
              </span>
            </button>
          ) : (
            <button
              id="topbar-login-btn"
              onClick={() => onOpenAuthModal?.('login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}

          {/* User Profile Popover Dropdown */}
          {isProfileDropdownOpen && currentUser && (
            <div
              id="topbar-user-dropdown"
              className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-3 px-3.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* User Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.fullName}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-xs text-indigo-600 font-medium">
                    @{currentUser.username}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {currentUser.accountType === 'corporativo' ? 'Conta Corporativa' : 'Conta Individual'}
                  </div>
                </div>
              </div>

              {/* Role Details */}
              <div className="py-2.5 border-b border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Nível & Função:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleDetail?.badgeClass}`}>
                    {roleDetail?.badgeLabel}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {currentUser.roleTitle}
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  {currentUser.roleDescription || roleDetail?.description}
                </div>
              </div>

              {/* Registration Data: Phone, CPF, Company, CNPJ */}
              <div className="py-2.5 border-b border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Telefone:</span>
                  </span>
                  <span className="font-semibold text-slate-900">{currentUser.phone}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>CPF:</span>
                  </span>
                  <span className="font-semibold text-slate-900">{currentUser.cpf}</span>
                </div>

                {currentUser.companyName && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Empresa:</span>
                    </span>
                    <span className="font-semibold text-slate-900 truncate max-w-[140px]" title={currentUser.companyName}>
                      {currentUser.companyName}
                    </span>
                  </div>
                )}

                {currentUser.cnpj && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span>CNPJ:</span>
                    </span>
                    <span className="font-semibold text-slate-900">{currentUser.cnpj}</span>
                  </div>
                )}

                {/* Privacy & Isolation Backend Indicator */}
                <div className="mt-1 p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Privacidade Garantida no Backend</span>
                    <p className="text-[10px] text-emerald-700 leading-tight mt-0.5">
                      Suas tarefas, rotinas e registros estão isolados e protegidos para a sua conta.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onOpenAuthModal?.('demo');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Alternar Perfil / Novo Cadastro</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Palette Switcher Button */}
        <button
          id="topbar-theme-selector-btn"
          onClick={onOpenThemeModal}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 transition-all cursor-pointer shadow-2xs group"
          title={`Tema: ${themeConfig.name}`}
        >
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full border border-black/20 shrink-0"
              style={{ backgroundColor: themeConfig.primaryHex }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 -ml-1.5 hidden xs:inline-block"
              style={{ backgroundColor: themeConfig.bgHex }}
            />
          </div>
          <span className="hidden sm:inline font-medium text-slate-700">
            {themeConfig.name}
          </span>
          <Palette className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </button>

        <button
          id="topbar-new-task-btn"
          onClick={onOpenNewTaskModal}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-2.5 sm:px-3.5 py-2 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Nova tarefa</span>
        </button>
      </div>
    </header>
  );
};

