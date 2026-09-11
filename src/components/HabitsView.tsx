import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Check,
  Plus,
  Trash2,
  BookOpen,
  Briefcase,
  Dumbbell,
  HeartPulse,
  Award,
} from 'lucide-react';
import { Habit, Category, Mode } from '../types';

interface HabitsViewProps {
  habits: Habit[];
  onToggleHabitDay: (habitId: string, dayIndex: number) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDays' | 'streak'>) => void;
  onDeleteHabit: (habitId: string) => void;
  currentMode: Mode;
}

const WEEK_DAYS = [
  { short: 'Dom', full: 'Domingo', index: 0 },
  { short: 'Seg', full: 'Segunda-feira', index: 1 },
  { short: 'Ter', full: 'Terça-feira', index: 2 },
  { short: 'Qua', full: 'Quarta-feira', index: 3 },
  { short: 'Qui', full: 'Quinta-feira', index: 4 },
  { short: 'Sex', full: 'Sexta-feira', index: 5 },
  { short: 'Sáb', full: 'Sábado', index: 6 },
];

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onToggleHabitDay,
  onAddHabit,
  onDeleteHabit,
  currentMode,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Category>(currentMode || 'study');
  const [newTargetDays, setNewTargetDays] = useState(5);

  const todayIndex = new Date().getDay();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddHabit({
      title: newTitle.trim(),
      cat: newCategory,
      targetDaysPerWeek: newTargetDays,
    });
    setNewTitle('');
    setIsAdding(false);
  };

  const getCategoryMeta = (cat: Category) => {
    switch (cat) {
      case 'study':
        return { label: 'Estudo', icon: <BookOpen className="w-3.5 h-3.5 text-blue-600" />, badge: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'work':
        return { label: 'Trabalho', icon: <Briefcase className="w-3.5 h-3.5 text-emerald-600" />, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'gym':
        return { label: 'Academia', icon: <Dumbbell className="w-3.5 h-3.5 text-orange-600" />, badge: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'saude':
        return { label: 'Saúde', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-600" />, badge: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'Geral', icon: <Sparkles className="w-3.5 h-3.5 text-slate-600" />, badge: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Overall weekly stats
  const totalChecksNeeded = habits.reduce((acc, h) => acc + h.targetDaysPerWeek, 0);
  const totalChecksDone = habits.reduce((acc, h) => acc + h.completedDays.length, 0);
  const habitCompletionRate = totalChecksNeeded > 0 ? Math.round((totalChecksDone / totalChecksNeeded) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Cumprimento da Semana
          </div>
          <div className="text-2xl font-bold text-indigo-600">{habitCompletionRate}%</div>
          <div className="text-xs text-slate-500 mt-0.5">{totalChecksDone} de {totalChecksNeeded} metas cumpridas</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Hábitos Ativos
          </div>
          <div className="text-2xl font-bold text-slate-900">{habits.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">rotinas monitoradas</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Melhor Sequência
          </div>
          <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
            <span>{Math.max(...habits.map((h) => h.streak), 0)}</span>
            <span className="text-lg">🔥</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">dias consecutivos</div>
        </div>
      </div>

      {/* Main Habits Board */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Rastreador de Hábitos & Rotinas Recorrentes</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consistência diária para alcançar alta performance nos estudos, saúde e trabalho
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Hábito</span>
          </button>
        </div>

        {/* Add Habit Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-end gap-3"
          >
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Nome do hábito
              </label>
              <input
                type="text"
                placeholder="Ex: Meditação 10 min, Ler 1 capítulo..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-600"
                autoFocus
              />
            </div>

            <div className="w-full sm:w-36">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Categoria
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Category)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="study">Estudo</option>
                <option value="work">Trabalho</option>
                <option value="gym">Academia</option>
                <option value="saude">Saúde</option>
                <option value="general">Geral</option>
              </select>
            </div>

            <div className="w-full sm:w-28">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Meta semanal
              </label>
              <select
                value={newTargetDays}
                onChange={(e) => setNewTargetDays(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {d}x por semana
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Habits Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3 min-w-[180px]">Hábito & Foco</th>
                <th className="py-2.5 px-2 text-center min-w-[70px]">Meta</th>
                {WEEK_DAYS.map((day) => (
                  <th
                    key={day.index}
                    className={`py-2.5 px-2 text-center w-11 ${
                      day.index === todayIndex ? 'text-indigo-600 font-bold' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{day.short}</span>
                      {day.index === todayIndex && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="py-2.5 px-2 text-center min-w-[60px]">Streak</th>
                <th className="py-2.5 px-2 text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {habits.map((habit) => {
                const meta = getCategoryMeta(habit.cat);
                const isMetaReached = habit.completedDays.length >= habit.targetDaysPerWeek;

                return (
                  <tr key={habit.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="shrink-0">{meta.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{habit.title}</div>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium border ${meta.badge} mt-0.5`}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <div className="text-xs font-semibold text-slate-600">
                        <span className={isMetaReached ? 'text-emerald-600' : ''}>
                          {habit.completedDays.length}
                        </span>
                        <span className="text-slate-400">/{habit.targetDaysPerWeek}</span>
                      </div>
                      <div className="w-12 mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${isMetaReached ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{
                            width: `${Math.min(100, Math.round((habit.completedDays.length / habit.targetDaysPerWeek) * 100))}%`,
                          }}
                        />
                      </div>
                    </td>

                    {WEEK_DAYS.map((day) => {
                      const isDone = habit.completedDays.includes(day.index);
                      const isToday = day.index === todayIndex;

                      return (
                        <td key={day.index} className="py-3 px-2 text-center">
                          <button
                            onClick={() => onToggleHabitDay(habit.id, day.index)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : isToday
                                ? 'border-2 border-indigo-400/80 bg-indigo-50/30 hover:bg-indigo-100/50 text-indigo-400'
                                : 'border border-slate-200 hover:border-slate-300 text-transparent hover:text-slate-300'
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 stroke-[3] ${isDone ? 'block' : ''}`} />
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                        {habit.streak}
                        <Flame className="w-3 h-3 text-amber-500" />
                      </span>
                    </td>

                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => onDeleteHabit(habit.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Remover hábito"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
