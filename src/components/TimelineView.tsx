import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Flame,
  Zap,
  Tag,
} from 'lucide-react';
import { Task, Mode, Category, FocusSession } from '../types';

interface TimelineViewProps {
  tasks: Task[];
  currentMode: Mode;
  onToggleTask: (id: number) => void;
  onOpenNewTaskModal: () => void;
  onRescheduleTasks: () => Promise<void>;
  isRescheduling: boolean;
  onSaveFocusSession: (session: FocusSession) => void;
}

const HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00',
];

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  currentMode,
  onToggleTask,
  onOpenNewTaskModal,
  onRescheduleTasks,
  isRescheduling,
  onSaveFocusSession,
}) => {
  // Focus / Pomodoro Timer State
  const [timerDuration, setTimerDuration] = useState<number>(25 * 60); // in seconds
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [timerPreset, setTimerPreset] = useState<'25' | '50' | '5'>('25');
  const [sessionSuccessMessage, setSessionSuccessMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set default selected task to first incomplete task
  useEffect(() => {
    if (selectedTaskId === null && tasks.length > 0) {
      const firstPending = tasks.find((t) => !t.done);
      if (firstPending) {
        setSelectedTaskId(firstPending.id);
      }
    }
  }, [tasks, selectedTaskId]);

  // Pomodoro countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerDuration]);

  const handleTimerComplete = () => {
    const minutes = Math.round(timerDuration / 60);
    const activeTask = tasks.find((t) => t.id === selectedTaskId);
    const newSession: FocusSession = {
      id: String(Date.now()),
      taskId: activeTask?.id,
      taskTitle: activeTask?.title || 'Sessão de Foco Geral',
      durationMinutes: minutes,
      completedAt: new Date().toISOString(),
    };
    onSaveFocusSession(newSession);
    setSessionSuccessMessage(`🎉 Parabéns! Sessão de ${minutes} min de foco registrada!`);
    setTimeout(() => setSessionSuccessMessage(null), 5000);
  };

  const handleSelectPreset = (preset: '25' | '50' | '5') => {
    setIsRunning(false);
    setTimerPreset(preset);
    const seconds = preset === '25' ? 25 * 60 : preset === '50' ? 50 * 60 : 5 * 60;
    setTimerDuration(seconds);
    setTimeLeft(seconds);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerDuration);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.round(((timerDuration - timeLeft) / timerDuration) * 100);

  // Map tasks to hour slots
  const getTasksForHour = (hourStr: string) => {
    const targetHour = parseInt(hourStr.split(':')[0], 10);
    return tasks.filter((t) => {
      const taskHour = parseInt(t.time.split(':')[0], 10);
      return taskHour === targetHour;
    });
  };

  const categoryColor: Record<Category, { bg: string; border: string; text: string; badge: string }> = {
    study: { bg: 'bg-blue-50/70', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
    work: { bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
    gym: { bg: 'bg-orange-50/70', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-800' },
    saude: { bg: 'bg-rose-50/70', border: 'border-rose-200', text: 'text-rose-900', badge: 'bg-rose-100 text-rose-800' },
    general: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', badge: 'bg-slate-100 text-slate-800' },
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      {/* Left Column: Interactive Time Blocking Grid */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header Actions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Blocos de Tempo Diários (Time-Blocking)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualize e gerencie a distribuição cronológica da sua rotina hoje
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRescheduleTasks}
              disabled={isRescheduling}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 transition-colors border border-indigo-200/60 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isRescheduling ? 'animate-spin' : ''}`} />
              <span>{isRescheduling ? 'Otimizando...' : 'Reorganizar com IA'}</span>
            </button>

            <button
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Bloco</span>
            </button>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs divide-y divide-slate-100">
          {HOURS.map((hourStr) => {
            const slotTasks = getTasksForHour(hourStr);
            const hasConflict = slotTasks.length > 1;

            return (
              <div key={hourStr} className="py-2.5 flex items-start gap-4 group hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                {/* Hour Label */}
                <div className="w-14 shrink-0 text-xs font-semibold text-slate-400 pt-1 flex items-center justify-between">
                  <span>{hourStr}</span>
                </div>

                {/* Slot Content */}
                <div className="flex-1 min-h-[44px] flex flex-col gap-2">
                  {slotTasks.length === 0 ? (
                    <div
                      onClick={onOpenNewTaskModal}
                      className="h-9 border border-dashed border-slate-200/70 rounded-xl flex items-center px-3 text-xs text-slate-400 opacity-40 hover:opacity-100 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer"
                    >
                      <span>+ Espaço livre — clique para agendar</span>
                    </div>
                  ) : (
                    (slotTasks || []).map((task) => {
                      const color = categoryColor[task.cat] || categoryColor.general;
                      return (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-xl border ${color.bg} ${color.border} flex items-center justify-between gap-3 shadow-xs transition-all`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => onToggleTask(task.id)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                            >
                              {task.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <div
                                className={`text-xs font-semibold truncate ${
                                  task.done ? 'line-through text-slate-400' : color.text
                                }`}
                              >
                                {task.title}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{task.time}</span>
                                <span>•</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${color.badge}`}>
                                  {task.cat}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {hasConflict && (
                              <span
                                title="Conflito de horário detectado"
                                className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium"
                              >
                                <AlertCircle className="w-3 h-3" /> Conflito
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                handleSelectPreset('25');
                              }}
                              title="Iniciar foco nesta tarefa"
                              className="text-slate-400 hover:text-indigo-600 hover:bg-white p-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Integrated Focus Pomodoro Widget */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Timer de Foco & Pomodoro
            </span>
            <span className="text-[11px] bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-200 border border-indigo-700/40">
              MVP 3
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="w-full grid grid-cols-3 gap-1.5 p-1 bg-slate-800/80 rounded-xl mb-6">
            <button
              onClick={() => handleSelectPreset('25')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timerPreset === '25'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              25m Foco
            </button>
            <button
              onClick={() => handleSelectPreset('50')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timerPreset === '50'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              50m Imersão
            </button>
            <button
              onClick={() => handleSelectPreset('5')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timerPreset === '5'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              5m Pausa
            </button>
          </div>

          {/* Circular Countdown Display */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-indigo-400 transition-all duration-1000"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold tracking-tight font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 uppercase font-semibold">
                {isRunning ? 'Em andamento' : 'Pausado'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isRunning ? 'Pausar' : 'Iniciar Foco'}</span>
            </button>

            <button
              onClick={handleResetTimer}
              title="Reiniciar timer"
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Active Task Selector */}
          <div className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-left">
            <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Tarefa vinculada:</span>
              {selectedTask && (
                <span className="text-indigo-300 font-normal truncate max-w-[120px]">
                  {selectedTask.time}
                </span>
              )}
            </div>

            <select
              value={selectedTaskId || ''}
              onChange={(e) => setSelectedTaskId(Number(e.target.value) || null)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Foco geral sem tarefa específica</option>
              {(tasks || [])
                .filter((t) => !t.done)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.time} - {t.title}
                  </option>
                ))}
            </select>
          </div>

          {sessionSuccessMessage && (
            <div className="w-full mt-3 p-2.5 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-[11px] text-emerald-200 text-center animate-fade-in">
              {sessionSuccessMessage}
            </div>
          )}
        </div>

        {/* Focus Tip Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Regra dos 50 minutos
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Estudos de neurociência comprovam que intercalar blocos de 50 minutos de concentração plena com pausas curtas de 10 minutos previne a fadiga mental e mantém a retenção alta ao longo do dia.
          </p>
        </div>
      </div>
    </div>
  );
};
