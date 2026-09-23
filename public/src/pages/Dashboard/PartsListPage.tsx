import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PartList from '../../components/parts/PartList';
import { useNavigate } from 'react-router-dom';

const PartsListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="min-w-0 p-4 sm:p-6">
        <h1 className="mb-4 text-xl font-semibold">Parts</h1>
        <PartList onEdit={(id) => navigate(`/dashboard/parts/edit/${id}`)} />
      </div>
    </DashboardLayout>
  );
};

export default PartsListPage;
