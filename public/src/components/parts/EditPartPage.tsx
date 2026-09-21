import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import PartForm from './PartForm';

const EditPartPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4 max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Edit Part</h1>
          <button
            onClick={() => navigate('/dashboard/parts/')}
            className="text-sm text-gray-600"
          >
            Back to parts
          </button>
        </div>

        <PartForm partId={id} onSuccess={() => navigate('/dashboard/parts/mine')} />
      </div>
    </DashboardLayout>
  );
};

export default EditPartPage;
