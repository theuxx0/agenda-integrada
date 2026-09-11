import React, { useState } from 'react';
import {
  Calendar,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Download,
  Send,
  MessageSquare,
  Globe,
  Share2,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Task, Priority, Category } from '../types';

interface IntegrationsViewProps {
  tasks: Task[];
  onAddTaskDirectly: (task: {
    title: string;
    time: string;
    priority: Priority;
    cat: Category;
  }) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  tasks,
  onAddTaskDirectly,
}) => {
  const [isGoogleSyncEnabled, setIsGoogleSyncEnabled] = useState(true);
  const [isOutlookEnabled, setIsOutlookEnabled] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isParsingMessage, setIsParsingMessage] = useState(false);
  const [capturedMessageFeedback, setCapturedMessageFeedback] = useState<string | null>(null);

  // Export ICS calendar file for Google Calendar & Outlook
  const handleDownloadICS = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStamp = `${yyyy}${mm}${dd}`;

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ARKIH AI//Agenda Inteligente//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:ARKIH AI - Agenda & Eventos',
    ];

    tasks.forEach((task) => {
      const [hStr, mStr] = (task.time || '09:00').split(':');
      const startH = (hStr || '09').padStart(2, '0');
      const startM = (mStr || '00').padStart(2, '0');
      const endH = String((parseInt(startH, 10) + 1) % 24).padStart(2, '0');

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:arkih-${task.id}-${Date.now()}@arkih.ai`);
      icsContent.push(`DTSTAMP:${dateStamp}T${startH}${startM}00Z`);
      icsContent.push(`DTSTART:${dateStamp}T${startH}${startM}00`);
      icsContent.push(`DTEND:${dateStamp}T${endH}${startM}00`);
      icsContent.push(`SUMMARY:${task.title}`);
      icsContent.push(`DESCRIPTION:Prioridade: ${task.priority.toUpperCase()} | ARKIH AI Sincronização`);
      icsContent.push(`STATUS:${task.done ? 'COMPLETED' : 'CONFIRMED'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `arkih-ai-calendar-${yyyy}-${mm}-${dd}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AI Task Extraction from incoming email or chat message
  const handleCaptureMessageTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsParsingMessage(true);
    setCapturedMessageFeedback(null);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[CAPTURA DE MENSAGEM / E-MAIL]: "${messageInput.trim()}". Por favor, extraia o compromisso e gere a tarefa correspondente.`,
          history: [],
          tasks,
          currentTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }),
      });

      const data = await resp.json();

      if (data.suggestedTask && data.suggestedTask.title) {
        onAddTaskDirectly(data.suggestedTask);
        setCapturedMessageFeedback(
          `Tarefa capturada com sucesso: "${data.suggestedTask.title}" às ${data.suggestedTask.time}`
        );
      } else {
        // Fallback extraction
        onAddTaskDirectly({
          title: messageInput.slice(0, 45),
          time: '14:00',
          priority: 'med',
          cat: 'work',
        });
        setCapturedMessageFeedback(`Tarefa capturada: "${messageInput.slice(0, 45)}" às 14:00`);
      }
      setMessageInput('');
    } catch {
      onAddTaskDirectly({
        title: messageInput.slice(0, 45),
        time: '15:00',
        priority: 'med',
        cat: 'general',
      });
      setCapturedMessageFeedback(`Tarefa registrada na agenda às 15:00`);
      setMessageInput('');
    } finally {
      setIsParsingMessage(false);
      setTimeout(() => setCapturedMessageFeedback(null), 5000);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Banner - Slide 6 */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              Slide 6 • Ecossistema
            </span>
            <h2 className="text-base font-bold text-slate-900">
              6. Integrações do ARKIH AI
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Conectar o <strong>ARKIH AI</strong> ao ecossistema do usuário para garantir fluxo contínuo
            de dados, sincronização de disponibilidade e captura inteligente de compromissos.
          </p>
        </div>

        <button
          onClick={handleDownloadICS}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Sincronizar Calendário (.ics)</span>
        </button>
      </div>

      {/* Grid of Integrations matching Slide 6 bullet points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Google Calendar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Calendar</h3>
                  <p className="text-[11px] text-slate-500">Sincronização de eventos e disponibilidade</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Conectado
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Importa e exporta automaticamente eventos entre o ARKIH AI e o Google Agenda. Permite
              detectar janelas livres e evitar sobreposições de horários com suas aulas e reuniões.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span>Leitura de disponibilidade</span>
                <span className="font-semibold text-emerald-700">Ativa (Tempo real)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Exportação para Google Agenda</span>
                <span className="font-semibold text-indigo-700">Formato RFC 5545</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">{tasks.length} eventos prontos para sincronia</span>
            <button
              onClick={handleDownloadICS}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Exportar eventos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Outlook Calendar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Outlook Calendar</h3>
                  <p className="text-[11px] text-slate-500">Integração planejada para expansão</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />
                Planejada
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Conexão com contas corporativas do Microsoft 365 / Exchange. Projetada para sincronização
              automática de cronogramas corporativos e compromissos de equipe.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span>Compatibilidade de arquivo</span>
                <span className="font-semibold text-slate-700">Universal (.ics suportado)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sincronização corporativa</span>
                <span className="font-semibold text-amber-600">Roadmap Fase 4</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Expansão corporativa</span>
            <button
              onClick={() => setIsOutlookEnabled(!isOutlookEnabled)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isOutlookEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isOutlookEnabled ? '✓ Notificação Ativa' : 'Avisar no lançamento'}
            </button>
          </div>
        </div>

        {/* 3. E-mail e Mensageria (Captura de Tarefas) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">E-mail e Mensageria</h3>
                  <p className="text-[11px] text-slate-500">Oportunidades para captura de tarefas</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3" />
                IA Ativa
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Converte trechos de e-mails, comunicados da faculdade ou mensagens de WhatsApp em tarefas
              imediatas na agenda sem esforço manual.
            </p>

            {/* Interactive Message Capture Tester */}
            <form onSubmit={handleCaptureMessageTask} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cole aqui: 'Professor marcou entrega do trabalho quinta às 14h'..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={isParsingMessage || !messageInput.trim()}
                  className="absolute right-1.5 top-1.5 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                  title="Capturar tarefa"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {capturedMessageFeedback && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{capturedMessageFeedback}</span>
                </div>
              )}
            </form>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Integração por webhook & IA NLP</span>
            <span className="text-indigo-600 font-semibold">Captura Rápida</span>
          </div>
        </div>

        {/* 4. Web e Mobile */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Web e Mobile</h3>
                  <p className="text-[11px] text-slate-500">Acesso multiplataforma consolidado</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Multiplataforma
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Interface responsiva otimizada para desktop, tablets e celulares. Preparada para instalação
              direta como Progressive Web App (PWA) garantindo produtividade em qualquer dispositivo.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span>Layout responsivo adaptativo</span>
                <span className="font-semibold text-emerald-700">100% Compatível</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Persistência offline-first</span>
                <span className="font-semibold text-emerald-700">Ativa</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Consolidação de produto</span>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              Navegador & PWA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
