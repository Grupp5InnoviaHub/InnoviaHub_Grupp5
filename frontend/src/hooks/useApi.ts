import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { 
  UserSearchFilters,
  BookingSearchFilters,
  CreateUserForm,
  UpdateUserForm,
  CreateResourceForm,
  UpdateResourceForm
} from '../types/admin';
import toast from 'react-hot-toast';

// Query Keys
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  users: (filters?: UserSearchFilters) => ['users', filters] as const,
  user: (id: string) => ['user', id] as const,
  resources: ['resources'] as const,
  resource: (id: number) => ['resource', id] as const,
  bookings: (filters?: BookingSearchFilters) => ['bookings', filters] as const,
  booking: (id: number) => ['booking', id] as const,
  bookingStats: ['bookingStats'] as const,
  systemLogs: ['systemLogs'] as const,
};

// Dashboard Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      try {
        const response = await apiService.getDashboardStats();
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      } catch (error) {
        // Fallback to mock data if API is not available
        console.warn('API not available, using mock data:', error);
        return {
          totalUsers: 1234,
          activeUsers: 1100,
          totalBookings: 2156,
          activeBookings: 89,
          totalResources: 45,
          availableResources: 42,
          bookingStats: {
            totalBookings: 2156,
            activeBookings: 89,
            completedBookings: 1956,
            cancelledBookings: 111,
            averageBookingDuration: 90,
            mostPopularResourceId: 1,
            mostPopularResourceName: 'Meeting Room A',
            bookingsByMonth: {
              'Jan': 45,
              'Feb': 52,
              'Mar': 48,
              'Apr': 61,
              'May': 55,
              'Jun': 67,
              'Jul': 72,
              'Aug': 68,
              'Sep': 74,
              'Oct': 79,
              'Nov': 82,
              'Dec': 89,
            },
            bookingsByResourceType: {
              'Meeting Room': 1200,
              'Conference Room': 800,
              'Desk': 156,
            }
          },
          recentUsers: [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              role: 'Member',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              roles: ['Member'],
              totalBookings: 5,
              activeBookings: 1,
            },
            {
              id: '2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
              role: 'Member',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              roles: ['Member'],
              totalBookings: 3,
              activeBookings: 0,
            }
          ],
          recentBookings: [
            {
              bookingId: 1,
              userId: '1',
              userEmail: 'john@example.com',
              userName: 'John Doe',
              resourceId: 1,
              resourceName: 'Meeting Room A',
              resourceTypeName: 'Meeting Room',
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              bookingDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
              status: 'Active',
              isActive: true,
              duration: '60',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              bookingId: 2,
              userId: '2',
              userEmail: 'jane@example.com',
              userName: 'Jane Smith',
              resourceId: 2,
              resourceName: 'Conference Hall',
              resourceTypeName: 'Conference Room',
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              bookingDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
              status: 'Active',
              isActive: true,
              duration: '120',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ]
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// User Hooks
export const useUsers = (filters?: UserSearchFilters) => {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: async () => {
      const response = await apiService.getUsers(filters);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: async () => {
      const response = await apiService.getUserById(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      const response = await apiService.createUser(userData);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: UpdateUserForm }) => {
      const response = await apiService.updateUser(id, userData);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiService.deleteUser(id);
      // Handle both ApiResponse format and simple message format
      if (response.success === false) {
        throw new Error(response.message);
      }
      // If success is true or undefined (for simple message format), consider it successful
      return response.data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await apiService.updateUserRole(id, role);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiService.updateUserStatus(id, isActive);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success(`User ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Resource Hooks
export const useResources = (page: number = 1, pageSize: number = 100) => {
  return useQuery({
    queryKey: [...queryKeys.resources, page, pageSize],
    queryFn: async () => {
      const response = await apiService.getResources(page, pageSize);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useResource = (id: number) => {
  return useQuery({
    queryKey: queryKeys.resource(id),
    queryFn: async () => {
      const response = await apiService.getResourceById(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (resourceData: CreateResourceForm) => {
      const response = await apiService.createResource(resourceData);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Resource created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, resourceData }: { id: number; resourceData: UpdateResourceForm }) => {
      const response = await apiService.updateResource(id, resourceData);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.resource(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Resource updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.deleteResource(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Resource deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useResourceTypes = () => {
  return useQuery({
    queryKey: ['resourceTypes'],
    queryFn: async () => {
      const response = await apiService.getResourceTypes();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Booking Hooks
export const useBookings = (filters?: BookingSearchFilters) => {
  return useQuery({
    queryKey: queryKeys.bookings(filters),
    queryFn: async () => {
      const response = await apiService.getBookings(filters);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useBooking = (id: number) => {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: async () => {
      const response = await apiService.getBookingById(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiService.cancelBooking(bookingId);
      // Backend returns string "Success" on success
      if (response === "Success") {
        return response;
      }
      // If it's an error response
      throw new Error(response || 'Failed to cancel booking');
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('Booking cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: queryKeys.bookingStats,
    queryFn: async () => {
      const response = await apiService.getBookingStats();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// System Hooks
export const useSystemCleanup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiService.cleanupSystem();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success('System cleanup completed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useSystemLogs = () => {
  return useQuery({
    queryKey: queryKeys.systemLogs,
    queryFn: async () => {
      const response = await apiService.getSystemLogs();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};
