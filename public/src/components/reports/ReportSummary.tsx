// src/components/reports/ReportSummary.tsx
import React, { useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';

const ReportSummary: React.FC = () => {
  const { data, refetch } = useFetch(endpoints.REPORTS.SUMMARY);
  useEffect(() => {
    refetch();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-green-100 rounded shadow">
        <h3 className="text-lg font-bold">Total Sales</h3>
        <p className="text-2xl">{data.totalSales}</p>
      </div>
      <div className="p-4 bg-green-100 rounded shadow">
        <h3 className="text-lg font-bold">Total Sales</h3>
        <p className="text-1xl ">{data.totalSales}</p>
      </div>
      <div className="p-4 bg-blue-100 rounded shadow">
        <h3 className="text-lg font-bold">Total Expenses</h3>
        <p className="text-2xl">{data.totalExpenses}</p>
      </div>
      <div className="p-4 bg-yellow-100 rounded shadow">
        <h3 className="text-lg font-bold">Total Profit</h3>
        <p className="text-2xl">{data.totalProfit}</p>
      </div>
    </div>
  );
};

export default ReportSummary;
