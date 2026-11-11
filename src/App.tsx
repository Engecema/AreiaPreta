import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import { pb } from './lib/areiapreta';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    // Verifica se já existe sessão válida salva no authStore do AreiaPreta
    if (pb.authStore.isValid && pb.authStore.model) {
      return pb.authStore.model;
    }
    const localSession = localStorage.getItem('areiapreta_admin_session');
    if (localSession) {
      try {
        return JSON.parse(localSession);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Sincroniza com as mudanças de estado de autenticação do AreiaPreta
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (token && model) {
        setCurrentUser(model);
        localStorage.setItem('areiapreta_admin_session', JSON.stringify(model));
      } else if (!token) {
        // Se desautenticado pelo SDK, limpa a sessão local caso não seja sessão demo
        if (!localStorage.getItem('areiapreta_demo_mode')) {
          setCurrentUser(null);
          localStorage.removeItem('areiapreta_admin_session');
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('areiapreta_admin_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    pb.authStore.clear();
    localStorage.removeItem('areiapreta_admin_session');
    localStorage.removeItem('areiapreta_demo_mode');
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
