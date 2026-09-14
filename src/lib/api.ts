import { UserAccount, Task, Habit, FocusSession, DailyDebriefReport, TeamBooking, CashoutTransaction, CashoutAccount, ThemeId, Mode } from '../types';

const TOKEN_KEY = 'arkih_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface UserDataPayload {
  tasks?: Task[];
  habits?: Habit[];
  focusSessions?: FocusSession[];
  debriefReport?: DailyDebriefReport | null;
  teamBookings?: TeamBooking[];
  cashoutTransactions?: CashoutTransaction[];
  cashoutAccount?: CashoutAccount;
  theme?: ThemeId;
  mode?: Mode;
  streaks?: Record<number, boolean>;
}

export async function apiGetUsers(): Promise<UserAccount[]> {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Falha ao obter lista de usuários');
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    console.warn('API get users fallback:', err);
    return [];
  }
}

export async function apiRegister(payload: {
  username: string;
  password?: string;
  fullName: string;
  phone: string;
  cpf: string;
  accountType: 'individual' | 'corporativo';
  companyName?: string;
  cnpj?: string;
  role: 'diretoria' | 'coordenacao' | 'operacional';
}): Promise<{ user: UserAccount; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Erro ao registrar usuário');
  }

  if (json.token) {
    setAuthToken(json.token);
  }

  return { user: json.user, token: json.token };
}

export async function apiLogin(identifier: string, password?: string): Promise<{ user: UserAccount; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Falha ao autenticar usuário');
  }

  if (json.token) {
    setAuthToken(json.token);
  }

  return { user: json.user, token: json.token };
}

export async function apiGetMe(): Promise<UserAccount | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    if (!res.ok) {
      clearAuthToken();
      return null;
    }
    const json = await res.json();
    return json.user || null;
  } catch (err) {
    return null;
  }
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getHeaders(),
    });
  } catch {
    // Ignore error
  } finally {
    clearAuthToken();
  }
}

export async function apiGetUserData(): Promise<{
  data: UserDataPayload;
  user: UserAccount;
  privacyNotice: string;
} | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/user/data', {
      headers: getHeaders(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthToken();
      }
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn('Could not fetch isolated user data from backend:', err);
    return null;
  }
}

export async function apiSaveUserData(payload: UserDataPayload): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/user/data', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not sync data with backend:', err);
    return false;
  }
}

export async function apiAddUserTask(task: Partial<Task>): Promise<Task | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/user/task', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.task;
  } catch {
    return null;
  }
}
