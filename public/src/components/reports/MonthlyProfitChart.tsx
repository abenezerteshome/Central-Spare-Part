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

  if (!data) return <p>Loading chart...</p>;

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
