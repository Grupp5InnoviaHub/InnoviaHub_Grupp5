import React from "react";
import type { IconType } from "react-icons";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: IconType;
  color: "blue" | "green" | "gray";
  description: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      iconBg: "bg-green-100",
    },
    gray: {
      bg: "bg-gray-50",
      icon: "text-gray-600",
      iconBg: "bg-gray-100",
    },
  };

  const changeColorClasses = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  const colors = colorClasses[color];

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.iconBg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>

          {/* Change Indicator */}
          <div
            className={`flex items-center space-x-1 text-sm font-medium ${changeColorClasses[changeType]}`}
          >
            {changeType === "positive" && <MdTrendingUp className="w-4 h-4" />}
            {changeType === "negative" && (
              <MdTrendingDown className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
