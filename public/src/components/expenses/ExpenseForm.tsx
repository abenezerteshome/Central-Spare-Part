// src/components/expenses/ExpenseForm.tsx
import React, { useState } from 'react';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast } from '../../hooks/useToast';
import { FiSave } from 'react-icons/fi';

const inputBase =
  'w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';

interface ExpenseFormProps {
  onSuccess: () => void;
  initialData?: any; // For edit functionality
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, initialData }) => {
  const toast = useToast();
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || '');

  // Keep local state in sync when editing: update form fields if `initialData` changes
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title ?? '');
      setAmount(initialData.amount ?? '');
      setDescription(initialData.description ?? '');
      setDate(initialData.date ?? '');
    }
  }, [initialData]);

  const { mutate, loading } = useMutation(
    initialData ? `${endpoints.EXPENSES.UPDATE(initialData.id)}` : endpoints.EXPENSES.CREATE,
    initialData ? 'put' : 'post'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutate({ title, amount, description, date });
      toast.success(`Expense ${initialData ? 'updated' : 'created'} successfully`);
      setTitle('');
      setAmount('');
      setDescription('');
      setDate('');
      onSuccess();
    } catch (err) {
      toast.error('Failed to save expense');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded space-y-4">
      <input
        type="text"
        placeholder="Expense Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={inputBase}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputBase}
          required
          min={0}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputBase}
        />
      </div>

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={inputBase + ' h-24'}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          disabled={loading}
        >
          <FiSave />
          {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
        </button>

        <button
          type="button"
          onClick={() => { setTitle(''); setAmount(''); setDescription(''); setDate(''); }}
          className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 py-3 rounded hover:bg-gray-200"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
