import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  CalendarCheck,
  Plus,
  Loader2,
  Lightbulb,
  CheckCircle2,
  Clock,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage, Mode, Task, Priority, Category } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onAddTaskDirectly: (task: {
    title: string;
    time: string;
    priority: Priority;
    cat: Category;
  }) => void;
  isLoading: boolean;
  currentMode: Mode;
  tasks: Task[];
}

const QUICK_PROMPTS = [
  'Amanhã tenho prova de Cálculo às 09:00',
  'Treino de perna e abdômen às 19:00',
  'Reunião de alinhamento do projeto às 14:30',
  'Consulta médica às 11:30',
  '⚡ Otimizar minha rotina de hoje',
  '🎯 Quais tarefas devo priorizar agora?',
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onAddTaskDirectly,
  isLoading,
  currentMode,
  tasks,
}) => {
  const [input, setInput] = useState('');
  const [addedTasksMap, setAddedTasksMap] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    onSendMessage(text);
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const handleConfirmTask = (msgId: string, taskData: any) => {
    onAddTaskDirectly(taskData);
    setAddedTasksMap((prev) => ({ ...prev, [msgId]: true }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Assistente ARKIH</h2>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60">
                Gemini 3.8 Flash
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pronto para organizar sua rotina e agendar tarefas em linguagem natural</span>
            </div>
          </div>
        </div>

        {currentMode && (
          <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
            Modo Foco: {currentMode === 'study' ? 'Estudo' : currentMode === 'work' ? 'Trabalho' : 'Academia'}
          </span>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-slate-50/30">
        {/* Intro Tip */}
        <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-xl p-3.5 text-xs text-indigo-950 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold text-indigo-900">Como funciona:</span> Digite compromissos naturalmente (ex: <i>"Sexta tenho dentista às 14h"</i> ou <i>"Treino de musculação hoje às 19h"</i>). O ARKIH extrai data, horário e categoria e prepara ou agenda automaticamente para você!
          </div>
        </div>

        {(messages || []).map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-indigo-300" />}
            </div>

            {/* Bubble */}
            <div className="flex flex-col gap-2">
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Detected Task Confirmation Card */}
                {msg.suggestedTask && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
                        Tarefa Detectada
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          msg.suggestedTask.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : msg.suggestedTask.priority === 'med'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        Prioridade {msg.suggestedTask.priority}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-900">
                      {msg.suggestedTask.title}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {msg.suggestedTask.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {msg.suggestedTask.cat}
                      </span>
                    </div>

                    {addedTasksMap[msg.id] ? (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Adicionado à sua agenda com sucesso!</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmTask(msg.id, msg.suggestedTask)}
                        className="mt-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar à agenda agora</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center text-xs text-slate-500 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
            <span>Nexus AI está analisando sua rotina...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Sugestões:
        </span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handlePromptClick(prompt)}
            disabled={isLoading}
            className="text-[11px] font-medium bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            id="chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ex: "Amanhã tenho dentista às 14h" ou "Como organizar meus estudos hoje?"'
            disabled={isLoading}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
          />
          <button
            type="submit"
            id="chat-send-btn"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
