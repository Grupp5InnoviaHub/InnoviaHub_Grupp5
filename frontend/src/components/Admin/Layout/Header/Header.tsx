import React from "react";
import { MdMenu, MdAccountCircle, MdLogout } from "react-icons/md";
import { useAdminAuth } from "../../../../context/AdminAuthProvider";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <MdMenu className="w-5 h-5" />
          </button>

          {/* Page Title */}
          <h1 className="text-lg font-medium text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* User Info */}
          <div className="flex items-center space-x-2 p-2 rounded-lg text-gray-600">
            <MdAccountCircle className="w-6 h-6" />
            <span className="hidden md:block text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <MdLogout className="w-5 h-5" />
            <span className="hidden md:block text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
