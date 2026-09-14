import {
  Task,
  ChatMessage,
  Mode,
  Habit,
  FocusSession,
  DailyDebriefReport,
  TeamMember,
  TeamBooking,
  CashoutTransaction,
  CashoutAccount,
  ThemeId,
  UserAccount,
} from '../types';

const THEME_KEY = 'nexus_ai_theme';
const TASKS_KEY = 'nexus_ai_tasks';
const MODE_KEY = 'nexus_ai_mode';
const CHAT_KEY = 'nexus_ai_chat';
const STREAKS_KEY = 'nexus_ai_streaks';
const HABITS_KEY = 'nexus_ai_habits';
const FOCUS_SESSIONS_KEY = 'nexus_ai_focus_sessions';
const DEBRIEF_KEY = 'nexus_ai_debrief';
const TEAM_MEMBERS_KEY = 'nexus_ai_team_members';
const TEAM_BOOKINGS_KEY = 'nexus_ai_team_bookings';
const CASHOUT_TXS_KEY = 'nexus_ai_cashout_txs';
const CASHOUT_ACCOUNT_KEY = 'nexus_ai_cashout_account';
const USERS_KEY = 'arkih_registered_users';
const CURRENT_USER_KEY = 'arkih_current_user_session';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin-1',
    username: 'carlos.mendes',
    fullName: 'Carlos Mendes',
    phone: '(11) 98123-4567',
    cpf: '142.583.920-11',
    accountType: 'corporativo',
    companyName: 'Arkih Soluções Corporativas Ltda',
    cnpj: '24.582.910/0001-38',
    role: 'diretoria',
    roleTitle: 'Diretoria Executiva / Administrador Geral',
    roleDescription: 'Acesso total: liquidação via Pix, despacho, auditoria e relatórios executivos',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'usr-coord-2',
    username: 'mariana.alencar',
    fullName: 'Mariana Alencar',
    phone: '(11) 97321-8890',
    cpf: '285.491.730-44',
    accountType: 'corporativo',
    companyName: 'Arkih Soluções Corporativas Ltda',
    cnpj: '24.582.910/0001-38',
    role: 'coordenacao',
    roleTitle: 'Coordenação de Projetos & Tarefas',
    roleDescription: 'Gestão e despacho: delegação de consultas e entregas, prazos e rotinas',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-14T09:30:00.000Z',
  },
  {
    id: 'usr-oper-3',
    username: 'lucas.ferreira',
    fullName: 'Lucas Ferreira',
    phone: '(11) 96455-1234',
    cpf: '394.812.503-77',
    accountType: 'individual',
    role: 'operacional',
    roleTitle: 'Especialista / Operador de Execução',
    roleDescription: 'Execução de rotinas diárias, blocos de foco Pomodoro e hábitos pessoais',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T11:00:00.000Z',
  },
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Dr. André Silva',
    role: 'Especialista em Saúde & Clínica',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Consultas Médicas & Avaliações',
    active: true,
    phone: '(11) 98765-4321',
    completedBookings: 28,
  },
  {
    id: 'tm-2',
    name: 'Roberto Santos',
    role: 'Coordenador de Entregas & Logística',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialty: 'Entregas Express & Remessas',
    active: true,
    phone: '(11) 97654-3210',
    completedBookings: 64,
  },
  {
    id: 'tm-3',
    name: 'Mariana Lima',
    role: 'Consultora de Negócios & Atendimento',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialty: 'Alinhamentos & Consultorias',
    active: true,
    phone: '(11) 96543-2109',
    completedBookings: 42,
  },
  {
    id: 'tm-4',
    name: 'Carlos Oliveira',
    role: 'Entregador Operacional',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Entregas de Produtos & Documentos',
    active: true,
    phone: '(11) 95432-1098',
    completedBookings: 91,
  },
];

