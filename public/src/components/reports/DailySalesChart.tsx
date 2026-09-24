// src/components/reports/DailySalesChart.tsx
import React, { useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DailySalesChart: React.FC = () => {
  const { data, refetch } = useFetch(endpoints.REPORTS.DAILY_SALES);

  useEffect(() => {
    refetch();
  }, []);

  if (!data) return (
    <div className="w-full h-64 bg-slate-50 border rounded-xl p-4 flex flex-col justify-between animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="flex items-end gap-3 h-44 pt-6">
        <div className="flex-1 bg-slate-200 rounded-t h-[40%]"></div>
        <div className="flex-1 bg-slate-200 rounded-t h-[70%]"></div>
        <div className="flex-1 bg-slate-200 rounded-t h-[55%]"></div>
        <div className="flex-1 bg-slate-200 rounded-t h-[90%]"></div>
        <div className="flex-1 bg-slate-200 rounded-t h-[65%]"></div>
      </div>
    </div>
  );

  const chartData = {
    labels: data.data.map((d: any) => d.date),
    datasets: [
      {
        label: 'Daily Sales',
        data: data.data.map((d: any) => d.total),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return <Line data={chartData} />;
};

export default DailySalesChart;
