import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Phone,
  Building2,
  FileText,
  Shield,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { UserAccount, UserRole, AccountType } from '../types';
import { ROLE_DETAILS, formatCPF, formatCNPJ, formatPhone, getRoleDetail } from '../lib/authRoles';
import { INITIAL_USERS } from '../lib/storage';
import { apiLogin, apiRegister } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  users?: UserAccount[];
  onLogin?: (user: UserAccount) => void;
  onRegister?: (newUser: UserAccount) => void;
  onLoginSuccess?: (user: UserAccount) => void;
  onRegisterSuccess?: (newUser: UserAccount) => void;
  initialMode?: 'login' | 'register' | 'demo';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users = [],
  onLogin,
  onRegister,
  onLoginSuccess,
  onRegisterSuccess,
  initialMode = 'login',
}) => {
  const safeUsers = Array.isArray(users) && users.length > 0 ? users : INITIAL_USERS;
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'demo'>(initialMode);

  const notifyLogin = (user: UserAccount) => {
    if (onLogin) onLogin(user);
    if (onLoginSuccess) onLoginSuccess(user);
  };

  const notifyRegister = (newUser: UserAccount) => {
    if (onRegister) onRegister(newUser);
    if (onRegisterSuccess) onRegisterSuccess(newUser);
  };

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [accountType, setAccountType] = useState<AccountType>('corporativo');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('diretoria');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanIdentifier = loginIdentifier.trim().toLowerCase();
    const cleanDigits = loginIdentifier.replace(/\D/g, '');

    if (!cleanIdentifier) {
      setLoginError('Informe seu nome de usuário, CPF ou telefone.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiLogin(cleanIdentifier, loginPassword || '123');
      notifyLogin(result.user);
      onClose();
    } catch (err: any) {
      // Local demo account fallback if server error
      const foundUser = safeUsers.find((u) => {
        const matchUsername = u.username.toLowerCase() === cleanIdentifier;
        const matchCpf = u.cpf.replace(/\D/g, '') === cleanDigits && cleanDigits.length >= 11;
        const matchPhone = u.phone.replace(/\D/g, '') === cleanDigits && cleanDigits.length >= 8;
        return matchUsername || matchCpf || matchPhone;
      });

      if (foundUser) {
        notifyLogin(foundUser);
        onClose();
      } else {
        setLoginError(err.message || 'Usuário não encontrado. Verifique os dados ou utilize o Acesso Rápido.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    // Validations
    if (!username.trim()) {
      setRegisterError('Defina um nome de usuário.');
      return;
    }
    if (!fullName.trim()) {
      setRegisterError('Informe seu nome completo.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setRegisterError('Informe um telefone válido com DDD (mínimo 10 dígitos).');
      return;
    }
    if (!cpf.trim() || cpf.replace(/\D/g, '').length < 11) {
      setRegisterError('Informe um CPF válido do usuário (11 dígitos).');
      return;
    }

    if (accountType === 'corporativo') {
      if (!companyName.trim()) {
        setRegisterError('Informe a Razão Social ou Nome Fantasia da Empresa.');
        return;
      }
      if (!cnpj.trim() || cnpj.replace(/\D/g, '').length < 14) {
        setRegisterError('Informe um CNPJ válido da empresa (14 dígitos).');
        return;
      }
    }

    if (!password) {
      setRegisterError('Crie uma senha de acesso.');
      return;
    }
    if (password.length < 4) {
      setRegisterError('A senha deve conter ao menos 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError('As senhas digitadas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRegister({
        username: username.trim().toLowerCase().replace(/\s+/g, '.'),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        cpf: cpf.trim(),
        accountType,
        companyName: accountType === 'corporativo' ? companyName.trim() : undefined,
        cnpj: accountType === 'corporativo' ? cnpj.trim() : undefined,
        role: selectedRole,
      });

      notifyRegister(result.user);
      notifyLogin(result.user);
      setRegisterSuccess(`Cadastro salvo no backend com sucesso! Bem-vindo(a), ${result.user.fullName}. Seus dados e rotinas estão isolados com total privacidade.`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setRegisterError(err.message || 'Erro ao realizar cadastro no backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoUser = async (user: UserAccount) => {
    setIsSubmitting(true);
    try {
      const result = await apiLogin(user.username, '123');
      notifyLogin(result.user);
    } catch {
      notifyLogin(user);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="auth-modal-container"
        className="bg-white border border-slate-200/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                ARKIH — Acesso & Cadastro
              </h3>
              <p className="text-[11px] text-slate-500">
                Plataforma com gestão de perfis corporativos e individuais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100/80 border-b border-slate-200/80 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegisterError('');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'demo'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Perfis Demo</span>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {currentUser && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {currentUser.roleTitle} • @{currentUser.username}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sessão Ativa
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome de Usuário, CPF ou Telefone
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Ex: carlos.mendes, 142.583... ou (11) 98123..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  *Para testes rápidos, qualquer senha é aceita com as contas pré-cadastradas.
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer"
              >
                <span>Acessar ARKIH</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Cadastre-se gratuitamente
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {registerError && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              {registerSuccess && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{registerSuccess}</span>
                </div>
              )}

              {/* Account Type Selector: Corporativo vs Individual */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Modalidade da Conta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('corporativo')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      accountType === 'corporativo'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <div className="text-left">
                      <div>Corporativo / Equipes</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Empresas, Clínicas e Frotas
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('individual')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      accountType === 'individual'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4 shrink-0" />
                    <div className="text-left">
                      <div>Individual / Pessoal</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Profissionais Autônomos
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dados Corporativos (Condicional) */}
              {accountType === 'corporativo' && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5 animate-in fade-in">
                  <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dados da Empresa (Corporativo)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        CNPJ da Empresa *
                      </label>
                      <input
                        type="text"
                        value={cnpj}
                        onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                        placeholder="00.000.000/0001-00"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                        maxLength={18}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Razão Social / Nome da Empresa *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Alfa Logística & Saúde Ltda"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dados do Usuário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome de Usuário (Login) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-mono">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'))}
                      placeholder="usuario.gestao"
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Telefone (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF do Usuário *
                  </label>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                      maxLength={14}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SELEÇÃO DE FUNÇÃO DO USUÁRIO (Nomes refinados) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Função / Nível de Acesso no Sistema *
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(['diretoria', 'coordenacao', 'operacional'] as UserRole[]).map((roleKey) => {
                    const role = ROLE_DETAILS[roleKey];
                    const isSelected = selectedRole === roleKey;
                    return (
                      <div
                        key={roleKey}
                        onClick={() => setSelectedRole(roleKey)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="userRole"
                            checked={isSelected}
                            onChange={() => setSelectedRole(roleKey)}
                            className="mt-0.5 text-indigo-600"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{role.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {role.description}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${role.badgeClass}`}>
                          {role.badgeLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Senhas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Senha de Acesso *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-600 bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer mt-2"
              >
                <span>Concluir Cadastro & Iniciar Sessão</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: DEMO ROLES (Acesso Rápido) */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Acesso Rápido com Níveis Pré-Configurados:</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Alterne instantaneamente entre os 3 perfis corporativos para testar as permissões de cada função no ecossistema ARKIH.
                </p>
              </div>

              <div className="space-y-2">
                {safeUsers.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const roleDetail = getRoleDetail(user.role);
                  return (
                    <div
                      key={user.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {user.fullName}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${roleDetail.badgeClass}`}>
                              {roleDetail.badgeLabel}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 truncate font-medium">
                            {user.roleTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            CPF: {user.cpf} • Tel: {user.phone}
                            {user.cnpj ? ` • CNPJ: ${user.cnpj}` : ''}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoUser(user)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isCurrent ? 'Ativo' : 'Entrar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
