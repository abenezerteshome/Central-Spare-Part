// src/pages/dashboard/ExpensesPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import ExpenseList from '../../components/expenses/ExpenseList';

const ExpensesPage: React.FC = () => {
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refresh = () => {
    setRefreshFlag(!refreshFlag);
    setEditingExpense(null);
  };

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        <div className="w-1/3">
          <ExpenseForm onSuccess={refresh} initialData={editingExpense} />
        </div>
        <div className="flex-1">
          <ExpenseList key={refreshFlag ? 'r1' : 'r0'} onEdit={setEditingExpense} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExpensesPage;
