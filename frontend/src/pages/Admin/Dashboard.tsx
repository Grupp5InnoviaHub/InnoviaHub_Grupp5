import React from "react";
import { useDashboardStats } from "../../hooks/useApi";
import StatsCards from "../../components/Admin/Dashboard/StatsCards/StatsCards";
import { useAdminAuth } from "../../context/AdminAuthProvider";

const Dashboard: React.FC = () => {
  const { user } = useAdminAuth();
  const { data: dashboardStats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName}! Here's what's happening with your
              system.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <StatsCards dashboardStats={dashboardStats} />
      </div>
    </div>
  );
};

export default Dashboard;
