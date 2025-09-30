// frontend/src/pages/AccountPage.js - Corrected Code

import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Gift, Package } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, logout, orders } = useAppContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const getStatusBadgeClass = (status: 'Pending' | 'Shipped' | 'Delivered') => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-text-primary sr-only">My Account</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-8 animate-slide-in-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-text-primary">Profile Information</h2>
              <div className="space-y-3 text-text-secondary">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Address:</strong> {user.address}</p>
              </div>
              <Button onClick={logout} variant="danger" className="w-full mt-6">Logout</Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center mb-3">
                    <Gift className="text-primary mr-3" size={28}/>
                    <h2 className="text-2xl font-semibold text-text-primary">Loyalty Points</h2>
                </div>
                <p className="text-5xl font-bold text-primary">{user.loyaltyPoints}</p>
                <p className="text-text-secondary mt-2">Points to redeem on your next order.</p>
            </div>
        </div>

        {/* Right Content - Order History */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6 text-text-primary">Order History</h2>
          <div className="space-y-6">
            {orders.length > 0 ? orders.map((order, index) => (
              <div 
                // FIX 1: Use the unique '_id' from MongoDB for the key
                key={order._id} 
                className="bg-white p-6 rounded-lg shadow-sm border animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms`}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-text-secondary">Date: {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {order.items.slice(0, 8).map(item => (
                    <img 
                      key={item.id} 
                      src={item.imageUrl} 
                      alt={item.name} 
                      title={`${item.name} (x${item.quantity})`} 
                      className="w-14 h-14 rounded-md object-cover border"
                    />
                  ))}
                  {order.items.length > 8 && 
                    <div className="w-14 h-14 rounded-md bg-gray-200 flex items-center justify-center text-sm font-bold text-text-secondary">
                      +{order.items.length - 8}
                    </div>
                  }
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                    {/* FIX 2: Display the correct order '_id' */}
                    <p className="font-semibold text-lg text-text-primary">Order ID: <span className="font-bold text-primary">#{order._id.slice(-6)}</span></p>
                    {/* FIX 3: Link to the correct order '_id' */}
                    <Link to={`/track-order/${order._id}`}>
                        <Button size="md" variant="ghost" className="border-2 border-primary hover:bg-primary/10">
                            <Package size={18} className="mr-2" /> Track Order
                        </Button>
                    </Link>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <p className="text-text-secondary">You haven't placed any orders yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};