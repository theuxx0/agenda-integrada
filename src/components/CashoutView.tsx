import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  DollarSign,
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  ChevronRight,
  Sparkles,
  X,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { CashoutTransaction, CashoutAccount, TeamBooking } from '../types';

interface CashoutViewProps {
  transactions: CashoutTransaction[];
  account: CashoutAccount;
  teamBookings: TeamBooking[];
  onAddCashout: (amount: number, pixKey: string, recipientName: string, bankName: string) => void;
  onUpdateAccount: (account: CashoutAccount) => void;
  onNavigateToTeams?: () => void;
}

export const CashoutView: React.FC<CashoutViewProps> = ({
  transactions,
  account,
  teamBookings,
  onAddCashout,
  onUpdateAccount,
  onNavigateToTeams,
}) => {
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CashoutTransaction | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Cashout Form
  const [cashoutAmount, setCashoutAmount] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Account Form
  const [editPixKeyType, setEditPixKeyType] = useState<CashoutAccount['pixKeyType']>(account.pixKeyType);
  const [editPixKey, setEditPixKey] = useState<string>(account.pixKey);
  const [editRecipientName, setEditRecipientName] = useState<string>(account.recipientName);
  const [editBankName, setEditBankName] = useState<string>(account.bankName);

  // Filter for transactions
  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');

  // Compute Balances
  // Inflows from concluded bookings or seed transactions
  const totalInflow = transactions
    .filter((t) => t.type === 'inflow_booking' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalCashedOut = transactions
    .filter((t) => t.type === 'outflow_cashout' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const availableBalance = Math.max(0, totalInflow - totalCashedOut);

  // Pending balance from bookings still scheduled or in route
  const pendingBalance = teamBookings
    .filter((b) => b.status === 'agendado' || b.status === 'confirmado' || b.status === 'em_rota')
    .reduce((acc, curr) => acc + curr.price, 0);

  const totalGrossRevenue = totalInflow + pendingBalance;

  // Filtered transactions
  const filteredTxs = transactions.filter((t) => {
    if (filterType === 'inflow') return t.type === 'inflow_booking';
    if (filterType === 'outflow') return t.type === 'outflow_cashout';
    return true;
  });

  const handleCashoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashoutAmount > availableBalance) {
      setErrorMessage(`O valor do saque não pode ser superior ao saldo disponível (R$ ${availableBalance.toFixed(2)}).`);
      return;
    }
    if (cashoutAmount < 10) {
      setErrorMessage('O valor mínimo para Cashout Pix é de R$ 10,00.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    setTimeout(() => {
      onAddCashout(cashoutAmount, account.pixKey, account.recipientName, account.bankName);
      setIsProcessing(false);
      setIsCashoutModalOpen(false);
      setCashoutAmount(Math.min(50, Math.max(10, availableBalance - cashoutAmount)));
    }, 900);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAccount({
      pixKeyType: editPixKeyType,
      pixKey: editPixKey,
      recipientName: editRecipientName,
      bankName: editBankName,
    });
    setIsAccountModalOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Módulo Financeiro ARKIH
              </span>
              <span className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Pix Instantâneo 24/7
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Cashout & Gestão Financeira Corporativa
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Receba valores de consultas médicas e entregas realizadas pela equipe diretamente na sua carteira ARKIH e solicite saques via Pix com liquidação imediata e taxa zero.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-300" />
              Chave Pix Cadastrada
            </button>
            <button
              onClick={() => setIsCashoutModalOpen(true)}
              disabled={availableBalance < 10}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white transition-all cursor-pointer shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              Solicitar Cashout Pix
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Available for Cashout */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 opacity-90">
            <span className="text-xs font-semibold">Disponível para Saque</span>
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            R$ {availableBalance.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-100">
            <span>Transferência Pix imediata</span>
            <span className="font-bold">Taxa R$ 0,00</span>
          </div>
        </div>

        {/* Pending Inflow */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-xs font-medium">A Liberar (Em Andamento)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            R$ {pendingBalance.toFixed(2)}
          </div>
          <span className="text-[11px] text-amber-600 font-medium block mt-1">
            Liberado ao concluir entregas/consultas
          </span>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-xs font-medium">Faturamento Bruto</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            R$ {totalGrossRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Total gerado por serviços da equipe
          </span>
        </div>

        {/* Total Cashed Out */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <span className="text-xs font-medium">Total de Saques (Cashout)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            R$ {totalCashedOut.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            100% transferido via Pix
          </span>
        </div>
      </div>

      {/* Main Content: Transactions & Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Extrato Financeiro & Histórico de Cashouts
                </h3>
                <p className="text-xs text-slate-500">
                  Entradas de serviços corporativos e saques efetuados
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterType('all')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('inflow')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === 'inflow'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Entradas (+)
                </button>
                <button
                  onClick={() => setFilterType('outflow')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    filterType === 'outflow'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cashouts (-)
                </button>
              </div>
            </div>

            {/* List */}
            {filteredTxs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhuma transação encontrada para este filtro.
              </div>
            ) : (
              <div className="space-y-2.5">
                {(filteredTxs || []).map((tx) => {
                  const isInflow = tx.type === 'inflow_booking';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => tx.receiptId && setSelectedReceipt(tx)}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-white transition-all gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isInflow
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {isInflow ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {tx.description}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{tx.date}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">
                              {isInflow ? 'Recebimento de Serviço' : 'Cashout Pix Processado'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`text-xs font-bold ${
                            isInflow ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isInflow ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                        </div>
                        {tx.receiptId ? (
                          <span className="text-[10px] text-indigo-600 font-medium hover:underline block">
                            Ver Recibo Pix
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block">Liquidado</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Account Info & SaaS Plan (1 col) */}
        <div className="space-y-4">
          {/* Pix Account Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                Conta de Destino Pix
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Alterar
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Favorecido</span>
                <span className="text-xs font-bold text-slate-800">{account.recipientName}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Instituição Bancária</span>
                <span className="text-xs font-medium text-slate-700">{account.bankName}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Chave Pix ({account.pixKeyType.toUpperCase()})
                </span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono text-slate-800 truncate">{account.pixKey}</span>
                  <button
                    onClick={() => copyToClipboard(account.pixKey)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer shrink-0"
                    title="Copiar Chave"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-800">
                Protegido por criptografia ponta a ponta e integração com o Sistema de Pagamentos Instantâneos (SPI / Bacen).
              </p>
            </div>
          </div>

          {/* Corporate Subscription Card */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                Plano Corporativo / Equipes
              </span>
              <span className="text-xs font-bold text-slate-900">R$ 199,00 / mês</span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900">Status da Assinatura: Ativo</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inclui despacho inteligente com IA, portal do cliente, agendamentos ilimitados e taxa zero em saques.
              </p>
            </div>

            <div className="pt-2 border-t border-indigo-100/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Próxima renovação: 13/10/2026</span>
              <span className="text-indigo-600 font-semibold text-[11px]">Faturamento em dia</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Solicitar Cashout Pix */}
      {isCashoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                Solicitar Cashout Pix Instantâneo
              </h3>
              <button
                onClick={() => setIsCashoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCashoutSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Saldo Disponível para Saque
                </label>
                <div className="text-lg font-extrabold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                  R$ {availableBalance.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Valor do Saque (R$)
                </label>
                <input
                  type="number"
                  min="10"
                  max={availableBalance}
                  step="5"
                  required
                  value={cashoutAmount}
                  onChange={(e) => setCashoutAmount(Number(e.target.value))}
                  className="w-full text-base font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500"
                />

                {/* Quick Select Buttons */}
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setCashoutAmount(Math.min(50, availableBalance))}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    R$ 50
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashoutAmount(Math.min(100, availableBalance))}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    R$ 100
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashoutAmount(Math.min(200, availableBalance))}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    R$ 200
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashoutAmount(availableBalance)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                  >
                    Todo o Saldo
                  </button>
                </div>
              </div>

              {/* Destination Summary */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Destino:</span>
                  <span className="font-semibold text-slate-800">{account.recipientName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Chave Pix:</span>
                  <span className="font-mono text-slate-800">{account.pixKey}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Banco:</span>
                  <span className="text-slate-800">{account.bankName}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium pt-1 border-t border-slate-200/60">
                  <span>Taxa de transferência:</span>
                  <span>Grátis (Plano Equipes)</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCashoutModalOpen(false)}
                  className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || cashoutAmount <= 0 || cashoutAmount > availableBalance}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processando Pix...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Confirmar Saque R$ {cashoutAmount.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Editar Dados da Conta Pix */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                Configurar Chave Pix para Cashout
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Chave Pix</label>
                <select
                  value={editPixKeyType}
                  onChange={(e) => setEditPixKeyType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="email">E-mail</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="phone">Telefone / Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Chave Pix</label>
                <input
                  type="text"
                  required
                  value={editPixKey}
                  onChange={(e) => setEditPixKey(e.target.value)}
                  placeholder="Ex: seu-email@empresa.com ou CPF"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Nome Completo do Titular / Razão Social</label>
                <input
                  type="text"
                  required
                  value={editRecipientName}
                  onChange={(e) => setEditRecipientName(e.target.value)}
                  placeholder="Nome do favorecido no banco"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Banco / Instituição</label>
                <input
                  type="text"
                  required
                  value={editBankName}
                  onChange={(e) => setEditBankName(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Bradesco, Inter"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                >
                  Salvar Dados Pix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Recibo Digital de Cashout Pix */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Comprovante de Transferência Pix</h3>
              <p className="text-[11px] text-slate-400">ARKIH Pay • Sistema de Pagamentos Instantâneos</p>
            </div>

            <div className="border-t border-b border-dashed border-slate-200 py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Transferido:</span>
                <span className="font-extrabold text-slate-900">R$ {selectedReceipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data e Hora:</span>
                <span className="text-slate-700">{selectedReceipt.date} • Liquidado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destinatário:</span>
                <span className="font-medium text-slate-800">{account.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chave Pix:</span>
                <span className="font-mono text-slate-700 text-[11px]">{selectedReceipt.pixKey || account.pixKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instituição:</span>
                <span className="text-slate-700">{account.bankName}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Autenticação:</span>
                <span className="font-mono">{selectedReceipt.receiptId}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full text-xs font-semibold py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              Fechar Comprovante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
