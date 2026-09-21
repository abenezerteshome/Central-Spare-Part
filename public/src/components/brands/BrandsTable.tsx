// src/components/brands/BrandsTable.tsx
import React from 'react';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast } from '../../hooks/useToast';

interface Brand {
  id: string;
  name: string;
  country?: string;
  notes?: string;
}

interface BrandsTableProps {
  brands: any;
  onEdit: (brand: Brand) => void;
  onRefresh?: () => void;
}


const BrandsTable: React.FC<BrandsTableProps> = ({ brands, onEdit, onRefresh }) => {
  const { mutate: deleteBrand } = useMutation((id: string) => `${endpoints.BRANDS.DELETE(id)}`, 'delete');
  const toast = useToast();

  const brandList: Brand[] = Array.isArray(brands)
    ? brands
    : Array.isArray(brands?.data)
      ? brands.data
      : [];

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      // FIX: Pass 'id' as the second argument (param) for the URL function.
      // The first argument (payload) is undefined as there is no request body.
      await deleteBrand(undefined, id);
      toast.success('Brand deleted successfully!');
      onRefresh?.();
    } catch (err) {
      // Error is now thrown by the improved useMutation hook
      console.error(err);
      toast.error('Failed to delete brand.');
    }
  };

  if (!brandList.length) {
    return <div className="text-center text-gray-500 mt-4">No brands found.</div>;
  }
  console.log("brandList", brandList);

  return (
    <table className="min-w-full border mt-4">
      {/* Table JSX remains the same */}
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border">Name</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {brandList.map((brand) => (
          <tr key={brand.id}>
            <td className="p-2 border">{brand.name}</td>
            <td className="p-2 border space-x-2">
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => onEdit(brand)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(brand.id)}
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

export default BrandsTable;