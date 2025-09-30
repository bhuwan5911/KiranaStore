import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft p-5 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {change && (
             <p className={`text-xs mt-1 font-semibold ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
               {change}
             </p>
          )}
        </div>
        <div className="bg-primary/10 text-primary p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};