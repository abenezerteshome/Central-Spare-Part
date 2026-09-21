// src/pages/dashboard/InventoryPage.tsx
import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InventoryList from '../../components/inventory/InventoryList';

const InventoryPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
        <InventoryList />
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;
