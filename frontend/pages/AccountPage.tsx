import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input'; // Input component ko import karein
import { Package, Edit, X } from 'lucide-react'; // Edit aur X icons ko import karein
import { User } from '../types'; // User type ko import karein

// FIX 1: Naya Profile Edit Modal component banaya gaya hai
const ProfileEditModal = ({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (data: Partial<User>) => Promise<void> }) => {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [address, setAddress] = useState(user.address || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ name, phone, address });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-9 w-9 p-0">
                        <X size={20} />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                    <Input 
                        label="Phone Number" 
                        type="tel"
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        required 
                    />
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-1">Shipping Address</label>
                        <textarea 
                            id="address"
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const AccountPage: React.FC = () => {
  // FIX 2: updateUserProfile function ko context se lein
  const { user, logout, orders, updateUserProfile } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal ke liye state

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileSave = async (data: Partial<User>) => {
    await updateUserProfile(data);
    setIsModalOpen(false); // Save hone ke baad modal band karein
  };
  
  const getStatusBadgeClass = (status: 'Pending' | 'Shipped' | 'Delivered') => {
    // ... (existing function is fine)
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-text-primary sr-only">My Account</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-8 animate-slide-in-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                {/* FIX 3: Edit button add kiya gaya hai */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-text-primary">Profile Information</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
                        <Edit size={16} className="mr-2"/> Edit
                    </Button>
                </div>
                <div className="space-y-3 text-text-secondary">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                    <p><strong>Address:</strong> {user.address || 'Not provided'}</p>
                </div>
                <Button onClick={logout} variant="danger" className="w-full mt-6">Logout</Button>
            </div>

            {/* FIX 4: Loyalty Points card ko hata diya gaya hai */}
            {/* The loyalty points card was here */}
        </div>

        {/* Right Content - Order History */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6 text-text-primary">Order History</h2>
          <div className="space-y-6">
            {orders.length > 0 ? orders.map((order, index) => (
              <div 
                key={order._id} 
                className="bg-white p-6 rounded-lg shadow-sm border animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms`}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-text-secondary">Date: {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  {/* Status badge abhi ke liye rehne diya hai, aap isse hata sakte hain agar zaroorat na ho */}
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {order.items.slice(0, 8).map(item => (
                    <img key={item.id} src={item.imageUrl} alt={item.name} title={`${item.name} (x${item.quantity})`} className="w-14 h-14 rounded-md object-cover border"/>
                  ))}
                  {order.items.length > 8 && 
                    <div className="w-14 h-14 rounded-md bg-gray-200 flex items-center justify-center text-sm font-bold text-text-secondary">
                      +{order.items.length - 8}
                    </div>
                  }
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                    <p className="font-semibold text-lg text-text-primary">Order ID: <span className="font-bold text-primary">#{order._id.slice(-6)}</span></p>
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
      
      {/* FIX 5: Modal ko conditionally render karein */}
      {isModalOpen && user && (
        <ProfileEditModal 
            user={user} 
            onClose={() => setIsModalOpen(false)}
            onSave={handleProfileSave}
        />
      )}
    </div>
  );
};
