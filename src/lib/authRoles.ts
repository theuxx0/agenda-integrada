import { UserRole } from '../types';

export interface RoleDetail {
  id: UserRole;
  title: string;
  shortTitle: string;
  badgeLabel: string;
  description: string;
  badgeClass: string;
  accentColor: string;
  permissions: string[];
}

export const ROLE_DETAILS: Record<UserRole, RoleDetail> = {
  diretoria: {
    id: 'diretoria',
    title: 'Diretoria Executiva / Administrador Geral',
    shortTitle: 'Diretoria Executiva',
    badgeLabel: 'Admin Master',
    description: 'Acesso total: liquidação financeira (Cashout Pix), despacho corporativo, auditoria e relatórios executivos.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#9333ea',
    permissions: [
      'Aprovação e Saques via Pix',
      'Despacho e Gestão de Equipes',
      'Relatórios e Score Executivo',
      'Configuração Geral do Sistema',
    ],
  },
  coordenacao: {
    id: 'coordenacao',
    title: 'Coordenação de Projetos & Tarefas',
    shortTitle: 'Coordenação de Tarefas',
    badgeLabel: 'Gestor de Fluxos',
    description: 'Gestão operacional: criação e delegação de tarefas, agendamento de consultas e entregas para a equipe.',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563eb',
    permissions: [
      'Criação e Delegação de Tarefas',
      'Despacho de Consultas e Entregas',
      'Reagendamento Inteligente com IA',
      'Visualização de Produtividade',
    ],
  },
  operacional: {
    id: 'operacional',
    title: 'Especialista / Operador de Execução',
    shortTitle: 'Membro Especialista',
    badgeLabel: 'Colaborador Operacional',
    description: 'Execução de tarefas e rotinas: check-in de atividades atribuídas, blocos Pomodoro e acompanhamento de hábitos.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#059669',
    permissions: [
      'Execução de Tarefas Próprias',
      'Blocos Pomodoro e Metas Diárias',
      'Registro de Hábitos Diários',
      'Assistente ARKIH para Produtividade',
    ],
  },
};

export function getRoleDetail(role: UserRole): RoleDetail {
  return ROLE_DETAILS[role] || ROLE_DETAILS.operacional;
}

// Helpers for input masks and formatting
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
