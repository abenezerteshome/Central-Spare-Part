// src/pages/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getSummary } from '../../api/dashboardApi';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({});

  // Fetch agents for "Parts By Agent"
  const { data: agentsData, loading: agentsLoading } = useFetch(endpoints.AGENTS.LIST, [], {
    cacheKey: 'reference:agents',
    keepPreviousData: true,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getSummary();
        if (!mounted) return;
        setSummary(data || {});
      } catch (err) {
        console.error("Error loading dashboard summary", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const agents = agentsData?.data?.data || [];

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Central Spare Part</h1>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            {
              key: 'parts',
              title: 'Total Parts',
              value: summary.total_parts || 0,
            },
            {
              key: 'sales',
              title: 'Total Sales',
              value: summary.total_sales || 0,
            },
            {
              key: 'inventory',
              title: 'Inventory Value',
              value: summary.total_inventory_value || 0,
            },
            {
              key: 'customers',
              title: 'Customers',
              value: summary.total_customers || 0,
            },
          ].map((card) => (
            <div
              key={card.key}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {card.title}
              </div>
              <div className="text-2xl font-semibold mt-2">
                {loading ? (
                  <span className="inline-block h-6 w-20 rounded bg-gray-200 animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PARTS BY AGENT SECTION */}
        <h2 className="text-xl font-semibold mt-10 mb-3">Parts by Agent</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-lg border bg-gray-200" />
            ))
          ) : agents.length === 0 ? (
            <div className="text-gray-500">No agents found...</div>
          ) : (
            agents.map((agent: any) => {
              const partCount =
                summary.parts_by_agent?.[agent.id] ??
                agent.total_parts ??
                0;

              return (
                <div
                  key={agent.id}
                  className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg border"
                >
                  <div className="text-gray-700 font-semibold">
                    {agent.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Agent ID: {agent.id}
                  </div>

                  <div className="mt-2">
                    <div className="text-lg font-bold">{partCount}</div>
                    <div className="text-xs text-gray-500">Parts Available</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 text-gray-600">
          {loading
            ? "Loading dashboard..."
            : "Select a module from the sidebar to explore more."}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
