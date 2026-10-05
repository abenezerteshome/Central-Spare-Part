import React, { useState, useEffect, useCallback, useTransition } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosClient from '../../api/axiosClient';
import { endpoints } from '../../api/endpoints';
import {
  FiActivity,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCalendar,
  FiUser,
  FiClock,
  FiLayers,
  FiDownload,
  FiEye,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiInfo,
  FiCopy,
  FiAlertCircle,
} from 'react-icons/fi';

interface Actor {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_url?: string;
  phone?: string;
}

interface ActivityLogItem {
  id: string;
  actor_id?: string;
  actor?: Actor | null;
  action: string;
  module: string;
  target_table?: string;
  target_id?: string;
  description?: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  details?: Record<string, any> | null;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

interface StatsData {
  total: number;
  today: number;
  this_week: number;
  actions: { action: string; count: number }[];
  modules: { module: string; count: number }[];
  top_actors: { actor_id: string; count: number; actor?: Actor }[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const MODULE_OPTIONS = [
  { value: 'all', label: 'All Modules' },
  { value: 'Auth', label: 'Authentication' },
  { value: 'Parts', label: 'Parts Catalog' },
  { value: 'Sales', label: 'Sales & Invoices' },
  { value: 'Inventory', label: 'Inventory / Stocks' },
  { value: 'Expenses', label: 'Expenses' },
  { value: 'Users', label: 'Users & Roles' },
  { value: 'Brands', label: 'Brands' },
  { value: 'Categories', label: 'Categories' },
  { value: 'Agents', label: 'Agents & Shops' },
];

const ACTION_OPTIONS = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'stock_increase', label: 'Stock Increase' },
  { value: 'stock_decrease', label: 'Stock Decrease' },
  { value: 'status_update', label: 'Status Update' },
  { value: 'block_user', label: 'Block User' },
  { value: 'unblock_user', label: 'Unblock User' },
  { value: 'role_change', label: 'Role Change' },
];

const getActionColor = (action: string) => {
  const act = (action || '').toLowerCase();
  if (act.includes('create')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (act.includes('delete') || act.includes('block')) {
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  }
  if (act.includes('update') || act.includes('edit')) {
    return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
  }
  if (act.includes('login')) {
    return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
  }
  if (act.includes('logout')) {
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
  if (act.includes('stock')) {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
};

const getModuleColor = (mod: string) => {
  const m = (mod || '').toLowerCase();
  if (m === 'parts') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  if (m === 'sales') return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
  if (m === 'inventory') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
  if (m === 'expenses') return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
  if (m === 'users' || m === 'auth') return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
  if (m === 'brands' || m === 'categories') return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800';
  if (m === 'agents') return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
  return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
};

const formatTimeAgo = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatFullDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0,
  });
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  // Selected Log for inspection modal
  const [inspectLog, setInspectLog] = useState<ActivityLogItem | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await axiosClient.get(endpoints.ACTIVITY_LOGS.STATS);
      if (res.data?.success && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch activity stats', err);
    }
  };

  // Fetch Activity Logs
  const fetchLogs = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params: Record<string, any> = {
          page,
          per_page: perPage,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedModule !== 'all') params.module = selectedModule;
        if (selectedAction !== 'all') params.action = selectedAction;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        const res = await axiosClient.get(endpoints.ACTIVITY_LOGS.LIST, { params });
        const result = res.data?.data;

