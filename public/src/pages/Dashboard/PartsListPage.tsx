import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PartList from '../../components/parts/PartList';
import { useNavigate } from 'react-router-dom';

const PartsListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Parts</h1>
        <PartList onEdit={(id) => navigate(`/dashboard/parts/edit/${id}`)} />
      </div>
    </DashboardLayout>
  );
};

export default PartsListPage;
