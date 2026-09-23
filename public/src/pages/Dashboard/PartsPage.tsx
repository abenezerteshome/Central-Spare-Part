// src/pages/dashboard/PartsPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PartForm from '../../components/parts/PartForm';
import PartList from '../../components/parts/PartList';

const PartsPage: React.FC = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const refresh = () => setRefreshFlag(!refreshFlag);

  return (
    <DashboardLayout>
      <div className="flex min-w-0 flex-col gap-6 p-4 lg:flex-row lg:items-start lg:p-6">
        <div className="w-full min-w-0 lg:w-1/3 lg:shrink-0">
          <PartForm partId={editingId || undefined} onSuccess={() => { setEditingId(null); refresh(); }} />
        </div>
        <div className="min-w-0 w-full flex-1">
          <PartList key={refreshFlag ? 'r1' : 'r0'} onEdit={(id) => setEditingId(id)} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartsPage;
