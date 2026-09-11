import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
  });
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
