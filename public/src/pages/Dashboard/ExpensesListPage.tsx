import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ExpenseList from '../../components/expenses/ExpenseList';

const ExpensesListPage: React.FC = () => {
  const navigate = useNavigate();

  const handleEdit = (expense: any) => {
    if (!expense?.id) return;
    navigate(`/dashboard/expenses/${expense.id}/edit`);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Expenses</h2>
        <div>
          <button
            onClick={() => navigate('/dashboard/expenses/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Expense
          </button>
        </div>
      </div>

      <ExpenseList onEdit={handleEdit} />
    </DashboardLayout>
  );
};

export default ExpensesListPage;
