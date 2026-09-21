// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AgentProvider } from './context/AgentContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        {/* AgentProvider holds the globally-selected agent for filtering */}
        <AgentProvider>
          <App />
        </AgentProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);