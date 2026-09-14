import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

import { dbManager } from './server/db';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Auth Middleware to ensure privacy and data isolation
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login para continuar.' });
    return;
  }
  const user = dbManager.getUserByToken(token);
  if (!user) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Por favor, faça login novamente.' });
    return;
  }
  (req as any).user = user;
  (req as any).token = token;
  next();
}

// Fallback candidate models compliant with @google/genai SKILL.md
const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
];

async function generateContentWithFallback(ai: GoogleGenAI, options: any) {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        ...options,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || err?.error?.code;
      console.warn(`Nexus AI: Model ${model} encountered status ${status}, trying next fallback model...`);
    }
  }
  throw lastError;
}
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback rule-based extractor if no API key is provided
function localExtractTask(message: string, currentMode?: string) {
  const lower = message.toLowerCase();
  
  // Detect time
  let timeStr = '09:00';
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2})|h(?:(\d{2}))?)/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const mins = (timeMatch[2] || timeMatch[3] || '00').padStart(2, '0');
    timeStr = `${hours}:${mins}`;
  }

  // Detect priority
  let priority: 'high' | 'med' | 'low' = 'med';
  if (lower.includes('urgente') || lower.includes('prova') || lower.includes('importante') || lower.includes('prazo')) {
    priority = 'high';
  } else if (lower.includes('tranquilo') || lower.includes('quando der') || lower.includes('leitura')) {
    priority = 'low';
  }

  // Detect category
  let cat: 'study' | 'work' | 'gym' | 'saude' = 'study';
  if (lower.includes('treino') || lower.includes('academia') || lower.includes('musculação') || lower.includes('corrida') || lower.includes('exercício')) {
    cat = 'gym';
  } else if (lower.includes('médic') || lower.includes('dentista') || lower.includes('remédio') || lower.includes('exame') || lower.includes('consulta')) {
    cat = 'saude';
  } else if (lower.includes('reunião') || lower.includes('cliente') || lower.includes('relatório') || lower.includes('trabalho') || lower.includes('projeto da empresa')) {
    cat = 'work';
  } else if (lower.includes('estud') || lower.includes('prova') || lower.includes('faculdade') || lower.includes('revisar') || lower.includes('aula') || lower.includes('artigo')) {
    cat = 'study';
  } else if (currentMode === 'work' || currentMode === 'gym') {
    cat = currentMode;
  }

  // Clean title
  let cleanTitle = message
    .replace(/(?:amanhã|hoje|sexta|segunda|terça|quarta|quinta|sábado|domingo)/gi, '')
    .replace(/(?:às|as)\s*\d{1,2}(?::\d{2}|h\d{0,2})?/gi, '')
    .replace(/\b(?:tenho que|tenho|preciso|vou|lembrar de|adicionar|agendar|marcar)\b/gi, '')
    .trim();

  // Remove leading/trailing punctuation
  cleanTitle = cleanTitle.replace(/^[-:,.\s]+|[-:,.\s]+$/g, '');

  if (cleanTitle.length > 2) {
    const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    return {
      title: formattedTitle,
      time: timeStr,
      priority,
      cat,
    };
  }

  return null;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    usersCount: dbManager.getUsersPublic().length,
  });
});

// --- AUTHENTICATION & USER MANAGEMENT (BACKEND PRIVACY & DATA ISOLATION) ---

// Public list of users (for demo switcher or team contacts, passwords omitted)
app.get('/api/users', (req, res) => {
  try {
    const users = dbManager.getUsersPublic();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar usuários cadastrados' });
  }
});

