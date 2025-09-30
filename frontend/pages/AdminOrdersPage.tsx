// frontend/src/pages/AdminOrdersPage.tsx (New File)

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { Order } from '../types'; // Assuming you have an Order type in your types file

export const AdminOrdersPage: React.FC = () => {
    const { orders } = useAppContext();
    const [currentPage, setCurrentPage] = useState(1);  
    const ordersPerPage = 15;

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const getStatusBadgeClass = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center mb-6">
                <Link to="/admin">
                    <Button variant="outline" size="sm" className="mr-4">
                        <ArrowLeft size={16} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">All Orders</h1>
                <span className="ml-3 bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {orders.length} total
                </span>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map(order => (
                                <tr key={order._id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-primary">#{order._id.slice(-6)}</td>
                                    <td className="px-6 py-4 text-gray-700">{order.userName}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-right">₹{order.totalAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {/* Pagination Controls */}
                 <div className="flex justify-between items-center mt-4 px-6 py-3">
                    <span className="text-sm text-gray-600">
                        Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            Previous
                        </Button>
                        <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};