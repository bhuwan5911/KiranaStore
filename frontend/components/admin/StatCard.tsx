import React from 'react';

// BADLAV: icon ka type 'React.ReactNode' kar diya gaya hai taaki woh bana-banaya icon le sake
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode; 
  color: string;
  gradient: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon, // BADLAV: Ab hum ise rename nahi karenge
  color,
  gradient
}) => {
  return (
    // BADLAV: 'gradient' class ka istemal kiya gaya hai
    <div className={`p-6 rounded-2xl shadow-soft ${gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-3xl font-bold text-text-primary mt-1">{value}</p>
        </div>
        {/* BADLAV: 'color' class ka istemal kiya gaya hai aur icon ko direct render kiya gaya hai */}
        <div className={`p-4 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

