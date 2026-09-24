// src/components/reports/MonthlyProfitChart.tsx
import React, { useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyProfitChart: React.FC = () => {
  const { data, refetch } = useFetch(endpoints.REPORTS.MONTHLY_PROFIT);

  useEffect(() => {
    refetch();
  }, []);

  if (!data) return (
    <div className="w-full h-64 bg-slate-50 border rounded-xl p-4 flex flex-col justify-between animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="flex items-end gap-3 h-44 pt-6">
        <div className="flex-1 bg-slate-200 rounded-t h-[50%]"></div>
        <div className="flex-1 bg-slate-200 rounded-t h-[80%]"></div>
        <div className="flex-1 bg-slate-200 rounded-t h-[45%]"></div>
        <div className="flex-1 bg-slate-200 rounded-t h-[95%]"></div>
        <div className="flex-1 bg-slate-200 rounded-t h-[60%]"></div>
      </div>
    </div>
  );

  const chartData = {
    labels: data.data.map((d: any) => d.month),
    datasets: [
      {
        label: 'Monthly Profit',
        data: data.data.map((d: any) => d.profit),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default MonthlyProfitChart;
