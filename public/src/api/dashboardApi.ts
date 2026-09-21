import axiosClient from './axiosClient';
import { endpoints } from './endpoints';

interface Summary {
  total_parts?: number;
  total_sales?: number;
  total_inventory_value?: number;
  total_customers?: number;
}

/**
 * Fetch a consolidated summary. Try the official reports summary endpoint first,
 * otherwise fall back to aggregating counts from list endpoints.
 */
export const getSummary = async (): Promise<Summary> => {
  // Try reports summary endpoint if available
  try {
    const res = await axiosClient.get(endpoints.REPORTS.SUMMARY);
    return res.data.data || res.data || {};
  } catch (err) {
    // Fallback: aggregate counts from common list endpoints
    try {
      const [partsRes, salesRes, agentsRes] = await Promise.all([
        axiosClient.get(endpoints.PARTS.LIST),
        axiosClient.get(endpoints.SALES.LIST),
        axiosClient.get(endpoints.AGENTS.LIST),
      ]);

      const partsCount = partsRes.data?.meta?.total ?? (Array.isArray(partsRes.data?.data) ? partsRes.data.data.length : 0);
      const salesCount = salesRes.data?.meta?.total ?? (Array.isArray(salesRes.data?.data) ? salesRes.data.data.length : 0);
      const agentsCount = agentsRes.data?.meta?.total ?? (Array.isArray(agentsRes.data?.data) ? agentsRes.data.data.length : 0);

      return {
        total_parts: partsCount,
        total_sales: salesCount,
        total_customers: agentsCount,
      };
    } catch (aggregateErr) {
      // If everything fails, return empty summary
      console.error('Failed to load dashboard summary or aggregate counts', aggregateErr);
      return {};
    }
  }
};

export const prefetchSummary = async (): Promise<void> => {
  try {
    await getSummary();
  } catch (err) {
    // Ignore prefetch errors — we'll fetch again when Dashboard mounts
  }
};

export default { getSummary, prefetchSummary };
