import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Flame,
  PieChart,
  Sparkles,
  RefreshCw,
  BookOpen,
  Briefcase,
  Dumbbell,
  HeartPulse,
  Download,
  Copy,
  Check,
  Award,
  Zap,
  Calendar,
} from 'lucide-react';
import { Task, Category, Mode, Habit, FocusSession, DailyDebriefReport } from '../types';

interface AnalyticsViewProps {
  tasks: Task[];
  currentMode: Mode;
  streakCount: number;
  habits?: Habit[];
  focusSessions?: FocusSession[];
  debriefReport: DailyDebriefReport | null;
  onGenerateDebrief: () => Promise<void>;
  isGeneratingDebrief: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  currentMode,
  streakCount,
  habits = [],
  focusSessions = [],
  debriefReport,
  onGenerateDebrief,
  isGeneratingDebrief,
}) => {
  const [copiedReport, setCopiedReport] = useState(false);

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Breakdown by Category
  const byCategory: Record<Category, number> = {
    study: 0,
    work: 0,
    gym: 0,
    saude: 0,
    general: 0,
  };

  tasks.forEach((t) => {
    byCategory[t.cat] = (byCategory[t.cat] || 0) + 1;
  });

  const categoryConfig: Record<
    Category,
    { label: string; color: string; bg: string; icon: React.ReactNode }
  > = {
    study: {
      label: 'Estudo',
      color: 'bg-blue-600',
      bg: 'bg-blue-50 text-blue-700',
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    work: {
      label: 'Trabalho',
      color: 'bg-emerald-600',
      bg: 'bg-emerald-50 text-emerald-700',
      icon: <Briefcase className="w-3.5 h-3.5" />,
    },
    gym: {
      label: 'Academia',
      color: 'bg-orange-600',
      bg: 'bg-orange-50 text-orange-700',
      icon: <Dumbbell className="w-3.5 h-3.5" />,
    },
    saude: {
      label: 'Saúde',
      color: 'bg-rose-600',
      bg: 'bg-rose-50 text-rose-700',
      icon: <HeartPulse className="w-3.5 h-3.5" />,
    },
    general: {
      label: 'Geral',
      color: 'bg-slate-600',
      bg: 'bg-slate-50 text-slate-700',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
  };

  const maxCategoryCount = Math.max(...Object.values(byCategory), 1);

  // Breakdown by Priority
  const highPrio = tasks.filter((t) => t.priority === 'high').length;
  const medPrio = tasks.filter((t) => t.priority === 'med').length;
  const lowPrio = tasks.filter((t) => t.priority === 'low').length;

  // Total Focus Minutes from Pomodoro
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Generate .ICS File Download for Google Calendar / Apple Calendar
  const handleExportICS = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStamp = `${yyyy}${mm}${dd}`;

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nexus AI//Agenda Inteligente//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Agenda Nexus AI',
    ];

    tasks.forEach((task) => {
      const [hStr, mStr] = (task.time || '09:00').split(':');
      const startH = (hStr || '09').padStart(2, '0');
      const startM = (mStr || '00').padStart(2, '0');
      
      // Calculate end time +1 hour by default
      const endHNumber = (parseInt(startH, 10) + 1) % 24;
      const endH = String(endHNumber).padStart(2, '0');

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:nexus-${task.id}-${Date.now()}@nexusai.app`);
      icsContent.push(`DTSTAMP:${dateStamp}T${startH}${startM}00Z`);
      icsContent.push(`DTSTART:${dateStamp}T${startH}${startM}00`);
      icsContent.push(`DTEND:${dateStamp}T${endH}${startM}00`);
      icsContent.push(`SUMMARY:${task.title}`);
      icsContent.push(`DESCRIPTION:Prioridade: ${task.priority.toUpperCase()} | Categoria: ${task.cat} | Nexus AI Agenda`);
      icsContent.push(`STATUS:${task.done ? 'COMPLETED' : 'CONFIRMED'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `agenda-nexus-${yyyy}-${mm}-${dd}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Executive Markdown Report
  const handleCopyReport = () => {
    const reportText = `📋 *Nexus AI — Relatório Diário de Produtividade*
📅 Data: ${new Date().toLocaleDateString('pt-BR')}
🎯 Modo Ativo: ${currentMode ? currentMode.toUpperCase() : 'GERAL'}
🔥 Sequência: ${streakCount} dias seguidos

📊 *Métricas:*
• Concluídas: ${done} de ${total} tarefas (${completionRate}%)
• Minutos em Foco: ${totalFocusMinutes} min
• Hábitos Ativos: ${habits.length} monitorados

📝 *Tarefas:*
${(tasks || []).map((t) => `${t.done ? '✅' : '⏳'} [${t.time}] ${t.title} (${t.priority.toUpperCase()})`).join('\n')}

💡 *Diagnóstico Nexus AI:*
${debriefReport ? debriefReport.summary : 'Rotina em ritmo acelerado com foco nas prioridades essenciais.'}
`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    });
  };

  const productivityScore = debriefReport ? debriefReport.productivityScore : Math.min(100, Math.max(40, completionRate + (streakCount * 3)));

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Top Banner with Export Buttons */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Relatório Executivo & Diagnóstico (MVP 4)
            </h2>
            <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              Nexus Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Exporte sua agenda para o Google Calendar ou gere relatórios estruturados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportICS}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer shadow-xs"
            title="Baixar arquivo .ics para Google Calendar, Apple Calendar ou Outlook"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Exportar Calendário (.ics)</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            title="Copiar sumário executivo em formato texto/WhatsApp"
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Relatório</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Concluídas
          </div>
          <div className="text-2xl font-bold text-slate-900">{done}</div>
          <div className="text-xs text-slate-500 mt-0.5">de {total} hoje</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Taxa de conclusão
          </div>
          <div className="text-2xl font-bold text-indigo-600">{completionRate}%</div>
          <div className="text-xs text-slate-500 mt-0.5">eficiência do dia</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Minutos em Foco
          </div>
          <div className="text-2xl font-bold text-indigo-600 flex items-center gap-1">
            <span>{totalFocusMinutes}</span>
            <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{focusSessions.length} sessões Pomodoro</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Sequência
          </div>
          <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
            <span>{streakCount}</span>
            <span className="text-lg">🔥</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">dias seguidos</div>
        </div>
      </div>

      {/* AI Daily Debrief & Productivity Score (MVP 4 Highlight) */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white border border-indigo-900/50 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  Diagnóstico Diário de Produtividade (AI Debrief)
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30 font-semibold">
                  MVP 4
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Avaliação estruturada do seu ritmo e recomendações para o dia seguinte
              </p>
            </div>
          </div>

          <button
            onClick={onGenerateDebrief}
            disabled={isGeneratingDebrief}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-2 rounded-xl border border-indigo-400/30 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDebrief ? 'animate-spin' : ''}`} />
            <span>{isGeneratingDebrief ? 'Gerando Análise...' : 'Atualizar Diagnóstico com IA'}</span>
          </button>
        </div>

        {/* Score & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Score Gauge */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Score de Produtividade
            </div>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-700"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * productivityScore) / 100}
                  strokeLinecap="round"
                  className="text-indigo-400 transition-all duration-1000"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold tracking-tight">{productivityScore}</span>
                <span className="text-[10px] text-slate-400">de 100</span>
              </div>
            </div>
            <div className="text-xs text-indigo-300 font-medium mt-2">
              {productivityScore >= 80 ? 'Ritmo Excepcional 🌟' : productivityScore >= 60 ? 'Bom Desempenho 🚀' : 'Espaço para Otimizar 📈'}
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="md:col-span-2 flex flex-col justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                Sumário Executivo
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {debriefReport?.summary ||
                  `Você cumpriu ${done} tarefas hoje com dedicação especial ao foco em ${currentMode ? categoryConfig[currentMode]?.label : 'Geral'}. Sua consistência semanal se reflete na sequência ativa de ${streakCount} dias.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  Pontos Fortes
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  {(debriefReport?.strengths || [
                    'Alta aderência aos compromissos da manhã',
                    'Manutenção do foco nos objetivos essenciais',
                  ]).map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Plano para Amanhã
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {debriefReport?.tomorrowAdvice ||
                    'Inicie o dia focando na tarefa de maior impacto cognitivo logo na primeira hora.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Priority Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tarefas por categoria
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Distribuição</span>
            </div>

            <div className="flex flex-col gap-3">
              {(['study', 'work', 'gym', 'saude'] as Category[]).map((catKey) => {
                const count = byCategory[catKey] || 0;
                const percent = maxCategoryCount > 0 ? Math.round((count / maxCategoryCount) * 100) : 0;
                const meta = categoryConfig[catKey];

                return (
                  <div key={catKey} className="flex items-center gap-3 text-xs">
                    <div className="w-24 flex items-center gap-1.5 font-medium text-slate-700 shrink-0">
                      {meta.icon}
                      <span>{meta.label}</span>
                    </div>

                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${meta.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <span className="w-6 text-right font-semibold text-slate-600">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Foco predominante:</span>
            <span className="font-semibold text-slate-700">
              {currentMode ? categoryConfig[currentMode]?.label : 'Estudo & Trabalho'}
            </span>
          </div>
        </div>

        {/* Priority & Daily Progress */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Distribuição por prioridade
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">{total} total</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60 text-center">
                <div className="text-[10px] uppercase font-bold text-rose-700">Alta</div>
                <div className="text-xl font-bold text-rose-800 mt-0.5">{highPrio}</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-center">
                <div className="text-[10px] uppercase font-bold text-amber-700">Média</div>
                <div className="text-xl font-bold text-amber-800 mt-0.5">{medPrio}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-700">Baixa</div>
                <div className="text-xl font-bold text-emerald-800 mt-0.5">{lowPrio}</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Progresso geral do dia</span>
                <span className="font-semibold">{done} de {total} concluídas</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {completionRate >= 50
              ? '🎉 Excelente ritmo! Mais da metade do dia já está concluída.'
              : '⚡ Mantenha o ritmo para fechar o dia batendo as metas de estudo e saúde.'}
          </div>
        </div>
      </div>
    </div>
  );
};