export const INITIAL_TEAM_BOOKINGS: TeamBooking[] = [
  {
    id: 'tb-1',
    type: 'consulta',
    title: 'Consulta Clínica Geral — Avaliação Trimestral',
    clientName: 'Fernando Albuquerque',
    clientPhone: '(11) 99123-4567',
    clientEmail: 'fernando.albuquerque@email.com',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    durationMinutes: 45,
    assignedMemberId: 'tm-1',
    assignedMemberName: 'Dr. André Silva',
    status: 'confirmado',
    price: 250,
    paymentStatus: 'pago',
    locationOrLink: 'Consultório 3 / Google Meet: meet.google.com/ark-med-cons',
    notes: 'Paciente solicitou retorno para conferência de exames de rotina.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tb-2',
    type: 'entrega',
    title: 'Entrega de Contratos & Documentos Fiscais',
    clientName: 'TechSolutions Brasil',
    clientPhone: '(11) 98888-7777',
    clientEmail: 'contato@techsolutions.com.br',
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    durationMinutes: 30,
    assignedMemberId: 'tm-2',
    assignedMemberName: 'Roberto Santos',
    status: 'em_rota',
    price: 45,
    paymentStatus: 'pago',
    deliveryAddress: 'Av. Paulista, 1842 - Conjunto 112, Bela Vista, São Paulo - SP',
    notes: 'Entregar na recepção aos cuidados de Patrícia Ramos.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tb-3',
    type: 'consulta',
    title: 'Consultoria Estratégica de Planejamento Q4',
    clientName: 'Juliana Mendes',
    clientPhone: '(11) 97777-6666',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '14:00',
    durationMinutes: 60,
    assignedMemberId: 'tm-3',
    assignedMemberName: 'Mariana Lima',
    status: 'agendado',
    price: 320,
    paymentStatus: 'pago',
    locationOrLink: 'Sala Virtual ARKIH Teams: meet.google.com/ark-plan-jul',
    notes: 'Apresentação de métricas e alinhamento de escopo.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tb-4',
    type: 'entrega',
    title: 'Entrega Express — Kit de Boas-Vindas Corporativo',
    clientName: 'Camila Rocha',
    clientPhone: '(11) 96666-5555',
    date: new Date().toISOString().split('T')[0],
    time: '16:45',
    durationMinutes: 30,
    assignedMemberId: 'tm-4',
    assignedMemberName: 'Carlos Oliveira',
    status: 'concluido',
    price: 55,
    paymentStatus: 'pago',
    deliveryAddress: 'Rua Oscar Freire, 920 - Apto 82, Cerqueira César, São Paulo - SP',
    notes: 'Deixar com a portaria 24h caso não atenda o interfone.',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_CASHOUT_TRANSACTIONS: CashoutTransaction[] = [
  {
    id: 'ctx-1',
    type: 'inflow_booking',
    description: 'Recebimento de Consulta — Fernando Albuquerque',
    amount: 250,
    date: new Date().toISOString().split('T')[0],
    status: 'concluido',
    referenceId: 'tb-1',
  },
  {
    id: 'ctx-2',
    type: 'inflow_booking',
    description: 'Recebimento de Entrega Express — Kit Corporativo',
    amount: 55,
    date: new Date().toISOString().split('T')[0],
    status: 'concluido',
    referenceId: 'tb-4',
  },
  {
    id: 'ctx-3',
    type: 'inflow_booking',
    description: 'Recebimento de Entrega Docs — TechSolutions',
    amount: 45,
    date: new Date().toISOString().split('T')[0],
    status: 'concluido',
    referenceId: 'tb-2',
  },
  {
    id: 'ctx-4',
    type: 'outflow_cashout',
    description: 'Cashout Instantâneo via Pix para Matheus Henrique Santiago',
    amount: 200,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    status: 'concluido',
    pixKey: 'matheushenriquesantiago58@gmail.com',
    receiptId: 'PIX-ARK-89412-2026',
  },
];

export const INITIAL_CASHOUT_ACCOUNT: CashoutAccount = {
  pixKeyType: 'email',
  pixKey: 'matheushenriquesantiago58@gmail.com',
  recipientName: 'Matheus Henrique Santiago',
  bankName: 'Nubank (260)',
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
    title: 'Beber 2.5L de água',
    cat: 'saude',
    targetDaysPerWeek: 7,
    completedDays: [0, 1, 2, 3], // Sun, Mon, Tue, Wed
    streak: 4,
    reminderTime: '08:00',
  },
  {
    id: 'h2',
    title: '30 min de estudo focado',
    cat: 'study',
    targetDaysPerWeek: 5,
    completedDays: [1, 2, 3],
    streak: 3,
    reminderTime: '09:00',
  },
  {
    id: 'h3',
    title: 'Treino ou alongamento',
    cat: 'gym',
    targetDaysPerWeek: 5,
    completedDays: [1, 2],
    streak: 2,
    reminderTime: '18:30',
  },
  {
    id: 'h4',
    title: 'Planejar o dia seguinte à noite',
    cat: 'work',
    targetDaysPerWeek: 6,
    completedDays: [0, 1, 2],
    streak: 3,
    reminderTime: '21:30',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: 'Revisar cálculo diferencial',
    time: '08:00',
    priority: 'high',
    cat: 'study',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Academia — treino A',
    time: '19:00',
    priority: 'med',
    cat: 'gym',
    done: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Projeto da faculdade — slides',
    time: '14:00',
    priority: 'high',
    cat: 'study',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Consulta médica',
    time: '11:30',
    priority: 'med',
    cat: 'saude',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Ler artigo sobre redes neurais',
    time: '20:00',
    priority: 'low',
    cat: 'study',
    done: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    text: 'Olá! Sou seu assistente Nexus AI. Posso organizar tarefas, sugerir horários e criar sua rotina inteligente. Como posso ajudar hoje?',
    timestamp: 'Hoje',
  },
];

export const INITIAL_STREAKS = [true, true, true, false, true, false, false];

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function loadMode(): Mode {
  try {
    const raw = localStorage.getItem(MODE_KEY);
    if (raw === 'study' || raw === 'work' || raw === 'gym') return raw;
    return 'study';
  } catch {
    return 'study';
  }
}

export function saveMode(mode: Mode) {
  try {
    localStorage.setItem(MODE_KEY, mode || '');
  } catch (e) {
    console.error('Failed to save mode', e);
  }
}

export function loadChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return INITIAL_CHAT;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CHAT;
  } catch {
    return INITIAL_CHAT;
  }
}

