import React from 'react';
import { useAppContext } from '../context/AppContext';
import { StatCard } from '../components/admin/StatCard';
import { SalesChart } from '../components/admin/SalesChart';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const { orders, products, users } = useAppContext();

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.length;

    const recentOrders = orders.slice(0, 5);

    const getSalesDataForLast7Days = () => {
        const salesData: { name: string; sales: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toLocaleDateString('en-US', { weekday: 'short' });
            salesData.push({ name: dateString, sales: 0 });
        }

        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const diffDays = Math.ceil((new Date().getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
            
            if(diffDays <= 7) {
                const dayName = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
                const dayData = salesData.find(d => d.name === dayName);
                if(dayData) {
                    dayData.sales += order.totalAmount;
                }
            }
        });
        
        // Mock some data for previous days if orders are all recent
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        if(!salesData.find(d=> d.name !== today && d.sales > 0)) {
            salesData[0].sales = 450;
            salesData[1].sales = 1200;
            salesData[2].sales = 800;
            salesData[3].sales = 1500;
            salesData[4].sales = 950;
        }

        return salesData;
    };

    const salesData = getSalesDataForLast7Days();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
                    icon={<DollarSign className="text-teal-800"/>}
                    color="bg-teal-200"
                    gradient="bg-gradient-to-br from-teal-50 to-neutral-light"
                />
                <StatCard 
                    title="Total Orders" 
                    value={totalOrders} 
                    icon={<Package className="text-coral-800"/>}
                    color="bg-orange-200"
                    gradient="bg-gradient-to-br from-orange-50 to-neutral-light"
                />
                <StatCard 
                    title="Total Products" 
                    value={totalProducts} 
                    icon={<ShoppingBag className="text-yellow-800"/>}
                    color="bg-yellow-200"
                    gradient="bg-gradient-to-br from-yellow-50 to-neutral-light"
                />
                <StatCard 
                    title="Total Users" 
                    value={totalUsers} 
                    icon={<Users className="text-indigo-800"/>}
                    color="bg-indigo-200"
                    gradient="bg-gradient-to-br from-indigo-50 to-neutral-light"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-neutral-light p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Weekly Sales</h2>
                     <SalesChart data={salesData} />
                </div>
                <div className="bg-neutral-light p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-text-primary">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-neutral-dark">
                                <tr>
                                    <th className="text-left p-3 font-semibold text-text-secondary">Order ID</th>
                                    <th className="text-left p-3 font-semibold text-text-secondary">Total</th>
                                    <th className="text-left p-3 font-semibold text-text-secondary">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="border-b border-neutral-dark transition-colors hover:bg-teal-50">
                                        <td className="p-3 font-medium text-primary">{order.id}</td>
                                        <td className="p-3 font-semibold text-text-primary">₹{order.totalAmount.toFixed(2)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                order.status === 'Delivered' ? 'bg-teal-100 text-teal-800' :
                                                order.status === 'Shipped' ? 'bg-orange-100 text-orange-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};