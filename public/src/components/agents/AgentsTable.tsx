import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiTrash2, FiEdit2, FiHome } from 'react-icons/fi';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast } from '../../hooks/useToast';

interface Agent {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

interface AgentsTableProps {
  agents: any; // can be array or object with .data
  onEdit: (agent: Agent) => void;
  onRefresh?: () => void;
}

const AgentsTable: React.FC<AgentsTableProps> = ({ agents, onEdit, onRefresh }) => {
  const { mutate: deleteAgent } = useMutation((id: string) => `${endpoints.AGENTS.DELETE(id)}`, 'delete');
  const toast = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ✅ Safely extract array
  const agentList: Agent[] = Array.isArray(agents)
    ? agents
    : Array.isArray(agents?.data)
    ? agents.data
    : [];

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      await deleteAgent(id);
      toast.success('Agent deleted successfully!');
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete agent.');
    }
  };

  if (!agentList.length) {
    return <div className="text-center text-gray-500 mt-4">No agents found.</div>;
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800" aria-label="Back to home">
          <FiHome className="h-5 w-5" />
        </Link>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:grid grid-cols-4 font-semibold text-gray-700 px-2 py-2 border-b">
        <div>No</div>
        <div>Name</div>
        <div>Phone</div>
        <div className="text-center">Actions</div>
      </div>

      <div className="space-y-3">
        {agentList.map((agent: Agent, idx: number) => (
          <div key={agent.id}>
            <div className="bg-white rounded-lg border shadow-sm p-3">
              {/* MOBILE HORIZONTAL ROW */}
              <div className="md:hidden flex items-center gap-3">
                <div className="text-xs font-semibold text-gray-700 w-6">{idx + 1}</div>
                <div className="flex-1 font-medium text-gray-900 truncate">{agent.name}</div>
                <div className="text-sm text-gray-600 w-28 truncate">{agent.phone || '-'}</div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setExpandedId(prev => (prev === agent.id ? null : agent.id))}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    {expandedId === agent.id ? <FiEyeOff /> : <FiEye />}
                  </button>

                  <button
                    onClick={() => onEdit(agent)}
                    className="p-2 rounded hover:bg-gray-100 text-blue-600"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-2 rounded hover:bg-gray-100 text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* DESKTOP ROW */}
              <div className="hidden md:grid grid-cols-4 items-center px-2">
                <div className="text-gray-700 font-medium">{idx + 1}</div>
                <div className="font-medium text-gray-800">{agent.name}</div>
                <div className="text-gray-600">{agent.phone || '-'}</div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setExpandedId(prev => (prev === agent.id ? null : agent.id))}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <FiEye />
                  </button>

                  <button
                    onClick={() => onEdit(agent)}
                    className="p-2 rounded hover:bg-gray-100 text-blue-600"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-2 rounded hover:bg-gray-100 text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>

            {/* EXPANDED DETAIL */}
            <div className={`transition-all overflow-hidden ${expandedId === agent.id ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="text-sm text-gray-700 space-y-2">
                  <div><b>Name:</b> {agent.name}</div>
                  <div><b>Phone:</b> {agent.phone || '-'}</div>
                  <div><b>Address:</b> {agent.address || '-'}</div>
                  {/* placeholder for additional details */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={previewImage} alt="Preview" className="max-h-[90vh] rounded-lg shadow-lg object-contain" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              className="absolute -top-4 -right-4 bg-white text-black w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

export default AgentsTable;
