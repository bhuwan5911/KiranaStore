import React from 'react';
import { useAppContext } from "../context/AppContext";
import { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
    const { orders, updateOrderStatus } = useAppContext();

    const handleStatusChange = (orderId: any, newStatus: Order['status']) => {
        updateOrderStatus(orderId, newStatus);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft">
            <h1 className="text-2xl font-bold mb-6 text-text-primary">Manage Orders</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
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
                            // --- BADLAV: key aur handleStatusChange mein order._id istemal karein ---
                            <tr key={order._id} className="border-b border-gray-200 transition-colors hover:bg-gray-50">
                                <td className="p-3 font-medium text-primary">#{order._id.slice(-6)}</td>
                                <td className="p-3 text-text-primary">{order.userName}</td>
                                <td className="p-3 text-text-secondary">{new Date(order.date).toLocaleDateString()}</td>
                                <td className="p-3 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                                <td className="p-3">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value as Order['status'])}
                                        className={`p-2 rounded-md border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
                                            order.status === 'Delivered' ? 'bg-green-100 border-green-300 text-green-800' :
                                            order.status === 'Shipped' ? 'bg-blue-100 border-blue-300 text-blue-800' :
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