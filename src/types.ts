export type Priority = 'high' | 'med' | 'low';

export type Category = 'study' | 'work' | 'gym' | 'saude' | 'general';

export type Mode = 'study' | 'work' | 'gym' | null;

export type TabType =
  | 'dashboard'
  | 'tarefas'
  | 'timeline'
  | 'habitos'
  | 'integracoes'
  | 'chat'
  | 'analise'
  | 'roadmap';

export type PlanType = 'free' | 'pro' | 'teams';

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
