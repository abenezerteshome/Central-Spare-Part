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

  if (!data) return <p>Loading chart...</p>;

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
