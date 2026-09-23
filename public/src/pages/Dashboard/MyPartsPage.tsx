import React, { useState, useMemo, useEffect } from 'react';
import { useAgent } from '../../context/AgentContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PartList from '../../components/parts/PartList';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';
import { useNavigate } from 'react-router-dom';


const MyPartsPage: React.FC = () => {
  const { data: agentsData, loading: agentsLoading } = useFetch(endpoints.AGENTS.LIST, [], {
    cacheKey: 'reference:agents',
    keepPreviousData: true,
  });
  const { data: categoriesData, loading: categoriesLoading } = useFetch(endpoints.CATEGORIES.LIST, [], {
    cacheKey: 'reference:categories',
    keepPreviousData: true,
  });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [search] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [status] = useState<string | null>(null);
  const { selectedAgent: globalAgent, setSelectedAgent: setGlobalAgent } = useAgent();

  const selectedAgentName = useMemo(() => {
    if (!selectedAgent) return null;
    const list = agentsData?.data?.data || [];
    const a = list.find((x: any) => String(x.id) === String(selectedAgent));
    return a ? a.name : selectedAgent;
  }, [selectedAgent, agentsData]);

  // initialize from global agent selection and keep in sync
  useEffect(() => {
    if (globalAgent && globalAgent !== selectedAgent) setSelectedAgent(globalAgent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalAgent]);

  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4">
     

        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-gray-600">Agent</label>
          <select
            value={selectedAgent || ''}
            disabled={agentsLoading}
            onChange={(e) => {
              const v = e.target.value || null;
              setSelectedAgent(v);
              setGlobalAgent(v);
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">{agentsLoading ? 'Loading agents...' : 'ALL'}</option>
            {agentsData?.data?.data?.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {selectedAgent && <div className="text-sm text-gray-500">Selected: <span className="font-medium">{selectedAgentName}</span></div>}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-gray-600">Category</label>
          <select
            value={categoryId || ''}
            disabled={categoriesLoading}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="border px-3 py-2 rounded"
          >
            <option value="">{categoriesLoading ? 'Loading categories...' : 'ALL'}</option>
            {categoriesData?.data?.data?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <PartList
          onEdit={(id) => navigate(`/dashboard/parts/edit/${id}`)}
          initialSearch={search}
          agentId={selectedAgent}
          categoryId={categoryId}
          status={status}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyPartsPage;
