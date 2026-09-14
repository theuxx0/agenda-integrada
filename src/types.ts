export type Priority = 'high' | 'med' | 'low';

export type Category = 'study' | 'work' | 'gym' | 'saude' | 'general';

export type Mode = 'study' | 'work' | 'gym' | null;

export type UserRole = 'diretoria' | 'coordenacao' | 'operacional';

export type AccountType = 'individual' | 'corporativo';

export interface UserAccount {
  id: string;
  username: string; // nome de usuário
  fullName: string;
  phone: string; // numero de telefone
  cpf: string; // cpf do usuário
  accountType: AccountType;
  companyName?: string; // se corporativo
  cnpj?: string; // se corporativo cnpj da empresa
  role: UserRole; // diretoria (admin), coordenacao (gestor), operacional (normal)
  roleTitle: string; // título refinado e profissional
  roleDescription?: string;
  avatar?: string;
  password?: string;
  createdAt: string;
}

export type ThemeId =
  | 'dark-default'
  | 'dark-purple'
  | 'dark-blue'
  | 'dark-emerald'
  | 'dark-amber'
  | 'dark-oled'
  | 'light-clean';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'dark' | 'light';
  primaryHex: string;
  bgHex: string;
  cardHex: string;
  borderHex: string;
  glowHex: string;
  description: string;
}

export type TabType =
  | 'dashboard'
  | 'tarefas'
  | 'timeline'
  | 'habitos'
  | 'equipes'
  | 'cashout'
  | 'integracoes'
  | 'chat'
  | 'analise'
  | 'roadmap';

export type PlanType = 'free' | 'pro' | 'teams';

export type BookingType = 'consulta' | 'entrega' | 'reuniao' | 'servico';
export type BookingStatus = 'agendado' | 'confirmado' | 'em_rota' | 'concluido' | 'cancelado';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialty: string;
  active: boolean;
  phone: string;
  completedBookings: number;
}

export interface TeamBooking {
  id: string;
  type: BookingType;
  title: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  assignedMemberId: string;
  assignedMemberName: string;
  status: BookingStatus;
  price: number; // R$
  paymentStatus: 'pago' | 'pendente' | 'em_retencao';
  deliveryAddress?: string;
  locationOrLink?: string;
  notes?: string;
  createdAt: string;
}

export interface CashoutTransaction {
  id: string;
  type: 'inflow_booking' | 'outflow_cashout';
  description: string;
  amount: number;
  date: string;
  status: 'concluido' | 'processando' | 'falha';
  referenceId?: string;
  pixKey?: string;
  receiptId?: string;
}

export interface CashoutAccount {
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixKey: string;
  recipientName: string;
  bankName: string;
}

export interface IntegrationStatus {
  id: 'google_calendar' | 'outlook_calendar' | 'messaging_email' | 'web_mobile';
  title: string;
  description: string;
  category: 'calendario' | 'captura' | 'plataforma';
  connected: boolean;
  status: 'disponivel' | 'em_breve' | 'planejado';
  features: string[];
}

export interface Task {
  id: number;
  title: string;
  time: string; // HH:mm
  date?: string; // YYYY-MM-DD
  priority: Priority;
  cat: Category;
  done: boolean;
  notes?: string;
  durationMinutes?: number;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  cat: Category;
  targetDaysPerWeek: number;
  completedDays: number[]; // 0 for Sun, 1 for Mon, ..., 6 for Sat
  streak: number;
  reminderTime?: string;
}

export interface FocusSession {
  id: string;
  taskId?: number;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
}

export interface DailyDebriefReport {
  productivityScore: number; // 0 - 100
  summary: string;
  strengths: string[];
  improvements: string[];
  tomorrowAdvice: string;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedTask?: {
    title: string;
    time: string;
    priority: Priority;
    cat: Category;
  };
  rescheduledCount?: number;
}

export interface ExtractedTaskData {
  hasTask: boolean;
  title?: string;
  time?: string;
  priority?: Priority;
  cat?: Category;
  confidence?: number;
}
