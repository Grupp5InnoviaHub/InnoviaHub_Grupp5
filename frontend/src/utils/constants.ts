// Admin Dashboard Constants

// API Configuration
export const API_BASE_URL = 'http://localhost:5296/api';
export const ADMIN_API_BASE_URL = API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  
  // Admin - Users
  USERS: '/admin/users',
  USER_BY_ID: (id: string) => `/admin/users/${id}`,
  USER_ROLE: (id: string) => `/admin/users/${id}/role`,
  USER_STATUS: (id: string) => `/admin/users/${id}/status`,
  
  // Admin - Resources
  RESOURCES: '/admin/resources',
  RESOURCE_BY_ID: (id: number) => `/admin/resources/${id}`,
  RESOURCE_TYPES: '/admin/resource-types',
  RESOURCE_TYPE_BY_ID: (id: number) => `/admin/resource-types/${id}`,
  
  // Admin - Bookings
  BOOKINGS: '/admin/bookings',
  BOOKING_BY_ID: (id: number) => `/admin/bookings/${id}`,
  BOOKING_CANCEL: (id: number) => `/admin/bookings/${id}/cancel`,
  BOOKING_STATS: '/admin/bookings/stats',
  
  // Admin - Dashboard
  DASHBOARD: '/admin/dashboard',
  
  // Admin - System
  SYSTEM_CLEANUP: '/admin/system/cleanup',
  SYSTEM_LOGS: '/admin/system/logs',
} as const;

// Navigation Items
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'MdDashboard',
    path: '/admin/dashboard',
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'MdPeople',
    path: '/admin/users',
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: 'MdEvent',
    path: '/admin/bookings',
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: 'MdBusiness',
    path: '/admin/resources',
  },
] as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'SuperAdmin',
  MEMBER: 'Member',
} as const;

// Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  DEFAULT_SORT_DIRECTION: 'desc' as const,
} as const;


// Status Colors
export const STATUS_COLORS = {
  ACTIVE: '#10B981',
  INACTIVE: '#6B7280',
  PENDING: '#F59E0B',
  CANCELLED: '#EF4444',
  COMPLETED: '#3B82F6',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  TIME_ONLY: 'HH:mm',
  DATE_ONLY: 'yyyy-MM-dd',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'admin-theme',
  USER_PREFERENCES: 'admin-user-preferences',
  TABLE_SETTINGS: 'admin-table-settings',
  DASHBOARD_LAYOUT: 'admin-dashboard-layout',
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_MISMATCH: 'Passwords do not match',
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  RESOURCE_CREATED: 'Resource created successfully',
  RESOURCE_UPDATED: 'Resource updated successfully',
  RESOURCE_DELETED: 'Resource deleted successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  USER_ROLE: USER_ROLES.MEMBER,
  USER_STATUS: true,
  PAGE_SIZE: TABLE_CONFIG.DEFAULT_PAGE_SIZE,
  SORT_DIRECTION: TABLE_CONFIG.DEFAULT_SORT_DIRECTION,
  THEME: 'light' as const,
} as const;
