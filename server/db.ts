import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  cpf: string;
  accountType: 'individual' | 'corporativo';
  companyName?: string;
  cnpj?: string;
  role: 'diretoria' | 'coordenacao' | 'operacional';
  roleTitle: string;
  roleDescription?: string;
  avatar?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface UserIsolatedData {
  tasks: any[];
  habits: any[];
  focusSessions: any[];
  debriefReport: any | null;
  teamBookings: any[];
  cashoutTransactions: any[];
  cashoutAccount: any;
  theme: string;
  mode: string | null;
  streaks: Record<number, boolean>;
  lastUpdated: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  sessions: Record<string, { userId: string; createdAt: string; expiresAt: string }>;
  userData: Record<string, UserIsolatedData>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Initial Seed Data for each corporate role
const DEFAULT_PASSWORD = '123'; // Default password for demo users

function createDefaultSeed(): DatabaseSchema {
  const salt1 = generateSalt();
  const salt2 = generateSalt();
  const salt3 = generateSalt();

  const userAdmin: UserRecord = {
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
    passwordHash: hashPassword(DEFAULT_PASSWORD, salt1),
    salt: salt1,
    createdAt: '2026-01-10T08:00:00.000Z',
  };

  const userCoord: UserRecord = {
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
    passwordHash: hashPassword(DEFAULT_PASSWORD, salt2),
    salt: salt2,
    createdAt: '2026-02-14T09:30:00.000Z',
  };

  const userOper: UserRecord = {
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
    passwordHash: hashPassword(DEFAULT_PASSWORD, salt3),
    salt: salt3,
    createdAt: '2026-03-01T11:00:00.000Z',
  };

  // Scoped Data for Carlos (Diretoria)
  const dataAdmin: UserIsolatedData = {
    tasks: [
      { id: 101, title: 'Reunião de Diretoria Executiva Q1', time: '09:00', priority: 'high', cat: 'work', done: false, createdAt: new Date().toISOString() },
      { id: 102, title: 'Aprovação de balanço de pagamentos Pix', time: '11:30', priority: 'high', cat: 'work', done: true, createdAt: new Date().toISOString() },
      { id: 103, title: 'Auditoria de segurança e privacidade de dados', time: '15:00', priority: 'med', cat: 'work', done: false, createdAt: new Date().toISOString() },
    ],
    habits: [
      { id: 'h-admin-1', title: 'Revisão Orçamentária', cat: 'work', targetDaysPerWeek: 5, completedDays: [1, 2, 3, 4], streak: 6 },
      { id: 'h-admin-2', title: 'Alinhamento com Lideranças', cat: 'work', targetDaysPerWeek: 5, completedDays: [1, 3, 5], streak: 4 },
    ],
    focusSessions: [
      { id: 'fs-1', taskTitle: 'Planejamento Estratégico', durationMinutes: 45, completedAt: new Date().toISOString() },
    ],
    debriefReport: {
      productivityScore: 94,
      summary: 'Excelente liderança operacional. As metas de governança e aprovação financeira foram cumpridas com agilidade.',
      strengths: ['Rigor financeiro', 'Visão macro do negócio'],
      improvements: ['Delegar mais revisões intermediárias'],
      tomorrowAdvice: 'Iniciar o dia com a reunião de expansão de parcerias.',
      generatedAt: new Date().toISOString(),
    },
    teamBookings: [
      {
        id: 'tb-adm-1',
        type: 'servico',
        title: 'Auditoria Anual de Compliance',
        clientName: 'Grupo Vanguarda S.A.',
        clientPhone: '(11) 98777-6655',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        durationMinutes: 60,
        assignedMemberId: 'tm-3',
        assignedMemberName: 'Mariana Lima',
        status: 'confirmado',
        price: 850,
        paymentStatus: 'pago',
        createdAt: new Date().toISOString(),
      },
    ],
    cashoutTransactions: [
      { id: 'tx-adm-1', type: 'inflow_booking', description: 'Serviço Corporativo - Compliance Vanguarda', amount: 850, date: '2026-03-12', status: 'concluido' },
      { id: 'tx-adm-2', type: 'outflow_cashout', description: 'Retirada Pix para Conta Corporativa', amount: 2500, date: '2026-03-10', status: 'concluido', pixKey: '24.582.910/0001-38' },
    ],
    cashoutAccount: {
      pixKeyType: 'cnpj',
      pixKey: '24.582.910/0001-38',
      recipientName: 'Arkih Soluções Corporativas Ltda',
      bankName: 'Banco Inter S.A.',
    },
    theme: 'dark-default',
    mode: 'work',
    streaks: { 0: false, 1: true, 2: true, 3: true, 4: true, 5: false, 6: false },
    lastUpdated: new Date().toISOString(),
  };

  // Scoped Data for Mariana (Coordenação)
  const dataCoord: UserIsolatedData = {
    tasks: [
      { id: 201, title: 'Despacho da escala logística de motoboys', time: '08:30', priority: 'high', cat: 'work', done: true, createdAt: new Date().toISOString() },
      { id: 202, title: 'Alinhamento de consultas médicas corporativas', time: '10:00', priority: 'high', cat: 'work', done: false, createdAt: new Date().toISOString() },
      { id: 203, title: 'Check-in de rotas e entregas express', time: '14:00', priority: 'med', cat: 'work', done: false, createdAt: new Date().toISOString() },
    ],
    habits: [
      { id: 'h-coord-1', title: 'Organizar Despachos do Dia', cat: 'work', targetDaysPerWeek: 6, completedDays: [1, 2, 3, 4, 5], streak: 8 },
      { id: 'h-coord-2', title: 'Acompanhar SLA de Entregas', cat: 'work', targetDaysPerWeek: 5, completedDays: [1, 2, 4], streak: 3 },
    ],
    focusSessions: [],
    debriefReport: null,
    teamBookings: [
      {
        id: 'tb-coord-1',
        type: 'entrega',
        title: 'Remessa Express - Documentos Contratuais',
        clientName: 'Advocacia Pinheiro',
        clientPhone: '(11) 97777-1234',
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        durationMinutes: 30,
        assignedMemberId: 'tm-2',
        assignedMemberName: 'Roberto Santos',
        status: 'em_rota',
        price: 65,
        paymentStatus: 'pago',
        deliveryAddress: 'Av. Paulista, 1800 - Conj 14',
        createdAt: new Date().toISOString(),
      },
    ],
    cashoutTransactions: [
      { id: 'tx-coord-1', type: 'inflow_booking', description: 'Remessa Express - Advocacia Pinheiro', amount: 65, date: '2026-03-13', status: 'concluido' },
    ],
    cashoutAccount: {
      pixKeyType: 'cpf',
      pixKey: '285.491.730-44',
      recipientName: 'Mariana Alencar',
      bankName: 'Nubank S.A.',
    },
    theme: 'dark-purple',
    mode: 'work',
    streaks: { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false },
    lastUpdated: new Date().toISOString(),
  };

  // Scoped Data for Lucas (Operacional)
  const dataOper: UserIsolatedData = {
    tasks: [
      { id: 301, title: 'Treino de Musculação & Mobilidade', time: '07:00', priority: 'med', cat: 'gym', done: true, createdAt: new Date().toISOString() },
      { id: 302, title: 'Estudo Técnico de TypeScript & Backend', time: '09:00', priority: 'high', cat: 'study', done: false, createdAt: new Date().toISOString() },
      { id: 303, title: 'Executar lista de chamados de suporte', time: '13:30', priority: 'med', cat: 'work', done: false, createdAt: new Date().toISOString() },
      { id: 304, title: 'Leitura de documentação oficial', time: '20:00', priority: 'low', cat: 'study', done: false, createdAt: new Date().toISOString() },
    ],
    habits: [
      { id: 'h-oper-1', title: 'Treinar 5x na Semana', cat: 'gym', targetDaysPerWeek: 5, completedDays: [1, 2, 3], streak: 5 },
      { id: 'h-oper-2', title: 'Beber 2.5L de Água', cat: 'saude', targetDaysPerWeek: 7, completedDays: [1, 2, 3, 4], streak: 12 },
      { id: 'h-oper-3', title: 'Estudo Diário de 45m', cat: 'study', targetDaysPerWeek: 5, completedDays: [1, 2, 3], streak: 3 },
    ],
    focusSessions: [
      { id: 'fs-op-1', taskTitle: 'Estudo Técnico de TypeScript', durationMinutes: 50, completedAt: new Date().toISOString() },
    ],
    debriefReport: null,
    teamBookings: [],
    cashoutTransactions: [
      { id: 'tx-op-1', type: 'inflow_booking', description: 'Bônus de Produtividade Individual', amount: 350, date: '2026-03-11', status: 'concluido' },
    ],
    cashoutAccount: {
      pixKeyType: 'cpf',
      pixKey: '394.812.503-77',
      recipientName: 'Lucas Ferreira',
      bankName: 'Banco Inter S.A.',
    },
    theme: 'dark-blue',
    mode: 'study',
    streaks: { 0: false, 1: true, 2: true, 3: true, 4: true, 5: false, 6: false },
    lastUpdated: new Date().toISOString(),
  };

  return {
    users: [userAdmin, userCoord, userOper],
    sessions: {},
    userData: {
      [userAdmin.id]: dataAdmin,
      [userCoord.id]: dataCoord,
      [userOper.id]: dataOper,
    },
  };
}

class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && parsed.userData) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database.json, initializing default seed:', err);
    }

    const defaultSeed = createDefaultSeed();
    this.saveDatabase(defaultSeed);
    return defaultSeed;
  }

  private saveDatabase(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database.json:', err);
    }
  }

  private persist() {
    this.saveDatabase(this.db);
  }

  // --- Auth & User Operations ---

  public getUsersPublic(): Omit<UserRecord, 'passwordHash' | 'salt'>[] {
    return this.db.users.map(({ passwordHash, salt, ...user }) => user);
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public findUserByIdentifier(identifier: string): UserRecord | undefined {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    return this.db.users.find((u) => {
      const matchUsername = u.username.toLowerCase() === clean;
      const matchCpf = cleanDigits.length >= 11 && u.cpf.replace(/\D/g, '') === cleanDigits;
      const matchPhone = cleanDigits.length >= 8 && u.phone.replace(/\D/g, '') === cleanDigits;
      return matchUsername || matchCpf || matchPhone;
    });
  }

  public registerUser(params: {
    username: string;
    password: string;
    fullName: string;
    phone: string;
    cpf: string;
    accountType: 'individual' | 'corporativo';
    companyName?: string;
    cnpj?: string;
    role: 'diretoria' | 'coordenacao' | 'operacional';
  }): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
    const existing = this.findUserByIdentifier(params.username);
    if (existing) {
      throw new Error(`O nome de usuário "${params.username}" já está cadastrado.`);
    }

    const cleanCpf = params.cpf.replace(/\D/g, '');
    if (cleanCpf) {
      const existingCpf = this.db.users.find((u) => u.cpf.replace(/\D/g, '') === cleanCpf);
      if (existingCpf) {
        throw new Error('Já existe uma conta vinculada a este CPF.');
      }
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(params.password, salt);

    const roleTitles: Record<string, string> = {
      diretoria: 'Diretoria Executiva / Administrador Geral',
      coordenacao: 'Coordenação de Equipes & Gestão',
      operacional: 'Especialista / Operador de Execução',
    };

    const roleDescriptions: Record<string, string> = {
      diretoria: 'Acesso total: liquidação via Pix, despacho, auditoria e relatórios executivos',
      coordenacao: 'Gestão e despacho: delegação de consultas e entregas, prazos e rotinas',
      operacional: 'Execução de rotinas diárias, blocos de foco Pomodoro e hábitos pessoais',
    };

    const newUser: UserRecord = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: params.username.trim().toLowerCase(),
      fullName: params.fullName.trim(),
      phone: params.phone.trim(),
      cpf: params.cpf.trim(),
      accountType: params.accountType,
      companyName: params.accountType === 'corporativo' ? params.companyName?.trim() : undefined,
      cnpj: params.accountType === 'corporativo' ? params.cnpj?.trim() : undefined,
      role: params.role,
      roleTitle: roleTitles[params.role] || 'Membro Corporativo',
      roleDescription: roleDescriptions[params.role] || 'Usuário com privacidade de dados isolada',
      avatar: `https://images.unsplash.com/photo-${1535713875002 + (this.db.users.length % 10)}?w=150&auto=format&fit=crop&q=80`,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    this.db.users.push(newUser);

    // Initialize clean isolated partition for new user
    this.db.userData[newUser.id] = {
      tasks: [
        {
          id: 1,
          title: `Boas-vindas ao ARKIH, ${newUser.fullName.split(' ')[0]}!`,
          time: '09:00',
          priority: 'high',
          cat: 'work',
          done: false,
          createdAt: new Date().toISOString(),
          notes: 'Seus dados e tarefas estão isolados com total privacidade.',
        },
      ],
      habits: [
        { id: `h-${Date.now()}-1`, title: 'Planejar o Dia', cat: 'work', targetDaysPerWeek: 5, completedDays: [], streak: 0 },
        { id: `h-${Date.now()}-2`, title: 'Beber 2L de Água', cat: 'saude', targetDaysPerWeek: 7, completedDays: [], streak: 0 },
      ],
      focusSessions: [],
      debriefReport: null,
      teamBookings: [],
      cashoutTransactions: [],
      cashoutAccount: {
        pixKeyType: 'cpf',
        pixKey: newUser.cpf,
        recipientName: newUser.fullName,
        bankName: 'Instituição Bancária',
      },
      theme: 'dark-default',
      mode: 'work',
      streaks: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
      lastUpdated: new Date().toISOString(),
    };

    // Create session token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    this.db.sessions[token] = { userId: newUser.id, createdAt: new Date().toISOString(), expiresAt };

    this.persist();

    const { passwordHash: _, salt: __, ...userPublic } = newUser;
    return { user: userPublic, token };
  }

  public loginUser(identifier: string, password?: string): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
    const user = this.findUserByIdentifier(identifier);
    if (!user) {
      throw new Error('Usuário não encontrado. Verifique o nome de usuário, CPF ou telefone.');
    }

    // If password provided, verify hash
    if (password) {
      const computed = hashPassword(password, user.salt);
      if (computed !== user.passwordHash) {
        throw new Error('Senha incorreta.');
      }
    }

    // Create or renew session token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    this.db.sessions[token] = { userId: user.id, createdAt: new Date().toISOString(), expiresAt };

    this.persist();

    const { passwordHash: _, salt: __, ...userPublic } = user;
    return { user: userPublic, token };
  }

  public getUserByToken(token: string): Omit<UserRecord, 'passwordHash' | 'salt'> | null {
    const session = this.db.sessions[token];
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      delete this.db.sessions[token];
      this.persist();
      return null;
    }

    const user = this.findUserById(session.userId);
    if (!user) return null;

    const { passwordHash: _, salt: __, ...userPublic } = user;
    return userPublic;
  }

  public invalidateToken(token: string) {
    if (this.db.sessions[token]) {
      delete this.db.sessions[token];
      this.persist();
    }
  }

  // --- Scoped User Data Operations (Privacy Isolation) ---

  public getUserIsolatedData(userId: string): UserIsolatedData {
    if (!this.db.userData[userId]) {
      // Default empty isolated container if not yet created
      this.db.userData[userId] = {
        tasks: [],
        habits: [],
        focusSessions: [],
        debriefReport: null,
        teamBookings: [],
        cashoutTransactions: [],
        cashoutAccount: {
          pixKeyType: 'cpf',
          pixKey: '',
          recipientName: '',
          bankName: '',
        },
        theme: 'dark-default',
        mode: 'work',
        streaks: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
        lastUpdated: new Date().toISOString(),
      };
      this.persist();
    }
    return this.db.userData[userId];
  }

  public updateUserData(userId: string, partial: Partial<UserIsolatedData>): UserIsolatedData {
    const current = this.getUserIsolatedData(userId);
    const updated: UserIsolatedData = {
      ...current,
      ...partial,
      lastUpdated: new Date().toISOString(),
    };

    this.db.userData[userId] = updated;
    this.persist();
    return updated;
  }

  public addTaskForUser(userId: string, task: any) {
    const current = this.getUserIsolatedData(userId);
    const nextId = current.tasks.length > 0 ? Math.max(...current.tasks.map((t) => Number(t.id) || 0)) + 1 : 1;
    const newTask = {
      ...task,
      id: task.id || nextId,
      createdAt: task.createdAt || new Date().toISOString(),
    };
    current.tasks.push(newTask);
    current.lastUpdated = new Date().toISOString();
    this.persist();
    return newTask;
  }
}

export const dbManager = new DatabaseManager();
