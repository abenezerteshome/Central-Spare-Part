// src/pages/dashboard/SalesPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SaleForm from '../../components/sales/SaleForm';
import SaleList from '../../components/sales/SaleList';
import SaleDetail from '../../components/sales/SaleDetail';

const SalesPage: React.FC = () => {
  const [viewingSale, setViewingSale] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refresh = () => setRefreshFlag(!refreshFlag);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <SaleForm onSuccess={refresh} />
        <div className="space-y-4">
          <SaleList key={refreshFlag ? 'r1' : 'r0'} onView={(id) => setViewingSale(id)} />
          {viewingSale && <SaleDetail saleId={viewingSale} />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesPage;