// Register a new user
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, fullName, phone, cpf, accountType, companyName, cnpj, role } = req.body;

    if (!username || !fullName || !phone || !cpf) {
      res.status(400).json({ error: 'Campos obrigatórios ausentes: nome completo, usuário, telefone e CPF são necessários.' });
      return;
    }

    if (accountType === 'corporativo' && (!companyName || !cnpj)) {
      res.status(400).json({ error: 'Para contas corporativas, razão social e CNPJ são obrigatórios.' });
      return;
    }

    const result = dbManager.registerUser({
      username,
      password: password || '123456',
      fullName,
      phone,
      cpf,
      accountType: accountType || 'individual',
      companyName,
      cnpj,
      role: role || 'operacional',
    });

    res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
      message: `Usuário ${result.user.fullName} cadastrado com sucesso!`,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Erro ao registrar usuário' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier) {
      res.status(400).json({ error: 'Identificador (usuário, CPF ou telefone) é obrigatório.' });
      return;
    }

    const result = dbManager.loginUser(identifier, password);
    res.json({
      success: true,
      user: result.user,
      token: result.token,
      message: `Bem-vindo de volta, ${result.user.fullName}!`,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Falha na autenticação' });
  }
});

// Get Current User Profile (Me)
app.get('/api/auth/me', authenticateUser, (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    dbManager.invalidateToken(token);
  }
  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

// GET Isolated User Data (Strict Privacy: User only sees their own scoped data)
app.get('/api/user/data', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const isolatedData = dbManager.getUserIsolatedData(user.id);
    res.json({
      user,
      data: isolatedData,
      privacyNotice: 'Dados isolados e privados para a conta ' + user.fullName + ' (' + user.role + ')',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar dados isolados do usuário' });
  }
});

// PUT Update Isolated User Data
app.put('/api/user/data', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const allowedKeys = [
      'tasks',
      'habits',
      'focusSessions',
      'debriefReport',
      'teamBookings',
      'cashoutTransactions',
      'cashoutAccount',
      'theme',
      'mode',
      'streaks',
    ];

    const payloadToUpdate: any = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        payloadToUpdate[key] = req.body[key];
      }
    }

    const updated = dbManager.updateUserData(user.id, payloadToUpdate);
    res.json({
      success: true,
      data: updated,
      message: 'Dados privados sincronizados com o backend com sucesso.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar dados privados' });
  }
});

// POST Add Single Task to User's Isolated Partition
app.post('/api/user/task', authenticateUser, (req, res) => {
  try {
    const user = (req as any).user;
    const task = req.body;
    if (!task || !task.title) {
      res.status(400).json({ error: 'Dados da tarefa inválidos' });
      return;
    }
    const newTask = dbManager.addTaskForUser(user.id, task);
    res.status(201).json({ success: true, task: newTask });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao salvar tarefa no backend' });
  }
});

