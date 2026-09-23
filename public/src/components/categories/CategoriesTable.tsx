// src/components/categories/CategoriesTable.tsx
import React from 'react';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast  } from '../../hooks/useToast';

interface CategoriesTableProps {
  categories: any; // can be array or paginated object { data: [...] }
  loading?: boolean;
  onEdit: (category: any) => void;
  onRefresh?: () => void;
}


const CategoriesTable: React.FC<CategoriesTableProps> = ({ categories, loading = false, onEdit, onRefresh }) => {
  const { mutate: deleteCategory } = useMutation(
    (id: string) => `${endpoints.CATEGORIES.DELETE(id)}`,
    'delete'
  );

  const toast = useToast();

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      // call mutate so the URL function receives the id param (mutate(payload?, param?))
      // when using a function URL, mutate(id) will be treated as the param (implemented in useMutation)
      await deleteCategory(id);
      toast.success('Category deleted');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete category';
      console.error('Delete category error', err);
      toast.error(msg);
    }
  };

  // Normalize categories to an array and handle empty state
  const list = Array.isArray(categories) ? categories : Array.isArray(categories?.data) ? categories.data : [];

  if (loading) {
    return <div className="mt-4 space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-200" />)}</div>;
  }

  if (!list.length) {
    return (
      <table className="min-w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} className="p-2 border text-center text-gray-500">No categories available</td>
          </tr>
        </tbody>
      </table>
    );
  }

  console.log('categories', list);

  return (
    <table className="min-w-full border mt-4">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border">Name</th>
       
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {list.map((category: any) => (
          <tr key={category.id}>
            <td className="p-2 border">{category.system}</td>
            <td className="p-2 border">{category.description}</td>

            <td className="p-2 border space-x-2">
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => onEdit(category)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(category.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CategoriesTable;
