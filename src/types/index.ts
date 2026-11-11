export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  created?: string;
  updated?: string;
}

export interface DatabaseStatus {
  online: boolean;
  message: string;
  latency?: number;
  lastChecked: string;
  url: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  category: string;
  status: 'Ativo' | 'Pendente' | 'Arquivado';
  author: string;
  updatedAt: string;
}

export type AdminTab = 'dashboard' | 'collections' | 'users' | 'logs' | 'settings';