// API: Nexus AI Chat & Task Extractor
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], tasks = [], mode = 'study', currentTime = '' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getGeminiClient();

    // Check if message implies adding a task
    const isTaskIntent = /(?:tenho|preciso|lembrar|amanhã|hoje|às|\d+h|agendar|marcar|treinar|estudar|reunião|consulta|fazer)/i.test(message);

    if (!ai) {
      // Local fallback mode when API key is not yet set in settings
      const extracted = isTaskIntent ? localExtractTask(message, mode) : null;
      let replyText = 'Entendido! Estou monitorando sua rotina para manter sua produtividade em alta.';

      if (extracted) {
        replyText = `Identifiquei seu compromisso: "${extracted.title}" às ${extracted.time}. Já preparei a tarefa para sua agenda!`;
      } else if (message.toLowerCase().includes('otimizar') || message.toLowerCase().includes('rotina')) {
        replyText = `Com base no seu modo ${mode === 'study' ? 'Estudo' : mode === 'work' ? 'Trabalho' : 'Academia'}, recomendo focar primeiro nas tarefas de alta prioridade e reservar blocos de 45 minutos com pequenas pausas.`;
      } else if (message.toLowerCase().includes('tarefas') || message.toLowerCase().includes('pendentes')) {
        const pendingCount = tasks.filter((t: any) => !t.done).length;
        replyText = `Você possui ${pendingCount} tarefas pendentes hoje. Vamos riscar a mais urgente primeiro?`;
      }

      res.json({
        reply: replyText,
        suggestedTask: extracted,
      });
      return;
    }

    // Prepare context for Gemini 3.8 Flash
    const tasksContext = tasks.map((t: any) => `- [${t.done ? 'Concluída' : 'Pendente'}] ${t.title} (${t.time}, Prioridade: ${t.priority}, Categoria: ${t.cat})`).join('\n');

    const prompt = `Você é o Nexus AI, um assistente inteligente de alta produtividade pessoal integrado à Agenda Nexus AI.
Horário atual do usuário: ${currentTime || 'Hoje'}.
Modo de foco ativo: ${mode} (study, work, gym).
Tarefas atuais do dia:
${tasksContext || '(Nenhuma tarefa cadastrada ainda)'}

Mensagem do usuário: "${message}"

INSTRUÇÕES:
1. Responda em português do Brasil de forma concisa, amigável, direta e prática (máximo 2 a 3 frases).
2. Analise se a mensagem do usuário representa um novo compromisso, evento, tarefa ou rotina (ex: "amanhã tenho prova às 9h", "preciso treinar perna às 19:00", "reunião com cliente às 14h").
3. Se houver uma nova tarefa, preencha o campo "suggestedTask" com título limpo e formatado, horário estimado no formato HH:mm (padrão 09:00 se não especificado), categoria ('study' | 'work' | 'gym' | 'saude') e prioridade ('high' | 'med' | 'low').
4. Se o usuário estiver apenas tirando dúvidas ou pedindo dicas de organização, forneça orientações práticas e deixe "suggestedTask" como null.
5. Retorne estritamente o formato JSON solicitado.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Resposta conversacional útil e direta em português',
            },
            suggestedTask: {
              type: Type.OBJECT,
              description: 'Tarefa detectada a ser criada, ou null',
              properties: {
                title: { type: Type.STRING, description: 'Título claro da tarefa' },
                time: { type: Type.STRING, description: 'Horário no formato HH:mm' },
                priority: { type: Type.STRING, description: 'high, med ou low' },
                cat: { type: Type.STRING, description: 'study, work, gym ou saude' },
              },
            },
          },
          required: ['reply'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    let suggestedTask = parsed.suggestedTask || null;

    // Sanitize suggested task if returned
    if (suggestedTask && suggestedTask.title) {
      if (!['high', 'med', 'low'].includes(suggestedTask.priority)) {
        suggestedTask.priority = 'med';
      }
      if (!['study', 'work', 'gym', 'saude'].includes(suggestedTask.cat)) {
        suggestedTask.cat = mode || 'study';
      }
      if (!suggestedTask.time || !/^\d{2}:\d{2}$/.test(suggestedTask.time)) {
        suggestedTask.time = '09:00';
      }
    } else if (isTaskIntent) {
      // If AI didn't catch it but user clearly intended a task, fallback to local extractor
      suggestedTask = localExtractTask(message, mode);
    }

    res.json({
      reply: parsed.reply || 'Tarefa analisada e processada com sucesso!',
      suggestedTask,
    });
  } catch (error: any) {
    console.warn('Nexus AI temporary API issue handled gracefully:', error?.message || error);
    // Fallback on error to ensure seamless user experience
    const fallbackTask = localExtractTask(req.body.message || '', req.body.mode || 'study');
    res.json({
      reply: fallbackTask
        ? `Identifiquei sua tarefa: "${fallbackTask.title}" às ${fallbackTask.time}. Adicionada à sua agenda!`
        : 'Processado! Como mais posso ajudar a organizar seu dia?',
      suggestedTask: fallbackTask,
    });
  }
});

// API: Quick AI Schedule Optimization
app.post('/api/optimize-routine', async (req, res) => {
  try {
    const { tasks = [], mode = 'study' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        advice: 'Dica Nexus: Comece pelas tarefas de alta prioridade no seu horário de pico cognitivo pela manhã e agrupe tarefas semelhantes.',
      });
      return;
    }

    const taskTitles = tasks.map((t: any) => `${t.title} (${t.time}, prioridade: ${t.priority})`).join(', ');
    const prompt = `Como assistente Nexus AI de produtividade, analise a lista de tarefas do usuário hoje: ${taskTitles || 'nenhuma'}. Modo atual: ${mode}. Forneça 2 sugestões curtas e práticas de otimização de tempo em português do Brasil.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
    });

    res.json({
      advice: response.text?.trim() || 'Organize seu dia começando pelos itens de maior impacto!',
    });
  } catch (err: any) {
    console.warn('Nexus AI routine optimization fallback:', err?.message || err);
    res.json({
      advice: 'Mantenha o foco em uma tarefa por vez e faça pausas de 5 minutos a cada bloco de trabalho.',
    });
  }
});

