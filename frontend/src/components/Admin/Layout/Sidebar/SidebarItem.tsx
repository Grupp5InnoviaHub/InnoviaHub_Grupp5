import React from "react";
import { NavLink } from "react-router-dom";
import type { IconType } from "react-icons";

interface SidebarItemProps {
  item: {
    id: string;
    label: string;
    icon: string;
    path: string;
    badge?: number;
  };
  icon: IconType;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  icon: Icon,
  collapsed,
  onClick,
}) => {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }: { isActive: boolean }) =>
        `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon
              className={`w-5 h-5 ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
            />
          </div>

          {/* Label */}
          {!collapsed && <span className="ml-3 flex-1">{item.label}</span>}

          {/* Badge */}
          {item.badge && item.badge > 0 && !collapsed && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