        if (result && Array.isArray(result.data)) {
          startTransition(() => {
            setLogs(result.data);
            setPagination({
              current_page: result.current_page || 1,
              last_page: result.last_page || 1,
              per_page: result.per_page || perPage,
              total: result.total || 0,
              from: result.from || 0,
              to: result.to || 0,
            });
          });
        }
      } catch (err) {
        console.error('Failed to fetch activity logs', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, perPage, debouncedSearch, selectedModule, selectedAction, dateFrom, dateTo]
  );

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedModule('all');
    setSelectedAction('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedModule !== 'all' ||
    selectedAction !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '';

  const handleCopyJSON = (item: ActivityLogItem) => {
    const text = JSON.stringify(item, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      'ID',
      'Date & Time',
      'Actor Name',
      'Actor Email',
      'Actor Role',
      'Action',
      'Module',
      'Target Table',
      'Target ID',
      'Description',
      'IP Address',
    ];

    const rows = logs.map((log) => [
      `"${log.id || ''}"`,
      `"${formatFullDate(log.created_at)}"`,
      `"${log.actor?.name || 'System / Guest'}"`,
      `"${log.actor?.email || ''}"`,
      `"${log.actor?.role || ''}"`,
      `"${log.action || ''}"`,
      `"${log.module || ''}"`,
      `"${log.target_table || ''}"`,
      `"${log.target_id || ''}"`,
      `"${(log.description || '').replace(/"/g, '""')}"`,
      `"${log.ip_address || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <FiActivity className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    System Activity Logs
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
                    <FiShield className="h-3 w-3" />
                    Admin Only
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive audit trail of operational and administrative actions across the platform.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                fetchLogs(true);
                fetchStats();
              }}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              title="Refresh logs"
            >
              <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              title="Export filtered logs as CSV"
            >
              <FiDownload className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Statistical Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Events
              </span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <FiActivity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.total ?? (loading ? '...' : 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Recorded since system initialization
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Today's Actions
              </span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <FiClock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.today ?? (loading ? '...' : 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Executed in the last 24 hours
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Past 7 Days
              </span>
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <FiCalendar className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.this_week ?? (loading ? '...' : 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Weekly audit activity volume
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Active Modules
              </span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <FiLayers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.modules ? stats.modules.length : (loading ? '...' : 0)}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Actively generating audit trails
            </div>
          </div>
        </div>

        {/* Search & Filters Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 items-center">
            {/* Search Input */}
            <div className="relative lg:col-span-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FiSearch className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, user, IP, or record ID..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-9 pr-8 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Module Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div className="lg:col-span-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                title="Filter From Date"
              />
            </div>

            {/* Date To & Reset */}
            <div className="flex items-center gap-2 lg:col-span-2">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                title="Filter To Date"
              />

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                  title="Clear all filters"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logs Table Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-4 py-3.5">
                    Timestamp
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    User / Actor
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Action
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Module
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Activity Description
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Inspect
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading && !refreshing ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="mt-1 h-3 w-16 rounded bg-gray-100 dark:bg-gray-750" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                          <div>
                            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="mt-1 h-3 w-32 rounded bg-gray-100 dark:bg-gray-750" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="ml-auto h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50">
                        <FiAlertCircle className="h-7 w-7 text-gray-400" />
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
                        No activity logs found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {hasActiveFilters
                          ? 'Try adjusting your search query, module, action, or date filters.'
                          : 'As actions are performed across the system, they will appear here.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <FiFilter className="h-3.5 w-3.5" />
                          Clear all filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const actionBadge = getActionColor(log.action);
                    const moduleBadge = getModuleColor(log.module);

                    return (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-750/50 cursor-pointer"
                        onClick={() => setInspectLog(log)}
                      >
                        {/* Timestamp */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatTimeAgo(log.created_at)}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {formatFullDate(log.created_at)}
                          </div>
                        </td>

                        {/* User / Actor */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-semibold text-white shadow-sm">
                              {log.actor?.name ? log.actor.name.charAt(0).toUpperCase() : <FiUser className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate font-medium text-gray-900 dark:text-white">
                                  {log.actor?.name || 'System / Unauthenticated'}
                                </span>
                                {log.actor?.role && (
                                  <span
                                    className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase ${
                                      log.actor.role === 'admin'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {log.actor.role}
                                  </span>
                                )}
                              </div>
                              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {log.actor?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${actionBadge}`}
                          >
                            {log.action}
                          </span>
                        </td>

                        {/* Module Badge */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${moduleBadge}`}
                          >
                            {log.module || log.target_table || 'General'}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3.5">
                          <div className="max-w-md">
                            <p className="line-clamp-2 text-sm text-gray-800 dark:text-gray-200">
                              {log.description || `${log.action} on ${log.module || log.target_table || 'system'}`}
                            </p>
                            {(log.target_table || log.target_id) && (
                              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                                {log.target_table && <span>Target: {log.target_table}</span>}
                                {log.target_id && <span>#{log.target_id}</span>}
                                {log.ip_address && <span className="ml-2 font-mono text-[10px]">IP: {log.ip_address}</span>}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Inspect Button */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectLog(log);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            title="Inspect full details"
                          >
                            <FiEye className="h-3.5 w-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>
                Showing <strong className="font-semibold text-gray-900 dark:text-white">{pagination.from || 0}</strong> to{' '}
                <strong className="font-semibold text-gray-900 dark:text-white">{pagination.to || 0}</strong> of{' '}
                <strong className="font-semibold text-gray-900 dark:text-white">{pagination.total}</strong> records
              </span>
              <span className="hidden sm:inline">|</span>
              <div className="flex items-center gap-1">
                <span>Rows:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <FiChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>

              <span className="px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                Page {pagination.current_page} of {pagination.last_page || 1}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page >= pagination.last_page || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span>Next</span>
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* INSPECT DETAIL MODAL */}
        {inspectLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <FiInfo className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Activity Inspection
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      Log ID: {inspectLog.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyJSON(inspectLog)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    title="Copy full JSON"
                  >
                    {copiedId ? (
                      <>
                        <FiCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="h-3.5 w-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setInspectLog(null)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Primary Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Action Performed
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getActionColor(
                          inspectLog.action
                        )}`}
                      >
                        {inspectLog.action}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Module / Scope
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getModuleColor(
                          inspectLog.module
                        )}`}
                      >
                        {inspectLog.module || 'General'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Timestamp
                    </span>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatFullDate(inspectLog.created_at)}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Target Entity
                    </span>
                    <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {inspectLog.target_table ? `${inspectLog.target_table}` : 'N/A'}
                      {inspectLog.target_id ? ` #${inspectLog.target_id}` : ''}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      IP Address
                    </span>
                    <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {inspectLog.ip_address || 'Unavailable'}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Performed By
                    </span>
                    <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                      {inspectLog.actor?.name || 'System'}
                      {inspectLog.actor?.role && (
                        <span className="ml-1.5 text-xs text-gray-500">
                          ({inspectLog.actor.role})
                        </span>
                      )}
                    </div>
                    {inspectLog.actor?.email && (
                      <div className="text-xs text-gray-400">{inspectLog.actor.email}</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Activity Narrative
                  </h4>
                  <div className="rounded-xl border border-gray-200 bg-white p-3.5 text-sm text-gray-800 shadow-xs dark:border-gray-800 dark:bg-gray-800/80 dark:text-gray-200">
                    {inspectLog.description || 'No descriptive text provided.'}
                  </div>
                </div>

                {/* Details Payload */}
                {inspectLog.details && Object.keys(inspectLog.details).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Context & Operational Details
                    </h4>
                    <pre className="max-h-56 overflow-auto rounded-xl border border-gray-200 bg-slate-900 p-4 text-xs font-mono text-emerald-400 dark:border-gray-800 shadow-inner">
                      {JSON.stringify(inspectLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Before / After Diff */}
                {(inspectLog.before || inspectLog.after) && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Field Modification Diff
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1 block">
                          Before Change
                        </span>
                        <pre className="max-h-48 overflow-auto rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-xs font-mono text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                          {inspectLog.before
                            ? JSON.stringify(inspectLog.before, null, 2)
                            : '(Empty / Not Recorded)'}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 block">
                          After Change
                        </span>
                        <pre className="max-h-48 overflow-auto rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-xs font-mono text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                          {inspectLog.after
                            ? JSON.stringify(inspectLog.after, null, 2)
                            : '(Empty / Not Recorded)'}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Agent */}
                {inspectLog.user_agent && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Client User-Agent
                    </h4>
                    <div className="break-all rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-600 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                      {inspectLog.user_agent}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-3.5 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => setInspectLog(null)}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActivityLogsPage;
