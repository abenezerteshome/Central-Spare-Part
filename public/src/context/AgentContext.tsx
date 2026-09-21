import React, { createContext, useContext, useState } from 'react';

interface AgentContextValue {
  selectedAgent: string | null;
  setSelectedAgent: (id: string | null) => void;
}

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  return (
    <AgentContext.Provider value={{ selectedAgent, setSelectedAgent }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used within AgentProvider');
  return ctx;
};
