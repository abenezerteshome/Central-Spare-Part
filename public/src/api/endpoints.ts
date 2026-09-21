export const endpoints = {
  AUTH: {
    ADMIN_LOGIN: '/admin/login',
    ADMIN_ME: '/admin/me',
    LOGOUT: '/logout',
  },

  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    BLOCK: (id: string) => `/users/${id}/block`,
    UNBLOCK: (id: string) => `/users/${id}/unblock`,
    ROLE: (id: string) => `/users/${id}/role`,
    SEARCH: '/users/search',
    UPLOAD_PROFILE: '/user/upload-profile',
  },

  PARTS: {
    LIST: '/parts',
    DETAIL: (id: string) => `/parts/${id}`,
    CREATE: '/parts',
    UPDATE: (id: string) => `/parts/${id}`,
    DELETE: (id: string) => `/parts/${id}`,
  },

  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  BRANDS: {
    LIST: '/brands',
    DETAIL: (id: string) => `/brands/${id}`,
    CREATE: '/brands',
    UPDATE: (id: string) => `/brands/${id}`,
    DELETE: (id: string) => `/brands/${id}`,
  },

  AGENTS: {
    LIST: '/agents',
    DETAIL: (id: string) => `/agents/${id}`,
    CREATE: '/agents',
    UPDATE: (id: string) => `/agents/${id}`,
    DELETE: (id: string) => `/agents/${id}`,
  },

  SALES: {
    LIST: '/sales',
    DETAIL: (id: string) => `/sales/${id}`,
    CREATE: '/sales',
    STATUS: (id: string) => `/sales/${id}/status`,
  },

  INVENTORY: {
    INCREASE: '/inventory/increase',
    DECREASE: '/inventory/decrease',
    STOCKS: '/inventory/stocks',
    BY_PART: (partId: string) => `/inventory/part/${partId}`,
  },

  EXPENSES: {
    LIST: '/expenses',
    DETAIL: (id: string) => `/expenses/${id}`,
    CREATE: '/expenses',
    UPDATE: (id: string) => `/expenses/${id}`,
    DELETE: (id: string) => `/expenses/${id}`,
  },

  REPORTS: {
    SUMMARY: '/reports/summary',
    DAILY_SALES: '/reports/daily-sales',
    MONTHLY_PROFIT: '/reports/monthly-profit',
  },

  SEARCH: {
    GLOBAL: '/search',
  },

  SHELVES: {
    LIST: '/shelves',
    CREATE: '/shelves',
  },
};
