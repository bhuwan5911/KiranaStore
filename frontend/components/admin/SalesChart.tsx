import React from 'react';

// Simple chart component without external dependencies
const mockData = [
  { month: 'Jan', sales: 4000, orders: 240 },
  { month: 'Feb', sales: 3000, orders: 139 },
  { month: 'Mar', sales: 2000, orders: 980 },
  { month: 'Apr', sales: 2780, orders: 390 },
  { month: 'May', sales: 1890, orders: 480 },
  { month: 'Jun', sales: 2390, orders: 380 },
  { month: 'Jul', sales: 3490, orders: 430 },
];

interface SalesChartProps {
  title?: string;
  data?: Array<{
    month: string;
    sales: number;
    orders: number;
  }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ 
  title = "Sales Overview", 
  data = mockData 
}) => {
  const maxSales = Math.max(...data.map(d => d.sales));
  const maxOrders = Math.max(...data.map(d => d.orders));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Simple bar chart representation */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-12 text-sm text-gray-600">{item.month}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div 
                  className="bg-blue-500 h-4 rounded"
                  style={{ width: `${(item.sales / maxSales) * 100}%`, minWidth: '20px' }}
                ></div>
                <span className="text-xs text-gray-500">${item.sales}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="bg-green-500 h-4 rounded"
                  style={{ width: `${(item.orders / maxOrders) * 100}%`, minWidth: '20px' }}
                ></div>
                <span className="text-xs text-gray-500">{item.orders} orders</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center mt-6 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Sales ($)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Orders</span>
        </div>
      </div>
    </div>
  );
};