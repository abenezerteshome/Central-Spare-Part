// src/pages/categories/CategoriesPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CategoriesForm from '../../components/categories/CategoriesForm';
import CategoriesTable from '../../components/categories/CategoriesTable';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';

const CategoriesPage: React.FC = () => {
  const { data: categories, refetch, loading } = useFetch(endpoints.CATEGORIES.LIST, [], {
    cacheKey: 'reference:categories',
    keepPreviousData: true,
  });
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const handleEdit = (category: any) => setEditingCategory(category);

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <h2 className="text-2xl font-bold">Categories Management</h2>
        <CategoriesForm
          category={editingCategory}
          onSuccess={() => {
            refetch();
            setEditingCategory(null);
          }}
        />
        <CategoriesTable loading={loading} categories={categories?.data || []} onEdit={handleEdit} onRefresh={refetch} />
      </div>
    </DashboardLayout>
  );
};

export default CategoriesPage;
