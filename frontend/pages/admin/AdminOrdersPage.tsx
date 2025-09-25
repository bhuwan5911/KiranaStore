import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
    const { orders, updateOrderStatus } = useAppContext();

    // FIX: Changed orderId type from string to number to match context function signature
    const handleStatusChange = (orderId: number, newStatus: Order['status']) => {
        updateOrderStatus(orderId, newStatus);
    };

    return (
        <div className="bg-neutral-light p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-text-primary">Manage Orders</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-dark">
                        <tr>
                            <th className="text-left p-3 font-semibold text-text-secondary">Order ID</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Customer</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Date</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Total</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-b border-neutral-dark transition-colors hover:bg-teal-50">
                                <td className="p-3 font-medium text-primary">#{order.id}</td>
                                <td className="p-3 text-text-primary">{order.userName}</td>
                                <td className="p-3 text-text-secondary">{order.date}</td>
                                <td className="p-3 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                                <td className="p-3">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                        className={`p-2 rounded-md border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
                                            order.status === 'Delivered' ? 'bg-teal-100 border-teal-300 text-teal-800' :
                                            order.status === 'Shipped' ? 'bg-orange-100 border-orange-300 text-orange-800' :
                                            'bg-yellow-100 border-yellow-300 text-yellow-800'
                                        }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
