// src/pages/agents/AgentsPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
//import { useMutation } from '../../hooks/useMutation';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';
//import { useToast } from '../../hooks/useToast';
import AgentsForm from '../../components/agents/AgentsForm';
import AgentsTable from '../../components/agents/AgentsTable';

const AgentsPage: React.FC = () => {
  const { data: agents, refetch } = useFetch(endpoints.AGENTS.LIST);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  //const toast = useToast();
  const handleEdit = (agent: any) => setEditingAgent(agent);

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <h2 className="text-2xl font-bold">Agents Management</h2>
        <AgentsForm
          agent={editingAgent}
          onSuccess={() => {
            refetch();
            setEditingAgent(null);
          }}
        />
        <AgentsTable agents={agents?.data || []} onEdit={handleEdit} onRefresh={refetch} />
      </div>
    </DashboardLayout>
  );
};

export default AgentsPage;
