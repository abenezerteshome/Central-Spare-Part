import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';

const ExpenseFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // If editing, fetch the expense details
  const { data } = useFetch(id ? endpoints.EXPENSES.DETAIL(id) : null as any);
  const expense = data?.data || data || null;

  const handleSuccess = () => {
    // After create/update go back to list
    navigate('/dashboard/expenses');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">{id ? 'Edit Expense' : 'New Expense'}</h2>
        <ExpenseForm onSuccess={handleSuccess} initialData={expense} />
      </div>
    </DashboardLayout>
  );
};

export default ExpenseFormPage;
