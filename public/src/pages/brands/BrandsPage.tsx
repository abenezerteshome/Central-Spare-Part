// src/pages/brands/BrandsPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BrandsForm from '../../components/brands/BrandsForm';
import BrandsTable from '../../components/brands/BrandsTable';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';

const BrandsPage: React.FC = () => {
  const { data: brands, refetch } = useFetch(endpoints.BRANDS.LIST);
  const [editingBrand, setEditingBrand] = useState<any>(null);

  const handleEdit = (brand: any) => setEditingBrand(brand);

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <h2 className="text-2xl font-bold">Brands Management</h2>
  <BrandsForm brand={editingBrand} onSuccess={refetch} />
        <BrandsTable brands={brands?.data || []} onEdit={handleEdit} onRefresh={refetch} />
      </div>
    </DashboardLayout>
  );
};

export default BrandsPage;
