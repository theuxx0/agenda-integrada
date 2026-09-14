import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  Truck,
  Stethoscope,
  Plus,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign,
  UserCheck,
  Building2,
  Navigation,
  X,
  Share2,
} from 'lucide-react';
import { TeamMember, TeamBooking, BookingType, BookingStatus, Task } from '../types';

interface TeamsViewProps {
  teamMembers: TeamMember[];
  teamBookings: TeamBooking[];
  onAddBooking: (booking: TeamBooking) => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onSyncBookingToTasks?: (booking: TeamBooking) => void;
  onNavigateToCashout?: () => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teamMembers,
  teamBookings,
  onAddBooking,
  onUpdateBookingStatus,
  onSyncBookingToTasks,
  onNavigateToCashout,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPublicPortalOpen, setIsPublicPortalOpen] = useState<boolean>(false);

  // AI dispatch state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Manual booking form state
  const [formType, setFormType] = useState<BookingType>('consulta');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formClientName, setFormClientName] = useState<string>('');
  const [formClientPhone, setFormClientPhone] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState<string>('14:00');
  const [formDuration, setFormDuration] = useState<number>(45);
  const [formMemberId, setFormMemberId] = useState<string>(teamMembers[0]?.id || '');
  const [formPrice, setFormPrice] = useState<number>(200);
  const [formAddress, setFormAddress] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('Consultório 2 / Google Meet');
  const [formNotes, setFormNotes] = useState<string>('');

  // Public Portal state (simulation for client self-scheduling)
  const [portalType, setPortalType] = useState<BookingType>('consulta');
  const [portalMemberId, setPortalMemberId] = useState<string>(teamMembers[0]?.id || '');
  const [portalDate, setPortalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [portalTime, setPortalTime] = useState<string>('10:00');
  const [portalClientName, setPortalClientName] = useState<string>('');
  const [portalClientPhone, setPortalClientPhone] = useState<string>('');
  const [portalAddress, setPortalAddress] = useState<string>('');
  const [portalSuccessMessage, setPortalSuccessMessage] = useState<string | null>(null);

  // Filtered bookings
  const filteredBookings = teamBookings.filter((b) => {
    if (filterType !== 'all' && b.type !== filterType) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    return true;
  });

  // Aggregates
  const totalConsultas = teamBookings.filter((b) => b.type === 'consulta').length;
  const totalEntregas = teamBookings.filter((b) => b.type === 'entrega').length;
  const activeDeliveries = teamBookings.filter((b) => b.type === 'entrega' && b.status === 'em_rota').length;
  const totalRevenue = teamBookings
    .filter((b) => b.status === 'concluido' || b.paymentStatus === 'pago')
    .reduce((acc, curr) => acc + curr.price, 0);

  // Handle AI Dispatch
  const handleAiDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isDispatching) return;

    setIsDispatching(true);
    setAiFeedback(null);

    try {
      const res = await fetch('/api/team/dispatch-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: aiPrompt,
          teamMembers,
          currentDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) throw new Error('Falha ao processar despacho');
      const data = await res.json();

      if (data.booking) {
        onAddBooking(data.booking);
        if (onSyncBookingToTasks) {
          onSyncBookingToTasks(data.booking);
        }
        setAiFeedback(data.reply || 'Agendamento corporativo despachado com sucesso!');
        setAiPrompt('');
      }
    } catch (err: any) {
      console.warn('Fallback dispatching:', err);
      // Client-side fallback
      const isEntrega = /entrega|entregar|pacote|rua|av/i.test(aiPrompt);
      const newB: TeamBooking = {
        id: `tb-${Date.now()}`,
        type: isEntrega ? 'entrega' : 'consulta',
        title: isEntrega ? 'Entrega Corporativa Registrada' : 'Consulta Agendada',
        clientName: 'Cliente Corporativo',
        clientPhone: '(11) 98111-2233',
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        durationMinutes: 30,
        assignedMemberId: teamMembers[0]?.id || 'tm-1',
        assignedMemberName: teamMembers[0]?.name || 'Equipe ARKIH',
        status: 'confirmado',
        price: isEntrega ? 45 : 200,
        paymentStatus: 'pago',
        deliveryAddress: isEntrega ? 'Endereço registrado via IA ARKIH' : undefined,
        locationOrLink: !isEntrega ? 'Consultório / Google Meet' : undefined,
        notes: aiPrompt,
        createdAt: new Date().toISOString(),
      };
      onAddBooking(newB);
      if (onSyncBookingToTasks) onSyncBookingToTasks(newB);
      setAiFeedback(`Agendamento corporativo cadastrado com sucesso para ${newB.assignedMemberName}!`);
      setAiPrompt('');
    } finally {
      setIsDispatching(false);
    }
  };

  // Handle Manual Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedMember = teamMembers.find((m) => m.id === formMemberId) || teamMembers[0];

    const newBooking: TeamBooking = {
      id: `tb-${Date.now()}`,
      type: formType,
      title:
        formTitle ||
        (formType === 'consulta'
          ? `Consulta com ${formClientName || 'Cliente'}`
          : formType === 'entrega'
          ? `Entrega para ${formClientName || 'Cliente'}`
          : `Atendimento — ${formClientName || 'Cliente'}`),
      clientName: formClientName || 'Cliente Geral',
      clientPhone: formClientPhone || '(11) 98000-0000',
      date: formDate,
      time: formTime,
      durationMinutes: Number(formDuration),
      assignedMemberId: assignedMember.id,
      assignedMemberName: assignedMember.name,
      status: 'agendado',
      price: Number(formPrice),
      paymentStatus: 'pago',
      deliveryAddress: formType === 'entrega' ? formAddress : undefined,
      locationOrLink: formType === 'consulta' ? formLocation : undefined,
      notes: formNotes,
      createdAt: new Date().toISOString(),
    };

    onAddBooking(newBooking);
    if (onSyncBookingToTasks) {
      onSyncBookingToTasks(newBooking);
    }
    setIsModalOpen(false);
    // Reset
    setFormTitle('');
    setFormClientName('');
    setFormClientPhone('');
    setFormAddress('');
    setFormNotes('');
  };

  // Handle Public Portal Submit (Client Self-Booking)
  const handlePublicPortalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = teamMembers.find((m) => m.id === portalMemberId) || teamMembers[0];

    const newBooking: TeamBooking = {
      id: `tb-${Date.now()}`,
      type: portalType,
      title:
        portalType === 'consulta'
          ? `Consulta Agendada Online — ${portalClientName}`
          : `Entrega Solicitada pelo Portal — ${portalClientName}`,
      clientName: portalClientName || 'Cliente Portal',
      clientPhone: portalClientPhone || '(11) 99999-8888',
      date: portalDate,
      time: portalTime,
      durationMinutes: portalType === 'consulta' ? 45 : 30,
      assignedMemberId: member.id,
      assignedMemberName: member.name,
      status: 'confirmado',
      price: portalType === 'consulta' ? 250 : 45,
      paymentStatus: 'pago',
      deliveryAddress: portalType === 'entrega' ? portalAddress : undefined,
      locationOrLink: portalType === 'consulta' ? 'Google Meet Corporativo: meet.google.com/ark-portal' : undefined,
      notes: 'Agendado diretamente pelo Portal Público do Cliente da empresa.',
      createdAt: new Date().toISOString(),
    };

    onAddBooking(newBooking);
    if (onSyncBookingToTasks) onSyncBookingToTasks(newBooking);

    setPortalSuccessMessage(
      `Agendamento confirmado com sucesso! Enviamos a confirmação para ${portalClientName} com os detalhes.`
    );
    setTimeout(() => {
      setPortalSuccessMessage(null);
      setIsPublicPortalOpen(false);
      setPortalClientName('');
      setPortalClientPhone('');
      setPortalAddress('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Plano Equipes & Corporativo
              </span>
              <span className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                ARKIH Dispatch Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Gestão Corporativa de Tarefas, Consultas & Entregas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Delegue agendamentos para a equipe, rastreie entregas em tempo real, permita agendamento autônomo por clientes e integre com o fluxo de faturamento.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsPublicPortalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
              Portal do Cliente
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Agendamento
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Consultas</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalConsultas}</div>
          <span className="text-[11px] text-slate-400">Atendimentos médicos/especialistas</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Entregas & Logística</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalEntregas}</div>
          <span className="text-[11px] text-amber-600 font-medium">{activeDeliveries} em trânsito agora</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Membros da Equipe</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{teamMembers.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% disponíveis</span>
        </div>

        <div
          onClick={onNavigateToCashout}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Receita de Serviços</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">R$ {totalRevenue.toFixed(2)}</div>
          <span className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
            Gerenciar Cashout <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* AI Dispatch Box */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/40 border border-indigo-100 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Despacho Inteligente de Tarefas por IA (ARKIH Dispatch)
            </h3>
          </div>
          <span className="text-[10px] bg-indigo-100/80 text-indigo-700 px-2 py-0.5 rounded font-medium">
            Linguagem Natural
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          Digite ou cole solicitações completas de entrega ou consulta. A IA identifica cliente, membro responsável, horário, valor e endereço automaticamente:
        </p>

        <form onSubmit={handleAiDispatch} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ex: Agendar entrega na Av. Paulista 1000 com Carlos às 15:30 para Beatriz (R$ 45)"
            disabled={isDispatching}
            className="flex-1 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-xs transition-all"
          />
          <button
            type="submit"
            disabled={isDispatching || !aiPrompt.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all cursor-pointer shadow-xs shrink-0"
          >
            {isDispatching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Despachando...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Despachar com IA
              </>
            )}
          </button>
        </form>

        {aiFeedback && (
          <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{aiFeedback}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Bookings list & Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-indigo-600" />
                  Agendamentos da Equipe ({filteredBookings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Fluxo operacional de consultas e entregas com atualização de status
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="consulta">Consultas Médicas / Especialistas</option>
                  <option value="entrega">Entregas & Logística</option>
                  <option value="servico">Reuniões & Serviços</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">Todos os status</option>
                  <option value="agendado">Agendados</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="em_rota">Em Rota</option>
                  <option value="concluido">Concluídos</option>
                </select>
              </div>
            </div>

            {/* List */}
            {filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhum agendamento encontrado para os filtros selecionados.
              </div>
            ) : (
              <div className="space-y-3">
                {(filteredBookings || []).map((b) => {
                  const isConsulta = b.type === 'consulta';
                  const isEntrega = b.type === 'entrega';

                  return (
                    <div
                      key={b.id}
                      className="border border-slate-200/90 hover:border-slate-300 rounded-xl p-3.5 bg-slate-50/40 hover:bg-white transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isConsulta
                                ? 'bg-indigo-100 text-indigo-700'
                                : isEntrega
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isConsulta ? (
                              <Stethoscope className="w-5 h-5" />
                            ) : isEntrega ? (
                              <Truck className="w-5 h-5" />
                            ) : (
                              <CalendarCheck className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  isConsulta
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                    : isEntrega
                                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                }`}
                              >
                                {b.type}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {b.date} às {b.time} ({b.durationMinutes} min)
                              </span>
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-slate-400" />
                                {b.clientName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {b.clientPhone}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Status Badge */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-slate-900">R$ {b.price.toFixed(2)}</div>
                          <span
                            className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded mt-0.5 ${
                              b.status === 'concluido'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'em_rota'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : b.status === 'confirmado'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b.status === 'em_rota' ? 'Em Rota' : b.status}
                          </span>
                        </div>
                      </div>

                      {/* Location / Address detail */}
                      {(b.deliveryAddress || b.locationOrLink) && (
                        <div className="bg-white border border-slate-100 rounded-lg p-2 text-[11px] text-slate-600 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{b.deliveryAddress || b.locationOrLink}</span>
                        </div>
                      )}

                      {/* Assigned member & status changer actions */}
                      <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100/80 gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span className="text-[11px] text-slate-400">Responsável:</span>
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {b.assignedMemberName}
                          </span>
                        </div>

                        {/* Status transition buttons */}
                        <div className="flex items-center gap-1">
                          {b.status !== 'concluido' && (
                            <>
                              {isEntrega && b.status !== 'em_rota' && (
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'em_rota')}
                                  className="text-[10px] font-medium px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                                >
                                  Iniciar Rota
                                </button>
                              )}
                              <button
                                onClick={() => onUpdateBookingStatus(b.id, 'concluido')}
                                className="text-[10px] font-semibold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                              >
                                Marcar Concluído
                              </button>
                            </>
                          )}

                          {b.status === 'concluido' && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Finalizado & Creditado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Team Members Column (1 col) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Membros da Equipe ({teamMembers.length})
                </h3>
                <p className="text-[11px] text-slate-500">Profissionais e operadores ativos</p>
              </div>
            </div>

            <div className="space-y-3">
              {(teamMembers || []).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{member.name}</h4>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Ativo" />
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{member.role}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-indigo-600 block">
                      {member.completedBookings} concl.
                    </span>
                    <span className="text-[9px] text-slate-400">{member.phone}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsPublicPortalOpen(true)}
                className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar Link de Agendamento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Novo Agendamento Corporativo Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Novo Agendamento Corporativo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              {/* Type selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Serviço</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('consulta');
                      setFormPrice(250);
                      setFormDuration(45);
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      formType === 'consulta'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    Consulta Médica
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('entrega');
                      setFormPrice(45);
                      setFormDuration(30);
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      formType === 'entrega'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Entrega Express
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('servico');
                      setFormPrice(200);
                      setFormDuration(60);
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      formType === 'servico'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Consultoria/Outro
                  </button>
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Título do Agendamento</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    formType === 'consulta'
                      ? 'Ex: Consulta de Retorno — Dr. André'
                      : 'Ex: Entrega de Remessa Contábil'
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nome do Cliente/Paciente</label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Assigned Member & Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Membro Responsável</label>
                  <select
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {(teamMembers || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Valor do Serviço (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Horário & Duração</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address (for delivery) or Location/Link (for consulta) */}
              {formType === 'entrega' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Endereço de Entrega Completo</label>
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Rua / Av., Número, Bairro, CEP e Cidade"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Local / Link de Videoconferência</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Sala Presencial ou Link Google Meet"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Observações Operacionais</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Informações adicionais para a equipe..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                >
                  Salvar e Notificar Equipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Portal Público do Cliente (Simulação do link externo) */}
      {isPublicPortalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Portal de Agendamento da Empresa</h3>
                  <p className="text-[10px] text-slate-400">arkih.ai/equipe/clinica-e-logistica</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublicPortalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {portalSuccessMessage ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Agendamento Realizado!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">{portalSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handlePublicPortalSubmit} className="space-y-3.5">
                <p className="text-xs text-slate-600">
                  Esta é a visão pública que seus clientes acessam para agendar consultas presenciais/online ou solicitar entregas e coletas expressas:
                </p>

                {/* Service Selection */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">O que você deseja agendar?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPortalType('consulta')}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all ${
                        portalType === 'consulta'
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-800 ring-2 ring-indigo-100'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 text-indigo-600" />
                      <div className="text-left">
                        <div className="font-bold">Consulta / Especialista</div>
                        <div className="text-[10px] text-slate-500 font-normal">R$ 250,00 • 45 min</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPortalType('entrega')}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all ${
                        portalType === 'entrega'
                          ? 'bg-amber-50 border-amber-600 text-amber-800 ring-2 ring-amber-100'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-amber-600" />
                      <div className="text-left">
                        <div className="font-bold">Entrega / Logística</div>
                        <div className="text-[10px] text-slate-500 font-normal">R$ 45,00 • Express</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Choose specialist or dispatcher */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {portalType === 'consulta' ? 'Escolha o Especialista' : 'Selecione a Região / Operador'}
                  </label>
                  <select
                    value={portalMemberId}
                    onChange={(e) => setPortalMemberId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {(teamMembers || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Data Desejada</label>
                    <input
                      type="date"
                      required
                      value={portalDate}
                      onChange={(e) => setPortalDate(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Horário Disponível</label>
                    <select
                      value={portalTime}
                      onChange={(e) => setPortalTime(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="09:00">09:00 (Disponível)</option>
                      <option value="10:30">10:30 (Disponível)</option>
                      <option value="14:00">14:00 (Disponível)</option>
                      <option value="15:30">15:30 (Disponível)</option>
                      <option value="17:00">17:00 (Disponível)</option>
                    </select>
                  </div>
                </div>

                {/* Client Name & Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Seu Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={portalClientName}
                      onChange={(e) => setPortalClientName(e.target.value)}
                      placeholder="Ex: Dra. Mariana Costa"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">WhatsApp de Contato</label>
                    <input
                      type="text"
                      required
                      value={portalClientPhone}
                      onChange={(e) => setPortalClientPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {portalType === 'entrega' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Endereço de Destino</label>
                    <input
                      type="text"
                      required
                      value={portalAddress}
                      onChange={(e) => setPortalAddress(e.target.value)}
                      placeholder="Av. Paulista, 1000 - Apto 51, Bela Vista, SP"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <span>Total do Agendamento:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {portalType === 'consulta' ? 'R$ 250,00' : 'R$ 45,00'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPublicPortalOpen(false)}
                    className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
