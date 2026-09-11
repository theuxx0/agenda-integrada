import { Task, ChatMessage, Mode, Habit, FocusSession, DailyDebriefReport } from '../types';

const TASKS_KEY = 'nexus_ai_tasks';
const MODE_KEY = 'nexus_ai_mode';
const CHAT_KEY = 'nexus_ai_chat';
const STREAKS_KEY = 'nexus_ai_streaks';
const HABITS_KEY = 'nexus_ai_habits';
const FOCUS_SESSIONS_KEY = 'nexus_ai_focus_sessions';
const DEBRIEF_KEY = 'nexus_ai_debrief';

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

