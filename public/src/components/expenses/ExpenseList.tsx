// src/components/expenses/ExpenseList.tsx
import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast } from '../../hooks/useToast';
import { FiEye, FiEyeOff, FiTrash2, FiEdit2, FiHome } from 'react-icons/fi';

interface ExpenseListProps {
  onEdit: (expense: any) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ onEdit }) => {
  const { data: expenses, refetch } = useFetch(endpoints.EXPENSES.LIST);
  const { mutate: deleteExpense } = useMutation((id: string) => `${endpoints.EXPENSES.DELETE(id)}`, 'delete');
  const toast = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure to delete this expense?')) return;
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      refetch();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const list = expenses?.data?.data || [];

  if (!list.length) return <div className="text-center text-gray-500 mt-4">No expenses found.</div>;

  return (
    <div>
      <div className="mb-3">
        <a href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800" aria-label="Back to home">
          <FiHome className="h-5 w-5" />
        </a>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:grid grid-cols-4 font-semibold text-gray-700 px-2 py-2 border-b">
        <div>No</div>
        <div>Title</div>
        <div>Amount</div>
        <div className="text-center">Actions</div>
      </div>

      <div className="space-y-3">
        {list.map((exp: any, idx: number) => (
          <div key={exp.id}>
            <div className="bg-white rounded-lg border shadow-sm p-3">
              {/* MOBILE ROW */}
              <div className="md:hidden flex items-center gap-3 py-3">
                <div className="text-sm font-semibold text-gray-700 w-8">{idx + 1}</div>
                <div className="flex-1 font-medium text-gray-900 truncate">{exp.title}</div>
                <div className="text-sm text-gray-600 w-24 truncate">{exp.amount}</div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setExpandedId(prev => (prev === exp.id ? null : exp.id))}
                    className="p-3 rounded bg-gray-50 hover:bg-gray-100 touch-manipulation"
                    aria-label={expandedId === exp.id ? 'Collapse details' : 'View details'}
                  >
                    {expandedId === exp.id ? <FiEyeOff /> : <FiEye />}
                  </button>

                  <button
                    onClick={() => onEdit(exp)}
                    className="p-3 rounded bg-blue-50 hover:bg-blue-100 text-blue-600"
                    aria-label="Edit expense"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-3 rounded bg-red-50 hover:bg-red-100 text-red-600"
                    aria-label="Delete expense"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* DESKTOP ROW */}
              <div className="hidden md:grid grid-cols-4 items-center px-2">
                <div className="text-gray-700 font-medium">{idx + 1}</div>
                <div className="font-medium text-gray-800">{exp.title}</div>
                <div className="text-gray-600">{exp.amount}</div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setExpandedId(prev => (prev === exp.id ? null : exp.id))}
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <FiEye />
                  </button>

                  <button
                    onClick={() => onEdit(exp)}
                    className="p-2 rounded hover:bg-gray-100 text-blue-600"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 rounded hover:bg-gray-100 text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>

            {/* EXPANDED */}
            <div className={`transition-all overflow-hidden ${expandedId === exp.id ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="text-sm text-gray-700 space-y-2">
                  <div><b>Title:</b> {exp.title}</div>
                  <div><b>Amount:</b> {exp.amount}</div>
                  <div><b>Description:</b> {exp.description || '-'}</div>
                  <div><b>Date:</b> {exp.date || '-'}</div>
                </div>

                {/* Mobile full-width action buttons for accessibility */}
                <div className="mt-3 md:hidden flex flex-col gap-2">
                  <button onClick={() => onEdit(exp)} className="w-full bg-yellow-500 text-white py-3 rounded flex items-center justify-center gap-2">
                    <FiEdit2 /> Edit
                  </button>
                  <button onClick={() => handleDelete(exp.id)} className="w-full bg-red-600 text-white py-3 rounded flex items-center justify-center gap-2">
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
