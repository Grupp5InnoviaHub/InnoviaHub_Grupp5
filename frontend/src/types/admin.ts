// Admin Dashboard Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  totalBookings: number;
  activeBookings: number;
}

export interface Resource {
  resourceId: number;
  name: string;
  resourceTypeId: number;
  resourceTypeName: string;
  isBooked: boolean;
  totalBookings: number;
  activeBookings: number;
  lastBookingDate?: string;
}

export interface ResourceType {
  resourceTypeId: number;
  name: string;
}

export interface Booking {
  bookingId: number;
  userId: string;
  userName: string;
  userEmail: string;
  resourceId: number;
  resourceName: string;
  resourceTypeName: string;
  bookingDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  duration: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalResources: number;
  availableResources: number;
  totalBookings: number;
  activeBookings: number;
  recentUsers: User[];
  recentBookings: Booking[];
  bookingStats: BookingStats;
}

export interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingDuration: number;
  mostPopularResourceId: number;
  mostPopularResourceName: string;
  bookingsByResourceType: Record<string, number>;
  bookingsByMonth: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchFilters {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UserSearchFilters extends SearchFilters {
  role?: string;
  isActive?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

export interface BookingSearchFilters extends SearchFilters {
  resourceId?: number;
  userId?: string;
  isActive?: boolean;
  bookingFrom?: string;
  bookingTo?: string;
}

// Form Types
export interface CreateUserForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  role: string;
  isActive: boolean;
}

export interface UpdateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface CreateResourceForm {
  name: string;
  resourceTypeId: number;
}

export interface UpdateResourceForm {
  name: string;
  resourceTypeId: number;
}

export interface CreateResourceTypeForm {
  name: string;
}


// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: NavItem[];
  badge?: number;
}

// Theme Types
export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  secondaryColor: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Table Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface TableAction<T> {
  label: string;
  icon: string;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Filter Types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}