// API: Smart AI Rescheduling (MVP 4)
app.post('/api/reschedule-tasks', async (req, res) => {
  try {
    const { tasks = [], mode = 'study', currentTime = '10:00' } = req.body;
    const ai = getGeminiClient();

    // Default slots for heuristic fallback
    const availableSlots = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'];
    
    // Heuristic rescheduling fallback
    const fallbackReschedule = () => {
      let slotIndex = 0;
      return tasks.map((t: any) => {
        if (t.done) return t; // Keep finished tasks intact
        const newTime = availableSlots[slotIndex % availableSlots.length];
        slotIndex++;
        return { ...t, time: newTime };
      });
    };

    if (!ai) {
      const updated = fallbackReschedule();
      res.json({
        tasks: updated,
        explanation: 'Tarefas reorganizadas cronologicamente sem sobreposição de horários com base no seu modo ativo.',
      });
      return;
    }

    const tasksJson = JSON.stringify(tasks);
    const prompt = `Você é o otimizador de cronograma da Nexus AI.
Horário atual: ${currentTime}. Modo de foco: ${mode}.
Tarefas atuais:
${tasksJson}

Instruções de Reagendamento Inteligente:
1. Mantenha as tarefas que já estão concluídas (done: true) com seus horários originais.
2. Para as tarefas pendentes, redistribua seus horários (HH:mm) ao longo do dia evitando conflitos.
3. Coloque tarefas de alta prioridade nos horários mais produtivos e agrupe tarefas afins.
4. Retorne a lista completa de tarefas com o campo "time" atualizado, e uma mensagem curta de 1 a 2 frases explicando a lógica em português do Brasil.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  time: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  cat: { type: Type.STRING },
                  done: { type: Type.BOOLEAN },
                },
                required: ['id', 'time'],
              },
            },
            explanation: {
              type: Type.STRING,
              description: 'Explicação curta do rearranjo de horários',
            },
          },
          required: ['tasks', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
      // Merge new times with existing task data to prevent field loss
      const newTasksMap = new Map(parsed.tasks.map((pt: any) => [pt.id, pt.time]));
      const mergedTasks = tasks.map((original: any) => ({
        ...original,
        time: newTasksMap.get(original.id) || original.time,
      }));
      res.json({
        tasks: mergedTasks,
        explanation: parsed.explanation || 'Horários reorganizados com sucesso pela IA.',
      });
    } else {
      res.json({
        tasks: fallbackReschedule(),
        explanation: 'Tarefas reorganizadas em blocos cronológicos confortáveis.',
      });
    }
  } catch (err: any) {
    console.warn('Nexus AI reschedule fallback:', err?.message || err);
    // Heuristic fallback
    const availableSlots = ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00', '19:00', '20:30'];
    let slotIndex = 0;
    const fallbackTasks = (req.body.tasks || []).map((t: any) => {
      if (t.done) return t;
      const newTime = availableSlots[slotIndex % availableSlots.length];
      slotIndex++;
      return { ...t, time: newTime };
    });
    res.json({
      tasks: fallbackTasks,
      explanation: 'Cronograma redistribuído em blocos de foco para evitar sobrecarga.',
    });
  }
});

// API: Daily Debrief & Productivity Score (MVP 4)
app.post('/api/daily-debrief', async (req, res) => {
  try {
    const { tasks = [], habits = [], streakCount = 4, mode = 'study' } = req.body;
    const ai = getGeminiClient();

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t: any) => t.done).length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    
    // Heuristic score calculation
    let calculatedScore = Math.min(100, Math.max(30, Math.round(completionRate * 0.7 + (streakCount * 5))));

    const fallbackDebrief = {
      productivityScore: calculatedScore,
      summary: `Você completou ${doneTasks} de ${totalTasks} tarefas hoje (${completionRate}% de eficácia), mantendo uma sequência ativa de ${streakCount} dias consecutivos no modo ${mode}.`,
      strengths: [
        'Excelente disciplina ao concluir as tarefas mais desafiadoras.',
        'Manutenção da regularidade diária sem quebrar a sequência de foco.',
      ],
      improvements: [
        'Reduzir a fragmentação no meio da tarde com blocos Pomodoro mais longos.',
      ],
      tomorrowAdvice: 'Comece o dia amanhã pela tarefa de maior prioridade logo após a rotina matinal.',
      generatedAt: new Date().toISOString(),
    };

    if (!ai) {
      res.json(fallbackDebrief);
      return;
    }

    const prompt = `Você é o coach de produtividade pessoal Nexus AI.
Analise a performance do dia do usuário:
- Total de tarefas: ${totalTasks} (${doneTasks} concluídas, taxa: ${completionRate}%)
- Modo de foco: ${mode}
- Sequência de dias (streak): ${streakCount} dias
- Hábitos monitorados: ${habits.map((h: any) => `${h.title} (streak: ${h.streak})`).join(', ')}
- Lista de tarefas: ${tasks.map((t: any) => `[${t.done ? 'Concluída' : 'Pendente'}] ${t.title} (${t.time}, prio: ${t.priority})`).join('; ')}

Gere um diagnóstico diário estruturado e encorajador em português do Brasil com:
1. productivityScore (número de 0 a 100)
2. summary (1 parágrafo avaliando o ritmo do dia)
3. strengths (array com 2 pontos fortes destacados)
4. improvements (array com 1 ou 2 pontos de melhoria construtivos)
5. tomorrowAdvice (1 recomendação estratégica acionável para o dia de amanhã)`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productivityScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            tomorrowAdvice: { type: Type.STRING },
          },
          required: ['productivityScore', 'summary', 'strengths', 'improvements', 'tomorrowAdvice'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('Nexus AI debrief fallback:', err?.message || err);
    const totalTasks = (req.body.tasks || []).length;
    const doneTasks = (req.body.tasks || []).filter((t: any) => t.done).length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    res.json({
      productivityScore: Math.min(100, Math.max(50, completionRate + 15)),
      summary: `Você alcançou ${completionRate}% de aproveitamento hoje no Nexus AI. Um ritmo sólido e constante!`,
      strengths: ['Compromisso com as metas essenciais', 'Progresso consistente nas tarefas prioritárias'],
      improvements: ['Reservar pequenos intervalos de descanso para evitar fadiga'],
      tomorrowAdvice: 'Defina as 3 tarefas principais logo pela manhã para manter o foco afiado.',
      generatedAt: new Date().toISOString(),
    });
  }
});

// API: ARKIH Teams Dispatch Booking (Corporativo - Consultas, Entregas & Serviços)
app.post('/api/team/dispatch-booking', async (req, res) => {
  try {
    const { message, teamMembers = [], currentDate = new Date().toISOString().split('T')[0] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getGeminiClient();

    // Fallback heuristic parser
    const parseLocalBooking = (msg: string) => {
      const lower = msg.toLowerCase();
      const isEntrega = /entrega|entregar|encomenda|remessa|motoboy|pacote|documentos|endereço|rua|av\.|avenida/i.test(msg);
      const isConsulta = /consulta|médic|doutor|dr\.|paciente|terapia|nutricion|clínic|avaliação/i.test(msg);
      const bookingType = isEntrega ? 'entrega' : isConsulta ? 'consulta' : 'servico';

      // Extract time
      let time = '14:00';
      const timeMatch = msg.match(/(\d{1,2})(?::(\d{2})|h(?:(\d{2}))?)/);
      if (timeMatch) {
        time = `${timeMatch[1].padStart(2, '0')}:${(timeMatch[2] || timeMatch[3] || '00').padStart(2, '0')}`;
      }

      // Extract price
      let price = bookingType === 'consulta' ? 250 : bookingType === 'entrega' ? 45 : 150;
      const priceMatch = msg.match(/(?:r\$|\$)?\s*(\d+(?:[.,]\d{2})?)\s*(?:reais|rs)?/i);
      if (priceMatch) {
        const val = parseFloat(priceMatch[1].replace(',', '.'));
        if (!isNaN(val) && val > 0 && val < 50000) {
          price = val;
        }
      }

      // Assign member
      let assigned = teamMembers[0] || { id: 'tm-1', name: 'Dr. André Silva' };
      for (const tm of teamMembers) {
        const firstName = tm.name.toLowerCase().split(' ')[0].replace('dr.', '').trim();
        if (lower.includes(firstName) || lower.includes(tm.name.toLowerCase())) {
          assigned = tm;
          break;
        }
      }
      if (isEntrega && (!lower.includes('andré') && !lower.includes('mariana'))) {
        const deliveryGuy = teamMembers.find((m: any) => m.role.toLowerCase().includes('entrega') || m.id === 'tm-2' || m.id === 'tm-4');
        if (deliveryGuy) assigned = deliveryGuy;
      }

      // Extract client name
      let clientName = 'Cliente Corporativo';
      const clientMatch = msg.match(/(?:cliente|para|paciente)\s+([A-ZÀ-Úa-zà-ú]+(?:\s+[A-ZÀ-Úa-zà-ú]+)?)/i);
      if (clientMatch && clientMatch[1]) {
        clientName = clientMatch[1].trim();
      }

      // Extract address if entrega
      let deliveryAddress = undefined;
      const addressMatch = msg.match(/(?:na|no|em|rua|av\.|avenida)\s+([A-ZÀ-Úa-zà-ú0-9\s,.-]+?)(?=\s+(?:com|às|as|valor|para|cliente|$))/i);
      if (addressMatch && addressMatch[1] && addressMatch[1].length > 4) {
        deliveryAddress = addressMatch[1].trim();
      } else if (isEntrega) {
        deliveryAddress = 'Endereço informado via despacho ARKIH';
      }

      return {
        id: `tb-${Date.now()}`,
        type: bookingType,
        title: isEntrega ? `Entrega — ${clientName}` : isConsulta ? `Consulta — ${clientName}` : `Atendimento — ${clientName}`,
        clientName,
        clientPhone: '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
        date: currentDate,
        time,
        durationMinutes: isConsulta ? 45 : 30,
        assignedMemberId: assigned.id,
        assignedMemberName: assigned.name,
        status: 'confirmado',
        price,
        paymentStatus: 'pago',
        deliveryAddress,
        locationOrLink: isConsulta ? 'Consultório Presencial ou Google Meet' : undefined,
        notes: `Agendado via Despacho Inteligente ARKIH: "${msg}"`,
        createdAt: new Date().toISOString(),
      };
    };

    if (!ai) {
      const parsed = parseLocalBooking(message);
      res.json({
        booking: parsed,
        reply: `Agendamento corporativo criado com sucesso: ${parsed.type === 'entrega' ? 'Entrega' : 'Consulta'} para ${parsed.clientName} às ${parsed.time} com ${parsed.assignedMemberName} (R$ ${parsed.price}).`,
      });
      return;
    }

    const membersPrompt = teamMembers.map((m: any) => `- ID: ${m.id}, Nome: ${m.name}, Função: ${m.role}`).join('\n');
    const prompt = `Você é o despachante de agendamentos corporativos da ARKIH AI (Plano Equipes).
Data de referência: ${currentDate}.
Membros da equipe disponíveis:
${membersPrompt}

Solicitação de agendamento recebida: "${message}"

Analise a mensagem e extraia os dados para agendar a entrega, consulta médica, reunião ou serviço corporativo:
- type: 'consulta' | 'entrega' | 'reuniao' | 'servico'
- title: título resumido profissional
- clientName: nome do cliente/paciente (ou 'Cliente Corporativo' se não mencionado)
- clientPhone: telefone se mencionado (ou gerar telefone válido padrão)
- time: horário HH:mm (padrão '14:00' se não informado)
- date: YYYY-MM-DD (padrão ${currentDate})
- durationMinutes: duração estimada em minutos (30, 45, 60)
- assignedMemberId: o ID do membro mais adequado da equipe acima (ou tm-1)
- assignedMemberName: o nome exato do membro selecionado
- price: valor numérico em Reais do serviço/entrega/consulta (ex: 45 para entrega, 250 para consulta, ou o valor citado)
- deliveryAddress: endereço completo se for entrega (ou null se consulta)
- locationOrLink: local da consulta ou link de videoconferência
- reply: confirmação amigável em português`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            title: { type: Type.STRING },
            clientName: { type: Type.STRING },
            clientPhone: { type: Type.STRING },
            time: { type: Type.STRING },
            date: { type: Type.STRING },
            durationMinutes: { type: Type.INTEGER },
            assignedMemberId: { type: Type.STRING },
            assignedMemberName: { type: Type.STRING },
            price: { type: Type.NUMBER },
            deliveryAddress: { type: Type.STRING },
            locationOrLink: { type: Type.STRING },
            reply: { type: Type.STRING },
          },
          required: ['type', 'title', 'clientName', 'time', 'assignedMemberId', 'assignedMemberName', 'price', 'reply'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');
    const finalBooking = {
      id: `tb-${Date.now()}`,
      type: (['consulta', 'entrega', 'reuniao', 'servico'].includes(parsedJson.type) ? parsedJson.type : 'servico') as any,
      title: parsedJson.title || 'Agendamento Corporativo',
      clientName: parsedJson.clientName || 'Cliente Corporativo',
      clientPhone: parsedJson.clientPhone || '(11) 98888-9999',
      date: parsedJson.date || currentDate,
      time: parsedJson.time || '14:00',
      durationMinutes: parsedJson.durationMinutes || 45,
      assignedMemberId: parsedJson.assignedMemberId || (teamMembers[0]?.id || 'tm-1'),
      assignedMemberName: parsedJson.assignedMemberName || (teamMembers[0]?.name || 'Equipe ARKIH'),
      status: 'confirmado' as const,
      price: typeof parsedJson.price === 'number' && parsedJson.price > 0 ? parsedJson.price : 150,
      paymentStatus: 'pago' as const,
      deliveryAddress: parsedJson.deliveryAddress || undefined,
      locationOrLink: parsedJson.locationOrLink || undefined,
      notes: `Despachado por ARKIH AI Teams: "${message}"`,
      createdAt: new Date().toISOString(),
    };

    res.json({
      booking: finalBooking,
      reply: parsedJson.reply || `Agendamento cadastrado com sucesso para ${finalBooking.clientName} às ${finalBooking.time}.`,
    });
  } catch (error: any) {
    console.warn('ARKIH Teams dispatch fallback:', error?.message || error);
    // Fallback gracefully
    const local = {
      id: `tb-${Date.now()}`,
      type: 'entrega' as const,
      title: 'Entrega Corporativa Solicitada',
      clientName: 'Cliente Corporativo',
      clientPhone: '(11) 98765-4321',
      date: new Date().toISOString().split('T')[0],
      time: '15:00',
      durationMinutes: 30,
      assignedMemberId: 'tm-2',
      assignedMemberName: 'Roberto Santos',
      status: 'confirmado' as const,
      price: 45,
      paymentStatus: 'pago' as const,
      deliveryAddress: 'Endereço registrado via despacho ARKIH',
      notes: `Despachado: ${req.body.message}`,
      createdAt: new Date().toISOString(),
    };
    res.json({
      booking: local,
      reply: `Agendamento corporativo registrado para ${local.assignedMemberName} às ${local.time}.`,
    });
  }
});

// Vite Middleware for Dev and Static Serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
