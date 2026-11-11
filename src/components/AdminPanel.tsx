import React, { useState, useEffect } from 'react';
import { 
  Database, 
  LayoutDashboard, 
  FolderGit2, 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2, 
  Key, 
  Server,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { AREIAPRETA_URL, pb, checkAreiaPretaHealth, sanitizeText } from '../lib/areiapreta';
import { DatabaseStatus, CollectionItem, AdminTab } from '../types';

interface AdminPanelProps {
  currentUser: any;
  onLogout: () => void;
}

const INITIAL_RECORDS: CollectionItem[] = [
  {
    id: 'rec_sys_001',
    title: 'Configuração de Política de Acesso e CORS',
    category: 'Segurança',
    status: 'Ativo',
    author: 'Admin',
    updatedAt: 'Hoje às 10:14',
  },
  {
    id: 'rec_sys_002',
    title: 'Índices de Otimização da Base SQLite',
    category: 'Performance',
    status: 'Ativo',
    author: 'Sistema',
    updatedAt: 'Ontem às 18:30',
  },
  {
    id: 'rec_sys_003',
    title: 'Backup Automatizado de Dados (Snapshot)',
    category: 'Infraestrutura',
    status: 'Ativo',
    author: 'Admin',
    updatedAt: '09/11/2026',
  },
  {
    id: 'rec_sys_004',
    title: 'Webhook de Notificação de Novos Cadastros',
    category: 'Integrações',
    status: 'Pendente',
    author: 'Admin',
    updatedAt: '08/11/2026',
  },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    online: false,
    message: 'Verificando conexão...',
    lastChecked: 'Carregando...',
    url: AREIAPRETA_URL,
  });
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [records, setRecords] = useState<CollectionItem[]>(INITIAL_RECORDS);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Modal de novo registro
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Geral');

  const updateHealth = async () => {
    setIsCheckingHealth(true);
    const res = await checkAreiaPretaHealth();
    setDbStatus({
      online: res.online,
      message: res.message,
      latency: res.latency,
      lastChecked: new Date().toLocaleTimeString('pt-BR'),
      url: AREIAPRETA_URL,
    });
    setIsCheckingHealth(false);
  };

  useEffect(() => {
    updateHealth();
    const interval = setInterval(updateHealth, 30000); // Checagem periódica a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newTitle, 140);
    const cleanCategory = sanitizeText(newCategory, 40);
    if (!cleanTitle.trim()) return;

    const newRec: CollectionItem = {
      id: `rec_${Date.now().toString(36)}`,
      title: cleanTitle.trim(),
      category: cleanCategory || 'Geral',
      status: 'Ativo',
      author: sanitizeText(currentUser?.email?.split('@')[0] || 'Admin', 40),
      updatedAt: 'Agora',
    };

    setRecords([newRec, ...records]);
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleDeleteRecord = (id: string) => {
    const cleanId = sanitizeText(id, 40);
    if (window.confirm('Confirma a exclusão deste registro no AreiaPreta?')) {
      setRecords(records.filter(r => r.id !== cleanId));
    }
  };

  const safeFilter = sanitizeText(searchFilter, 60).toLowerCase();
  const filteredRecords = records.filter(r => 
    r.title.toLowerCase().includes(safeFilter) ||
    r.category.toLowerCase().includes(safeFilter)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">
      
      {/* 1. MENU LATERAL (SIDEBAR) */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo e Nome da Aplicação */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-md shadow-cyan-900/30">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white tracking-tight">
                  AreiaPreta
                </span>
                <span className="block text-[10px] text-cyan-400 font-mono">
                  AreiaPreta Admin
                </span>
              </div>
            </div>
          </div>

          {/* Indicador de Status da Conexão no Menu Lateral */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                AreiaPreta DB
              </span>
              <button
                onClick={updateHealth}
                disabled={isCheckingHealth}
                className="text-slate-400 hover:text-white p-1 rounded transition"
                title="Verificar integridade da conexão"
                aria-label="Atualizar status da conexão"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dbStatus.online ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'}`}></span>
              <span className="text-xs font-semibold text-white truncate">
                {dbStatus.online ? 'Conectado (Online)' : 'Aguardando Servidor'}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 font-mono truncate">
              {dbStatus.url}
            </div>

            {dbStatus.latency !== undefined && (
              <div className="text-[10px] text-emerald-400">
                Latência: {dbStatus.latency} ms
              </div>
            )}
          </div>

          {/* Links de Navegação do Menu Lateral */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('collections')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'collections'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Coleções &amp; Registros</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Contas &amp; Usuários</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'logs'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Auditoria &amp; Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações API</span>
            </button>
          </nav>
        </div>

        {/* Perfil do Usuário Autenticado no rodapé do menu lateral */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <span className="block text-xs font-semibold text-white truncate">
                {currentUser?.name || 'Administrador'}
              </span>
              <span className="block text-[11px] text-slate-400 truncate">
                {currentUser?.email || 'admin@areiapreta.com'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-28">
        
        {/* Barra Superior */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>AreiaPreta</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicador de Status Compacto */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${dbStatus.online ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>AreiaPreta: {dbStatus.online ? 'Online' : 'Offline'}</span>
            </div>

            <a
              href={AREIAPRETA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition font-medium"
            >
              <span>Abrir Servidor AreiaPreta</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Conteúdo Dinâmico por Aba */}
        <div className="p-6 md:p-8 space-y-8 max-w-7xl w-full">
          
          {/* ABA: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Visão Geral da Base de Dados
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Gerenciamento e monitoramento da instância AreiaPreta conectada.
                </p>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Status do Servidor</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-display text-white">
                      {dbStatus.online ? 'Operacional' : 'Offline'}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${dbStatus.online ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Última verificação: {dbStatus.lastChecked}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Coleções Monitoradas</span>
                  <div className="text-2xl font-bold font-display text-white">
                    04 <span className="text-xs text-slate-400 font-normal">principais</span>
                  </div>
                  <span className="text-[11px] text-cyan-400 block font-mono">
                    users, system, logs, auth
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Registros Ativos</span>
                  <div className="text-2xl font-bold font-display text-white">
                    {records.length} <span className="text-xs text-slate-400 font-normal">itens</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 block">
                    100% integridade relacional
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Sessão Autenticada</span>
                  <div className="text-base font-bold font-display text-cyan-400 truncate">
                    {currentUser?.email || 'admin@areiapreta.com'}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Token Bearer ativo
                  </span>
                </div>
              </div>

              {/* Informações de Conexão com AreiaPreta */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span>Detalhes da Conexão AreiaPreta</span>
                  </h3>
                  <button
                    onClick={updateHealth}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Testar Conexão</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 block">Endpoint Configurado:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{AREIAPRETA_URL}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 block">Mensagem de Resposta:</span>
                    <span className="text-slate-200">{dbStatus.message}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 block">Motor de Banco de Dados:</span>
                    <span className="text-emerald-400 font-semibold">AreiaPreta Engine</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA: COLEÇÕES & REGISTROS */}
          {activeTab === 'collections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Coleções de Dados
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Exploração e gerenciamento dos registros sincronizados com o AreiaPreta.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold transition flex items-center gap-2 self-start sm:self-auto shadow-md shadow-cyan-900/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Registro</span>
                </button>
              </div>

              {/* Barra de Busca */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  maxLength={60}
                  value={searchFilter}
                  onChange={e => setSearchFilter(sanitizeText(e.target.value, 60))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  aria-label="Buscar registros"
                />
              </div>

              {/* Tabela de Registros */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                        <th className="py-4 px-6 font-semibold">ID</th>
                        <th className="py-4 px-6 font-semibold">Título do Registro</th>
                        <th className="py-4 px-6 font-semibold">Categoria</th>
                        <th className="py-4 px-6 font-semibold">Status</th>
                        <th className="py-4 px-6 font-semibold">Responsável</th>
                        <th className="py-4 px-6 font-semibold">Atualização</th>
                        <th className="py-4 px-6 font-semibold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredRecords.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-4 px-6 font-mono text-cyan-400 font-bold">
                            {item.id}
                          </td>
                          <td className="py-4 px-6 font-medium text-white">
                            {item.title}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[11px] font-semibold">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            {item.author}
                          </td>
                          <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                            {item.updatedAt}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleDeleteRecord(item.id)}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition"
                              title="Excluir"
                              aria-label={`Excluir ${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ABA: CONTAS & USUÁRIOS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Contas de Usuários AreiaPreta
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Gerenciamento da coleção oficial de autenticação `users`.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Coleção Autenticada: users
                    </h3>
                    <p className="text-xs text-slate-400">
                      Regras de validação (API Rules) ativas para criação, visualização e atualização.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                    <span>E-mail do Administrador Conectado:</span>
                    <span className="font-mono text-cyan-400 font-bold">{currentUser?.email || 'admin@areiapreta.com'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                    <span>Nível de Acesso:</span>
                    <span className="text-emerald-400 font-medium">Administrador do Sistema (Superuser)</span>
                  </div>
                  <div className="flex justify-between text-slate-300 py-1">
                    <span>Provedores de Autenticação:</span>
                    <span className="text-slate-400">E-mail e Senha / Tokens JWT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA: AUDITORIA & LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Auditoria de Atividades
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Eventos de autenticação e requisições HTTP na instância do AreiaPreta.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-800">
                  <span>TIMESTAMP</span>
                  <span>MÉTODO / ROTA</span>
                  <span>STATUS</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>[2026-11-11 10:14:02]</span>
                  <span className="text-cyan-400">POST /api/collections/users/auth-with-password</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>[2026-11-11 10:14:01]</span>
                  <span className="text-cyan-400">GET /api/health</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>[2026-11-11 10:13:58]</span>
                  <span className="text-purple-400">GET /api/collections/records/list</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
              </div>
            </div>
          )}

          {/* ABA: CONFIGURAÇÕES API */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Configurações do Servidor
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Diretrizes de rede e ambiente de integração.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
                <div>
                  <label htmlFor="areiapreta-url" className="block text-slate-400 mb-1 font-medium">URL Base do AreiaPreta (VITE_AREIAPRETA_URL)</label>
                  <input
                    id="areiapreta-url"
                    type="text"
                    readOnly
                    value={AREIAPRETA_URL}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-mono"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 leading-relaxed">
                  Para alterar o endereço do servidor AreiaPreta em produção ou homologação, defina a variável <code className="text-cyan-400 font-mono">VITE_AREIAPRETA_URL</code> no arquivo <code className="text-cyan-400 font-mono">.env</code> ou nas variáveis de ambiente do Render.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. BOTÃO "SAIR" POSICIONADO NO CORPO INFERIOR DIREITO DA TELA */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm tracking-wide shadow-2xl shadow-red-950/60 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-red-500/30"
          title="Encerrar sessão no sistema"
          aria-label="Sair da conta"
        >
          <LogOut className="w-4 h-4" />
          <span>SAIR</span>
        </button>
      </div>

      {/* Modal de Novo Registro */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-display">
                Novo Registro
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              <div>
                <label htmlFor="reg-title" className="block text-slate-400 mb-1 font-medium">Título do Registro</label>
                <input
                  id="reg-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label htmlFor="reg-category" className="block text-slate-400 mb-1 font-medium">Categoria</label>
                <select
                  id="reg-category"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Geral">Geral</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Performance">Performance</option>
                  <option value="Infraestrutura">Infraestrutura</option>
                  <option value="Integrações">Integrações</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
                >
                  Salvar no AreiaPreta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
