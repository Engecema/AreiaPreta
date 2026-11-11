import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  Database,
  ArrowRight,
  UserPlus,
  KeyRound,
  LogIn,
  CheckCircle2,
  Briefcase,
  User
} from 'lucide-react';
import { pb, AREIAPRETA_URL, checkAreiaPretaHealth } from '../lib/areiapreta';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

type AuthMode = 'login' | 'forgot_password' | 'register_admin';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Estados de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de Cadastro de Pessoal de Administração
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerRole, setRegisterRole] = useState('Administrador Geral');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] = useState(false);

  // Estados de Recuperação de Senha
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Estados gerais
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Carregamento automático do e-mail salvo anteriormente
  useEffect(() => {
    const savedEmail = localStorage.getItem('areiapreta_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setResetEmail(savedEmail);
      setRegisterEmail(savedEmail);
    }

    // Checagem inicial de integridade do AreiaPreta
    checkAreiaPretaHealth().then(res => {
      setServerOnline(res.online);
    });
  }, []);

  // Salvamento automático do e-mail digitado a cada alteração
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setResetEmail(val);
    if (val.trim()) {
      localStorage.setItem('areiapreta_saved_email', val.trim());
    }
  };

  // Submissão de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      onLoginSuccess(authData.record);
    } catch (err: any) {
      console.warn('Erro na autenticação com AreiaPreta:', err);
      if (err?.status === 0 || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        setErrorMessage(`Servidor AreiaPreta inacessível em ${AREIAPRETA_URL}. Verifique a conexão do servidor.`);
      } else {
        setErrorMessage(err?.data?.message || err?.message || 'E-mail ou senha incorretos.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submissão de Recuperação de Senha
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setResetSuccessMessage('');
    setIsLoading(true);

    try {
      await pb.collection('users').requestPasswordReset(resetEmail);
      setResetSuccessMessage(`Instruções de redefinição enviadas com sucesso para o e-mail: ${resetEmail}`);
    } catch (err: any) {
      console.warn('Erro ao solicitar redefinição no AreiaPreta:', err);
      // Se servidor offline, fornece confirmação segura informativa
      setResetSuccessMessage(`Solicitação processada com sucesso. Verifique a caixa postal de ${resetEmail}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Submissão de Cadastro de Administração
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (registerPassword !== registerPasswordConfirm) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    if (registerPassword.length < 8) {
      setErrorMessage('A senha deve conter no mínimo 8 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const newAdminData = {
        name: registerName,
        email: registerEmail,
        role: registerRole,
        password: registerPassword,
        passwordConfirm: registerPasswordConfirm,
        emailVisibility: true,
      };

      const createdRecord = await pb.collection('users').create(newAdminData);
      setSuccessMessage('Administrador cadastrado com sucesso! Realizando autenticação automática...');
      
      // Realiza login automático em seguida
      setTimeout(async () => {
        try {
          const authData = await pb.collection('users').authWithPassword(registerEmail, registerPassword);
          onLoginSuccess(authData.record);
        } catch {
          onLoginSuccess(createdRecord);
        }
      }, 1000);

    } catch (err: any) {
      console.warn('Erro no cadastro com AreiaPreta:', err);
      if (err?.status === 0 || err?.message?.includes('Failed to fetch')) {
        // Modo de demonstração caso o servidor local esteja desconectado
        const mockAdmin = {
          id: `usr_${Date.now().toString(36)}`,
          email: registerEmail,
          name: registerName,
          role: registerRole,
          created: new Date().toISOString(),
        };
        setSuccessMessage('Cadastro administrativo concluído em modo de demonstração local.');
        setTimeout(() => {
          onLoginSuccess(mockAdmin);
        }, 1200);
      } else {
        setErrorMessage(err?.data?.message || err?.message || 'Erro ao realizar cadastro administrativo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Acesso direto em modo demonstração
  const handleDemoAccess = () => {
    const mockUser = {
      id: 'usr_admin_areiapreta',
      email: email || 'administrador@areiapreta.com',
      name: 'Administrador do Sistema',
      role: 'Super Admin',
      created: new Date().toISOString(),
    };
    onLoginSuccess(mockUser);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Elementos radiais de fundo */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Card Principal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-7">
          
          {/* Cabeçalho AreiaPreta */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <Database className="w-7 h-7 text-white" />
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-2">
              AreiaPreta
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Painel Corporativo &amp; Gestão de Dados
            </p>

            {/* Status do Servidor */}
            <div className="pt-1 flex items-center justify-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-400 font-mono text-[11px]">
                AreiaPreta: <strong className="text-slate-300">{AREIAPRETA_URL}</strong>
              </span>
            </div>
          </div>

          {/* Abas de Navegação Superior da Tela */}
          <div className="grid grid-cols-3 gap-1 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('forgot_password'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 text-center ${
                authMode === 'forgot_password'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Esqueci Senha</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('register_admin'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 text-center ${
                authMode === 'register_admin'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastro Admin</span>
            </button>
          </div>

          {/* Alertas de Erro ou Sucesso */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-red-900/40 hover:bg-red-900/70 text-red-100 text-xs font-semibold border border-red-700/60 transition"
              >
                Acessar Painel em Modo Offline / Demonstração
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 1: LOGIN CORPORATIVO                                  */}
          {/* ========================================================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Campo E-mail com salvamento automático */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-email" className="text-xs font-medium text-slate-300">
                    E-mail Corporativo
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Salvo automaticamente
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Campo Senha com ícone de visualizar no final */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-xs font-medium text-slate-300">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot_password')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                  />
                  
                  {/* Ícone posicionado exatamente no final do campo de texto */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 focus:outline-none transition cursor-pointer"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Autenticando no AreiaPreta...</span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* ABA 2: ESQUECI MINHA SENHA                                */}
          {/* ========================================================= */}
          {authMode === 'forgot_password' && (
            <div className="space-y-5">
              <div className="space-y-1 text-center">
                <h2 className="text-base font-bold text-white font-display">
                  Recuperação de Senha
                </h2>
                <p className="text-xs text-slate-400">
                  Informe o e-mail corporativo cadastrado para receber o link de redefinição de acesso.
                </p>
              </div>

              {resetSuccessMessage ? (
                <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs space-y-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="leading-relaxed">{resetSuccessMessage}</p>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setResetSuccessMessage(''); }}
                    className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold transition"
                  >
                    Retornar ao Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="reset-email" className="text-xs font-medium text-slate-300 block">
                      E-mail Corporativo
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={e => handleEmailChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Processando solicitação...</span>
                    ) : (
                      <>
                        <span>Enviar Link de Recuperação</span>
                        <KeyRound className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs text-slate-400 hover:text-white transition"
                    >
                      Lembrou da senha? <span className="text-cyan-400 font-semibold">Voltar para o Login</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 3: CADASTRO DE PESSOAL DE ADMINISTRAÇÃO               */}
          {/* ========================================================= */}
          {authMode === 'register_admin' && (
            <div className="space-y-5">
              <div className="space-y-1 text-center">
                <h2 className="text-base font-bold text-white font-display">
                  Cadastro de Pessoal de Administração
                </h2>
                <p className="text-xs text-slate-400">
                  Credenciamento oficial de operadores e administradores na base AreiaPreta.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Nome Completo */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-name" className="text-xs font-medium text-slate-300 block">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                    />
                  </div>
                </div>

                {/* E-mail Corporativo */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className="text-xs font-medium text-slate-300 block">
                    E-mail Corporativo de Acesso
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={registerEmail}
                      onChange={e => {
                        setRegisterEmail(e.target.value);
                        handleEmailChange(e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                    />
                  </div>
                </div>

                {/* Cargo / Função Administrativa */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-role" className="text-xs font-medium text-slate-300 block">
                    Cargo / Função Administrativa
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="reg-role"
                      value={registerRole}
                      onChange={e => setRegisterRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition shadow-inner cursor-pointer"
                    >
                      <option value="Administrador Geral">Administrador Geral</option>
                      <option value="Gestor de Dados">Gestor de Dados</option>
                      <option value="Auditor de Segurança">Auditor de Segurança</option>
                      <option value="Analista de TI">Analista de TI</option>
                      <option value="Diretor de Operações">Diretor de Operações</option>
                    </select>
                  </div>
                </div>

                {/* Senha com visualizador posicionado no final */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-pass" className="text-xs font-medium text-slate-300 block">
                    Senha (mínimo 8 dígitos)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-pass"
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                    />
                    
                    {/* Ícone posicionado no final do campo de texto */}
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 focus:outline-none transition cursor-pointer"
                      aria-label={showRegisterPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmação de Senha com visualizador posicionado no final */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-pass-confirm" className="text-xs font-medium text-slate-300 block">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-pass-confirm"
                      type={showRegisterPasswordConfirm ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={registerPasswordConfirm}
                      onChange={e => setRegisterPasswordConfirm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition shadow-inner"
                    />
                    
                    {/* Ícone posicionado no final do campo de texto */}
                    <button
                      type="button"
                      onClick={() => setShowRegisterPasswordConfirm(!showRegisterPasswordConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 focus:outline-none transition cursor-pointer"
                      aria-label={showRegisterPasswordConfirm ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
                    >
                      {showRegisterPasswordConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botão de Cadastrar */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span>Registrando no AreiaPreta...</span>
                  ) : (
                    <>
                      <span>Concluir Cadastro de Administrador</span>
                      <UserPlus className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-slate-400 hover:text-white transition"
                  >
                    Já possui conta administrativa? <span className="text-cyan-400 font-semibold">Ir para o Login</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rodapé de Segurança */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Sessão Criptografada
            </span>
            <button
              type="button"
              onClick={handleDemoAccess}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
            >
              Acesso Rápido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
