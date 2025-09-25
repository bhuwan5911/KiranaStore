import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Order } from '../types';
import { PackageSearch, CheckCircle, Truck, Package } from 'lucide-react';

const TrackingStep: React.FC<{ title: string, date: string, isCompleted: boolean, isFirst?: boolean }> = ({ title, date, isCompleted, isFirst = false }) => (
    <div className="flex items-start">
        <div className="flex flex-col items-center mr-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {title === 'Delivered' ? <CheckCircle size={20}/> : title === 'Shipped' ? <Truck size={20}/> : <Package size={20}/>}
            </div>
            {!isFirst && <div className={`w-0.5 h-16 mt-2 ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`}></div>}
        </div>
        <div>
            <h3 className={`font-semibold ${isCompleted ? 'text-primary' : 'text-gray-500'}`}>{title}</h3>
            {isCompleted && <p className="text-sm text-text-secondary">{date}</p>}
        </div>
    </div>
);

export const OrderTrackingPage: React.FC = () => {
    const { orderId: paramOrderId } = useParams<{ orderId?: string }>();
    const { orders } = useAppContext();
    const navigate = useNavigate();

    const [orderIdInput, setOrderIdInput] = useState(paramOrderId || '');
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');

    const findOrder = (idToFind: string) => {
        const numericId = parseInt(idToFind, 10);
        
        // Always reset state on a new find attempt
        setOrder(null);
        setError('');

        if (isNaN(numericId)) {
            setError('Invalid Order ID format.');
            return;
        }
        
        const foundOrder = orders.find(o => o.id === numericId);
        if (foundOrder) {
            setOrder(foundOrder);
        } else {
            setError('Order ID not found. It may still be processing, or you may need to log in to see it.');
        }
    }

    useEffect(() => {
        if(paramOrderId) {
            findOrder(paramOrderId);
        } else {
            // Clear results if URL has no order ID
            setOrder(null);
            setError('');
        }
    }, [paramOrderId, orders]);

    const handleTrackOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderIdInput) {
            setError('Please enter an Order ID.');
            return;
        }
        // Navigate to trigger the useEffect, which is the single source of truth for finding an order
        if (orderIdInput !== paramOrderId) {
            navigate(`/track-order/${orderIdInput}`);
        } else {
            // If the ID is the same, just re-run the find logic
            findOrder(orderIdInput);
        }
    };
    
    const statusLevels = ['Pending', 'Shipped', 'Delivered'];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <PackageSearch size={48} className="mx-auto text-primary" />
                <h1 className="text-4xl font-bold mt-4">Track Your Order</h1>
                <p className="text-text-secondary mt-2">Enter your order ID to see its current status and history.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mb-12">
                <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row items-stretch gap-4">
                    <Input
                        id="orderId"
                        placeholder="e.g., 12345"
                        value={orderIdInput}
                        onChange={e => setOrderIdInput(e.target.value)}
                        className="flex-grow"
                    />
                    <Button type="submit" className="flex-shrink-0">Track</Button>
                </form>
                {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
            </div>

            {order && (
                <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6">Order Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                        <div><p className="text-sm text-text-secondary">Order ID</p><p className="font-semibold">#{order.id}</p></div>
                        <div><p className="text-sm text-text-secondary">Order Date</p><p className="font-semibold">{order.date}</p></div>
                        <div><p className="text-sm text-text-secondary">Total Amount</p><p className="font-semibold">₹{order.totalAmount.toFixed(2)}</p></div>
                        <div><p className="text-sm text-text-secondary">Current Status</p><p className="font-bold text-primary">{order.status}</p></div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">Tracking History</h3>
                    <div className="flex justify-center">
                       <div className="flex flex-col-reverse">
                            {statusLevels.map((status, index) => {
                                const historyItem = order.trackingHistory.find(h => h.status === status) || (order.status === status ? { status: order.status, date: order.date } : null) ;
                                const isCompleted = statusLevels.indexOf(order.status) >= index;

                                return (
                                    <TrackingStep 
                                        key={status} 
                                        title={status} 
                                        date={historyItem?.date || ''} 
                                        isCompleted={isCompleted} 
                                        isFirst={index === statusLevels.length - 1}
                                    />
                                );
                            })}
                       </div>
                    </div>
                </div>
            )}
        </div>
    );
};