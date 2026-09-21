// src/pages/dashboard/ReportsPage.tsx
import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReportSummary from '../../components/reports/ReportSummary';
import DailySalesChart from '../../components/reports/DailySalesChart';
import MonthlyProfitChart from '../../components/reports/MonthlyProfitChart';

const ReportsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-8">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>

        <section>
          <h3 className="font-semibold mb-2">Summary</h3>
          <ReportSummary />
        </section>

        <section>
          <h3 className="font-semibold mb-2">Daily Sales</h3>
          <DailySalesChart />
        </section>

        <section>
          <h3 className="font-semibold mb-2">Monthly Profit</h3>
          <MonthlyProfitChart />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
