import React, { useState, useEffect } from 'react';
import {
  TabType,
  Mode,
  Task,
  ChatMessage,
  Priority,
  Category,
  Habit,
  FocusSession,
  DailyDebriefReport,
} from './types';
import {
  loadTasks,
  saveTasks,
  loadMode,
  saveMode,
  loadChat,
  saveChat,
  loadStreaks,
  saveStreaks,
  loadHabits,
  saveHabits,
  loadFocusSessions,
  saveFocusSessions,
  loadDebrief,
  saveDebrief,
} from './lib/storage';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { TimelineView } from './components/TimelineView';
import { HabitsView } from './components/HabitsView';
import { ChatView } from './components/ChatView';
import { AnalyticsView } from './components/AnalyticsView';
import { IntegrationsView } from './components/IntegrationsView';
import { RoadmapSaaSView } from './components/RoadmapSaaSView';
import { TaskModal } from './components/TaskModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [currentMode, setCurrentMode] = useState<Mode>(loadMode);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(loadChat);
  const [streaks, setStreaks] = useState<boolean[]>(loadStreaks);
  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(loadFocusSessions);
  const [debriefReport, setDebriefReport] = useState<DailyDebriefReport | null>(loadDebrief);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isGeneratingDebrief, setIsGeneratingDebrief] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveMode(currentMode);
  }, [currentMode]);

  useEffect(() => {
    saveChat(aiMessages);
  }, [aiMessages]);

  useEffect(() => {
    saveStreaks(streaks);
  }, [streaks]);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveFocusSessions(focusSessions);
  }, [focusSessions]);

  useEffect(() => {
    saveDebrief(debriefReport);
  }, [debriefReport]);

  const todayIndex = new Date().getDay(); // 0 is Dom, 1 is Seg...
  const streakCount = 4; // Consistent with prototype

  // Task Handlers
  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, done: !t.done };
          return updated;
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: {
    title: string;
    time: string;
    priority: Priority;
    cat: Category;
    notes?: string;
  }) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...taskData }
            : t
        )
      );
      setEditingTask(null);
    } else {
      const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
      const newTask: Task = {
        id: nextId,
        title: taskData.title,
        time: taskData.time,
        priority: taskData.priority,
        cat: taskData.cat,
        notes: taskData.notes,
        done: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
    }
  };

  const handleAddTaskDirectly = (taskData: {
    title: string;
    time: string;
    priority: Priority;
    cat: Category;
  }) => {
    const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const newTask: Task = {
      id: nextId,
      title: taskData.title,
      time: taskData.time,
      priority: taskData.priority,
      cat: taskData.cat,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // Habit Handlers (MVP 3)
  const handleToggleHabitDay = (habitId: string, dayIndex: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const hasDay = h.completedDays.includes(dayIndex);
          const newDays = hasDay
            ? h.completedDays.filter((d) => d !== dayIndex)
            : [...h.completedDays, dayIndex];
          const newStreak = hasDay ? Math.max(0, h.streak - 1) : h.streak + 1;
          return {
            ...h,
            completedDays: newDays,
            streak: newStreak,
          };
        }
        return h;
      })
    );
  };

  const handleAddHabit = (data: Omit<Habit, 'id' | 'completedDays' | 'streak'>) => {
    const newHabit: Habit = {
      id: 'h-' + Date.now(),
      title: data.title,
      cat: data.cat,
      targetDaysPerWeek: data.targetDaysPerWeek,
      completedDays: [],
      streak: 0,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  // Focus Session Handler (MVP 3)
  const handleSaveFocusSession = (session: FocusSession) => {
    setFocusSessions((prev) => [session, ...prev]);
    // If bound to a task, optionally check task as done
    if (session.taskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === session.taskId ? { ...t, done: true } : t))
      );
    }
  };

  // Smart Rescheduling with AI (MVP 4)
  const handleRescheduleTasks = async () => {
    setIsRescheduling(true);
    try {
      const resp = await fetch('/api/reschedule-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          mode: currentMode,
          currentTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }),
      });
      const data = await resp.json();
      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.warn('Fallback reschedule triggered', e);
    } finally {
      setIsRescheduling(false);
    }
  };

  // AI Daily Debrief & Productivity Score (MVP 4)
  const handleGenerateDebrief = async () => {
    setIsGeneratingDebrief(true);
    try {
      const resp = await fetch('/api/daily-debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          habits,
          streakCount,
          mode: currentMode,
        }),
      });
      const data = await resp.json();
      if (data && data.productivityScore !== undefined) {
        setDebriefReport(data);
      }
    } catch (e) {
      console.warn('Fallback debrief triggered', e);
    } finally {
      setIsGeneratingDebrief(false);
    }
  };

  // AI Message Handler (MVP 2 + MVP 4)
  const handleSendAIMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setIsAILoading(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: aiMessages.slice(-5).map((m) => ({ role: m.role, text: m.text })),
          tasks,
          mode: currentMode,
          currentTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }),
      });

      const data = await resp.json();

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: data.reply || 'Processado com sucesso!',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        suggestedTask: data.suggestedTask || undefined,
      };

      // If a task was detected, automatically add it to agenda
      if (data.suggestedTask && data.suggestedTask.title) {
        handleAddTaskDirectly(data.suggestedTask);
      }

      setAiMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Fallback local AI chat response', err);
      // Fallback local response
      const fallbackAiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: 'Registrado! Se precisar ajustar horários ou adicionar mais detalhes, basta me dizer.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentMode={currentMode}
        onToggleMode={setCurrentMode}
        streaks={streaks}
        streakCount={streakCount}
        todayIndex={todayIndex}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
        <TopBar
          currentTab={currentTab}
          currentMode={currentMode}
          onOpenNewTaskModal={handleOpenNewTaskModal}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onOpenNewTaskModal={handleOpenNewTaskModal}
              aiMessages={aiMessages}
              onSendAIMessage={handleSendAIMessage}
              isAILoading={isAILoading}
              streakCount={streakCount}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'tarefas' && (
            <TasksView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onOpenNewTaskModal={handleOpenNewTaskModal}
            />
          )}

          {currentTab === 'timeline' && (
            <TimelineView
              tasks={tasks}
              currentMode={currentMode}
              onToggleTask={handleToggleTask}
              onOpenNewTaskModal={handleOpenNewTaskModal}
              onRescheduleTasks={handleRescheduleTasks}
              isRescheduling={isRescheduling}
              onSaveFocusSession={handleSaveFocusSession}
            />
          )}

          {currentTab === 'habitos' && (
            <HabitsView
              habits={habits}
              onToggleHabitDay={handleToggleHabitDay}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
              currentMode={currentMode}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              messages={aiMessages}
              onSendMessage={handleSendAIMessage}
              onAddTaskDirectly={handleAddTaskDirectly}
              isLoading={isAILoading}
              currentMode={currentMode}
              tasks={tasks}
            />
          )}

          {currentTab === 'integracoes' && (
            <IntegrationsView
              tasks={tasks}
              onAddTaskDirectly={handleAddTaskDirectly}
            />
          )}

          {currentTab === 'analise' && (
            <AnalyticsView
              tasks={tasks}
              currentMode={currentMode}
              streakCount={streakCount}
              habits={habits}
              focusSessions={focusSessions}
              debriefReport={debriefReport}
              onGenerateDebrief={handleGenerateDebrief}
              isGeneratingDebrief={isGeneratingDebrief}
            />
          )}

          {currentTab === 'roadmap' && <RoadmapSaaSView />}
        </main>
      </div>

      {/* Modal for adding/editing task */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultCategory={currentMode || 'study'}
      />
    </div>
  );
}