export function saveChat(messages: ChatMessage[]) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat', e);
  }
}

export function loadStreaks(): boolean[] {
  try {
    const raw = localStorage.getItem(STREAKS_KEY);
    if (!raw) return INITIAL_STREAKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length === 7 ? parsed : INITIAL_STREAKS;
  } catch {
    return INITIAL_STREAKS;
  }
}

export function saveStreaks(streaks: boolean[]) {
  try {
    localStorage.setItem(STREAKS_KEY, JSON.stringify(streaks));
  } catch (e) {
    console.error('Failed to save streaks', e);
  }
}

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return INITIAL_HABITS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_HABITS;
  } catch {
    return INITIAL_HABITS;
  }
}

export function saveHabits(habits: Habit[]) {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits', e);
  }
}

export function loadFocusSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(FOCUS_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFocusSessions(sessions: FocusSession[]) {
  try {
    localStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save focus sessions', e);
  }
}

export function loadDebrief(): DailyDebriefReport | null {
  try {
    const raw = localStorage.getItem(DEBRIEF_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDebrief(debrief: DailyDebriefReport | null) {
  try {
    if (!debrief) {
      localStorage.removeItem(DEBRIEF_KEY);
    } else {
      localStorage.setItem(DEBRIEF_KEY, JSON.stringify(debrief));
    }
  } catch (e) {
    console.error('Failed to save debrief', e);
  }
}

export function loadTeamMembers(): TeamMember[] {
  try {
    const raw = localStorage.getItem(TEAM_MEMBERS_KEY);
    if (!raw) return INITIAL_TEAM_MEMBERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TEAM_MEMBERS;
  } catch {
    return INITIAL_TEAM_MEMBERS;
  }
}

export function saveTeamMembers(members: TeamMember[]) {
  try {
    localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save team members', e);
  }
}

export function loadTeamBookings(): TeamBooking[] {
  try {
    const raw = localStorage.getItem(TEAM_BOOKINGS_KEY);
    if (!raw) return INITIAL_TEAM_BOOKINGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TEAM_BOOKINGS;
  } catch {
    return INITIAL_TEAM_BOOKINGS;
  }
}

export function saveTeamBookings(bookings: TeamBooking[]) {
  try {
    localStorage.setItem(TEAM_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save team bookings', e);
  }
}

export function loadCashoutTransactions(): CashoutTransaction[] {
  try {
    const raw = localStorage.getItem(CASHOUT_TXS_KEY);
    if (!raw) return INITIAL_CASHOUT_TRANSACTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CASHOUT_TRANSACTIONS;
  } catch {
    return INITIAL_CASHOUT_TRANSACTIONS;
  }
}

export function saveCashoutTransactions(transactions: CashoutTransaction[]) {
  try {
    localStorage.setItem(CASHOUT_TXS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save cashout transactions', e);
  }
}

export function loadCashoutAccount(): CashoutAccount {
  try {
    const raw = localStorage.getItem(CASHOUT_ACCOUNT_KEY);
    if (!raw) return INITIAL_CASHOUT_ACCOUNT;
    const parsed = JSON.parse(raw);
    return parsed?.pixKey ? parsed : INITIAL_CASHOUT_ACCOUNT;
  } catch {
    return INITIAL_CASHOUT_ACCOUNT;
  }
}

export function saveCashoutAccount(account: CashoutAccount) {
  try {
    localStorage.setItem(CASHOUT_ACCOUNT_KEY, JSON.stringify(account));
  } catch (e) {
    console.error('Failed to save cashout account', e);
  }
}

export function loadTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (
      raw === 'dark-default' ||
      raw === 'dark-purple' ||
      raw === 'dark-blue' ||
      raw === 'dark-emerald' ||
      raw === 'dark-amber' ||
      raw === 'dark-oled' ||
      raw === 'light-clean'
    ) {
      return raw;
    }
    return 'dark-default';
  } catch {
    return 'dark-default';
  }
}

export function saveTheme(theme: ThemeId) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return INITIAL_USERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: UserAccount[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function loadCurrentUser(): UserAccount {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return INITIAL_USERS[0];
    const parsed = JSON.parse(raw);
    return parsed?.id ? parsed : INITIAL_USERS[0];
  } catch {
    return INITIAL_USERS[0];
  }
}

export function saveCurrentUser(user: UserAccount | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save current user', e);
  }
}


