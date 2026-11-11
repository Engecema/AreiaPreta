import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import { pb, safeJsonParse, sanitizeText } from './lib/areiapreta';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    // 1. Prioriza sessão ativa em memória no authStore
    if (pb.authStore.isValid && pb.authStore.model) {
      return pb.authStore.model;
    }
    // 2. Leitura com sanitização contra injeção de sessão no localStorage
    const saved = localStorage.getItem('areiapreta_admin_session');
    const parsed = safeJsonParse<any>(saved, null);
    if (parsed && typeof parsed === 'object' && typeof parsed.id === 'string') {
      return {
        id: sanitizeText(parsed.id, 64),
        email: sanitizeText(parsed.email, 120),
        name: sanitizeText(parsed.name, 120) || 'Administrador',
        role: sanitizeText(parsed.role, 60) || 'Admin',
      };
    }
    return null;
  });

  useEffect(() => {
    // Sincroniza com as mudanças de estado de autenticação do AreiaPreta
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (token && model) {
        const cleanUser = {
          id: sanitizeText(model.id, 64),
          email: sanitizeText(model.email, 120),
          name: sanitizeText((model as any).name, 120) || 'Administrador',
          role: sanitizeText((model as any).role, 60) || 'Admin',
        };
        setCurrentUser(cleanUser);
        try {
          localStorage.setItem('areiapreta_admin_session', JSON.stringify(cleanUser));
        } catch {
          // Falha silenciosa caso o armazenamento local esteja bloqueado por políticas de privacidade
        }
      } else if (!token) {
        if (!localStorage.getItem('areiapreta_demo_mode')) {
          setCurrentUser(null);
          try {
            localStorage.removeItem('areiapreta_admin_session');
          } catch {}
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (user: any) => {
    const cleanUser = {
      id: sanitizeText(user?.id, 64) || 'usr_session',
      email: sanitizeText(user?.email, 120) || 'admin@areiapreta.com',
      name: sanitizeText(user?.name, 120) || 'Administrador',
      role: sanitizeText(user?.role, 60) || 'Super Admin',
    };
    setCurrentUser(cleanUser);
    try {
      localStorage.setItem('areiapreta_admin_session', JSON.stringify(cleanUser));
    } catch {}
  };

  const handleLogout = () => {
    pb.authStore.clear();
    try {
      localStorage.removeItem('areiapreta_admin_session');
      localStorage.removeItem('areiapreta_demo_mode');
    } catch {}
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {currentUser ? (
        <AdminPanel
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
