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
  TeamMember,
  TeamBooking,
  CashoutTransaction,
  CashoutAccount,
  BookingStatus,
  ThemeId,
  UserAccount,
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
  loadTeamMembers,
  saveTeamMembers,
  loadTeamBookings,
  saveTeamBookings,
  loadCashoutTransactions,
  saveCashoutTransactions,
  loadCashoutAccount,
  saveCashoutAccount,
  loadTheme,
  saveTheme,
  loadUsers,
  saveUsers,
  loadCurrentUser,
  saveCurrentUser,
} from './lib/storage';
import {
  apiGetUsers,
  apiGetMe,
  apiGetUserData,
  apiSaveUserData,
  apiLogout,
} from './lib/api';
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
import { TeamsView } from './components/TeamsView';
import { CashoutView } from './components/CashoutView';
import { TaskModal } from './components/TaskModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(loadTheme);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [currentMode, setCurrentMode] = useState<Mode>(loadMode);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(loadChat);
  const [streaks, setStreaks] = useState<boolean[]>(loadStreaks);
  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(loadFocusSessions);
  const [debriefReport, setDebriefReport] = useState<DailyDebriefReport | null>(loadDebrief);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(loadTeamMembers);
  const [teamBookings, setTeamBookings] = useState<TeamBooking[]>(loadTeamBookings);
  const [cashoutTransactions, setCashoutTransactions] = useState<CashoutTransaction[]>(loadCashoutTransactions);
  const [cashoutAccount, setCashoutAccount] = useState<CashoutAccount>(loadCashoutAccount);
  const [users, setUsers] = useState<UserAccount[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(loadCurrentUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'demo'>('login');
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

  useEffect(() => {
    saveTeamMembers(teamMembers);
  }, [teamMembers]);

  useEffect(() => {
    saveTeamBookings(teamBookings);
  }, [teamBookings]);

  useEffect(() => {
    saveCashoutTransactions(cashoutTransactions);
  }, [cashoutTransactions]);

  useEffect(() => {
    saveCashoutAccount(cashoutAccount);
  }, [cashoutAccount]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  // Initial backend synchronization for registered users and active session
  useEffect(() => {
    let isMounted = true;

    async function syncWithBackend() {
      try {
        // Fetch all registered users from backend
        const serverUsers = await apiGetUsers();
        if (isMounted && serverUsers && serverUsers.length > 0) {
          setUsers(serverUsers);
        }

        // Check if user has an active session token
        const me = await apiGetMe();
        if (isMounted && me) {
          setCurrentUser(me);
          // Load this user's private isolated partition from the backend
          const scoped = await apiGetUserData();
          if (isMounted && scoped && scoped.data) {
            if (scoped.data.tasks) setTasks(scoped.data.tasks);
            if (scoped.data.habits) setHabits(scoped.data.habits);
            if (scoped.data.focusSessions) setFocusSessions(scoped.data.focusSessions);
            if (scoped.data.debriefReport !== undefined) setDebriefReport(scoped.data.debriefReport);
            if (scoped.data.teamBookings) setTeamBookings(scoped.data.teamBookings);
            if (scoped.data.cashoutTransactions) setCashoutTransactions(scoped.data.cashoutTransactions);
            if (scoped.data.cashoutAccount) setCashoutAccount(scoped.data.cashoutAccount);
            if (scoped.data.theme) setCurrentTheme(scoped.data.theme);
            if (scoped.data.mode) setCurrentMode(scoped.data.mode);
          }
        }
      } catch (err) {
        console.warn('Sync with backend notice:', err);
      }
    }

    syncWithBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced auto-save to backend whenever user's private data changes
  useEffect(() => {
    if (!currentUser) return;

    const timer = setTimeout(() => {
      apiSaveUserData({
        tasks,
        habits,
        focusSessions,
        debriefReport,
        teamBookings,
        cashoutTransactions,
        cashoutAccount,
        theme: currentTheme,
        mode: currentMode,
      }).catch((err) => console.warn('Falha no auto-save do backend:', err));
    }, 600);

    return () => clearTimeout(timer);
  }, [
    currentUser,
    tasks,
    habits,
    focusSessions,
    debriefReport,
    teamBookings,
    cashoutTransactions,
    cashoutAccount,
    currentTheme,
    currentMode,
  ]);

  const handleOpenAuthModal = (mode: 'login' | 'register' | 'demo' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = async (user: UserAccount) => {
    setCurrentUser(user);
    // Fetch this user's isolated data partition from backend to guarantee privacy
    try {
      const scoped = await apiGetUserData();
      if (scoped && scoped.data) {
        setTasks(scoped.data.tasks || []);
        setHabits(scoped.data.habits || []);
        setFocusSessions(scoped.data.focusSessions || []);
        setDebriefReport(scoped.data.debriefReport || null);
        setTeamBookings(scoped.data.teamBookings || []);
        setCashoutTransactions(scoped.data.cashoutTransactions || []);
        if (scoped.data.cashoutAccount) setCashoutAccount(scoped.data.cashoutAccount);
        if (scoped.data.theme) setCurrentTheme(scoped.data.theme);
        if (scoped.data.mode) setCurrentMode(scoped.data.mode);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados isolados do usuário:', err);
    }
  };

  const handleRegisterSuccess = async (newUser: UserAccount) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === newUser.id);
      return exists ? prev.map((u) => (u.id === newUser.id ? newUser : u)) : [...prev, newUser];
    });
    setCurrentUser(newUser);
    // Switch to new user's isolated partition
    try {
      const scoped = await apiGetUserData();
      if (scoped && scoped.data) {
        setTasks(scoped.data.tasks || []);
        setHabits(scoped.data.habits || []);
        setFocusSessions(scoped.data.focusSessions || []);
        setDebriefReport(scoped.data.debriefReport || null);
        setTeamBookings(scoped.data.teamBookings || []);
        setCashoutTransactions(scoped.data.cashoutTransactions || []);
        if (scoped.data.cashoutAccount) setCashoutAccount(scoped.data.cashoutAccount);
      }
    } catch (err) {
      console.warn('Erro ao carregar partição do novo usuário:', err);
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    handleOpenAuthModal('login');
  };

  useEffect(() => {
    saveTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme !== 'light-clean') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

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

  // Corporate Team & Booking Handlers
  const handleAddBooking = (booking: TeamBooking) => {
    setTeamBookings((prev) => [booking, ...prev]);
    // Also create a task in the agenda for the user / team schedule
    const isEntrega = booking.type === 'entrega';
    const isConsulta = booking.type === 'consulta';
    const newTask: Task = {
      id: Date.now(),
      title: isEntrega
        ? `[Entrega] ${booking.clientName} — ${booking.assignedMemberName}`
        : isConsulta
        ? `[Consulta] ${booking.clientName} — ${booking.assignedMemberName}`
        : `[Atendimento] ${booking.clientName} — ${booking.assignedMemberName}`,
      time: booking.time || '14:00',
      priority: 'high',
      cat: isConsulta ? 'saude' : 'work',
      done: booking.status === 'concluido',
      createdAt: new Date().toISOString(),
      notes: booking.deliveryAddress || booking.locationOrLink || booking.notes,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    setTeamBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, status };
          // If marked as concluded, automatically trigger inflow cashout transaction if not already registered!
          if (status === 'concluido') {
            setCashoutTransactions((prevTxs) => {
              const alreadyExists = prevTxs.some((tx) => tx.referenceId === b.id);
              if (alreadyExists) return prevTxs;
              const newInflow: CashoutTransaction = {
                id: `ctx-${Date.now()}`,
                type: 'inflow_booking',
                description: `Recebimento de ${b.type === 'consulta' ? 'Consulta' : 'Entrega'} — ${b.clientName}`,
                amount: b.price,
                date: new Date().toISOString().split('T')[0],
                status: 'concluido',
                referenceId: b.id,
              };
              return [newInflow, ...prevTxs];
            });
          }
          return updated;
        }
        return b;
      })
    );
  };

  const handleAddCashout = (
    amount: number,
    pixKey: string,
    recipientName: string,
    bankName: string
  ) => {
    const newTx: CashoutTransaction = {
      id: `ctx-${Date.now()}`,
      type: 'outflow_cashout',
      description: `Cashout Instantâneo via Pix para ${recipientName}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: 'concluido',
      pixKey,
      receiptId: `PIX-ARK-${Math.floor(10000 + Math.random() * 90000)}-2026`,
    };
    setCashoutTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateCashoutAccount = (newAccount: CashoutAccount) => {
    setCashoutAccount(newAccount);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentMode={currentMode}
        onToggleMode={setCurrentMode}
        currentTheme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        streaks={streaks}
        streakCount={streakCount}
        todayIndex={todayIndex}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
        <TopBar
          currentTab={currentTab}
          currentMode={currentMode}
          currentTheme={currentTheme}
          onOpenNewTaskModal={handleOpenNewTaskModal}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
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

          {currentTab === 'equipes' && (
            <TeamsView
              teamMembers={teamMembers}
              teamBookings={teamBookings}
              onAddBooking={handleAddBooking}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onNavigateToCashout={() => setCurrentTab('cashout')}
            />
          )}

          {currentTab === 'cashout' && (
            <CashoutView
              transactions={cashoutTransactions}
              account={cashoutAccount}
              teamBookings={teamBookings}
              onAddCashout={handleAddCashout}
              onUpdateAccount={handleUpdateCashoutAccount}
              onNavigateToTeams={() => setCurrentTab('equipes')}
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

      {/* Modal for Theme Palette */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(theme) => setCurrentTheme(theme)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentMode={currentMode}
        onToggleMode={setCurrentMode}
        currentTheme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        streaks={streaks}
        streakCount={streakCount}
        todayIndex={todayIndex}
        onOpenNewTaskModal={handleOpenNewTaskModal}
        pendingTasksCount={tasks.filter((t) => !t.done).length}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* Modal for Authentication & User Registration */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onLogin={handleLoginSuccess}
        onRegister={handleRegisterSuccess}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        initialMode={authInitialMode}
      />
    </div>
  );
}

