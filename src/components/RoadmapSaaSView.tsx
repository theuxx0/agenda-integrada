import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  ChevronRight,
  TrendingUp,
  Award,
  Target,
  Rocket,
} from 'lucide-react';
import { PlanType } from '../types';

export const RoadmapSaaSView: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');

  const roadmapPhases = [
    {
      phase: 'FASE 1',
      title: 'Fundação',
      items: 'Conta • agenda • tarefas • lembretes • dashboard',
      status: 'completed',
      statusLabel: 'Concluído',
      borderColor: 'border-l-indigo-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      phase: 'FASE 2',
      title: 'IA básica',
      items: 'Texto → tarefa • prioridades • sugestões • chatbot',
      status: 'completed',
      statusLabel: 'Concluído',
      borderColor: 'border-l-indigo-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      phase: 'FASE 3',
      title: 'Produtividade',
      items: 'Hábitos • rotinas • metas • análises',
      status: 'completed',
      statusLabel: 'Concluído',
      borderColor: 'border-l-indigo-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      phase: 'FASE 4',
      title: 'Integrações',
      items: 'Google Calendar • Outlook • notificações',
      status: 'active',
      statusLabel: 'Em Execução',
      borderColor: 'border-l-indigo-600',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      phase: 'FASE 5',
      title: 'SaaS',
      items: 'Web • mobile • equipes • planos e monetização',
      status: 'in_progress',
      statusLabel: 'Em Expansão',
      borderColor: 'border-l-emerald-500',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      phase: 'FASE 6',
      title: 'IA avançada',
      items: 'Planejamento automático • reorganização • personalização',
      status: 'active',
      statusLabel: 'Disponível',
      borderColor: 'border-l-amber-500',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* SECTION 1: Slide 9 - Roadmap de Desenvolvimento */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Slide 9
              </span>
              <h2 className="text-base font-bold text-slate-900">
                9. Roadmap de Desenvolvimento
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evolução incremental, validando valor antes de aumentar a complexidade.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fases 1 a 4 Validadas
            </span>
          </div>
        </div>

        {/* Timeline phases grid matching Slide 9 precisely */}
        <div className="mt-5 flex flex-col gap-3">
          {roadmapPhases.map((r, i) => (
            <div
              key={r.phase}
              className={`p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors border-l-4 ${r.borderColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-16 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200/60">
                    {r.phase}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{r.title}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {r.items}
                  </div>
                </div>
              </div>

              <div className="sm:ml-auto flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${r.badgeColor}`}>
                  {r.statusLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Slide 10 - Evolução para SaaS */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Planos & Recursos
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Planos de Assinatura & Níveis de Acesso
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Escolha a modalidade ideal para o seu perfil pessoal ou para a sua empresa.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Plano ativo na sessão: <span className="text-indigo-600 font-bold uppercase">{selectedPlan}</span>
          </div>
        </div>

        {/* 3 SaaS Tiers matching Slide 10 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Plano Gratuito */}
          <div
            onClick={() => setSelectedPlan('free')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedPlan === 'free'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-white shadow-xs'
                : 'border-slate-200/90 bg-slate-50/50 hover:bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">Plano gratuito</h3>
                {selectedPlan === 'free' && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Selecionado
                  </span>
                )}
              </div>

              <div className="text-xl font-extrabold text-slate-900 mb-2">
                R$ 0 <span className="text-xs font-normal text-slate-400">/ sempre</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Agenda, tarefas e recursos básicos com limites de uso.
              </p>

              <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Agenda & tarefas do dia</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Até 10 tarefas ativas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Chat IA com limites de uso</span>
                </div>
              </div>
            </div>

            <button
              className={`w-full mt-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPlan === 'free'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Plano Básico
            </button>
          </div>

          {/* 2. Plano Pro (Destacado) */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
              selectedPlan === 'pro'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 shadow-sm'
                : 'border-slate-200/90 bg-white hover:border-indigo-300'
            }`}
          >
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Mais Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Plano Pro</span>
                </h3>
              </div>

              <div className="text-xl font-extrabold text-slate-900 mb-2">
                R$ 29 <span className="text-xs font-normal text-slate-400">/ mês</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                IA ampliada, integrações, análises e automações avançadas.
              </p>

              <div className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>IA ilimitada (Gemini 2.5/Flash)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Google Calendar & Outlook (.ics)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Score diário & Debrief executivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Time-blocking & Pomodoro ilimitado</span>
                </div>
              </div>
            </div>

            <button
              className={`w-full mt-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPlan === 'pro'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Ativar Plano Pro
            </button>
          </div>

          {/* 3. Equipes */}
          <div
            onClick={() => setSelectedPlan('teams')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedPlan === 'teams'
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-white shadow-xs'
                : 'border-slate-200/90 bg-slate-50/50 hover:bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Equipes</span>
                </h3>
                {selectedPlan === 'teams' && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Selecionado
                  </span>
                )}
              </div>

              <div className="text-xl font-extrabold text-slate-900 mb-2">
                R$ 59 <span className="text-xs font-normal text-slate-400">/ usuário</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Compartilhamento, delegação e recursos colaborativos.
              </p>

              <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Delegação de tarefas entre membros</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Visão compartilhada de disponibilidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Relatórios executivos de equipe</span>
                </div>
              </div>
            </div>

            <button
              className={`w-full mt-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPlan === 'teams'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Falar com Vendas
            </button>
          </div>
        </div>

        {/* Slide 10 Strategic Mandates Banner */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Diretrizes Estratégicas do Produto (Slide 10)</span>
          </div>

          <ul className="text-xs text-slate-200 space-y-1.5 pl-1">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>
                <strong>Estratégia:</strong> validar retenção e valor no MVP antes de ampliar monetização.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>
                <strong>Meta:</strong> transformar o <strong>ARKIH</strong> em uma plataforma de produtividade pessoal e profissional.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
