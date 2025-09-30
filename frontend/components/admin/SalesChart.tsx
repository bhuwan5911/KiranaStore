import React from 'react';
import { 
    BarChart, Bar, 
    LineChart, Line, 
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface SalesChartProps {
    data: { name: string; sales: number }[];
    type: 'bar' | 'line' | 'pie'; // Naya prop chart type ke liye
}

// Pie chart ke liye alag-alag colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF5733'];

export const SalesChart: React.FC<SalesChartProps> = ({ data, type }) => {

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #ddd' }} formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']} />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Line type="monotone" dataKey="sales" stroke="#FFA500" strokeWidth={2} activeDot={{ r: 8 }} name="Sales" />
                    </LineChart>
                );
            case 'pie':
                // Pie chart ke liye sirf woh data lein jismein sales 0 se zyada ho
                const pieData = data.filter(item => item.sales > 0);
                if (pieData.length === 0) {
                    return <p className="text-center text-gray-500 h-full flex items-center justify-center">No sales data to display in Pie Chart for this period.</p>;
                }
                return (
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="sales"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']} />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                    </PieChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 165, 0, 0.1)' }}
                            contentStyle={{ borderRadius: '10px', border: '1px solid #ddd' }}
                            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="sales" fill="#FFA500" radius={[4, 4, 0, 0]} name="Sales" />
                    </BarChart>
                );
        }
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
        </ResponsiveContainer>
    );
};

