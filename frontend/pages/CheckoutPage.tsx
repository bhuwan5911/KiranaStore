import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const CheckoutPage: React.FC = () => {
  // ✅ FIX 1: 'placeOrder' ko yahan se hata dein, kyunki ab iski zaroorat nahi
  const { cart, user, addToast, finalTotal } = useAppContext();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');

  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      addToast("Your cart is empty.", "info");
      navigate('/cart');
    }
  }, [cart, navigate, addToast, isProcessing]);

  const handlePayment = async () => {
    if (!user) {
        addToast('Please login to proceed.', 'error');
        navigate('/login');
        return;
    }
    if (!shippingAddress.trim()) {
        addToast('Please enter a valid shipping address.', 'error');
        return;
    }
    
    setIsProcessing(true);

    try {
        const token = localStorage.getItem('token');
        const orderRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: finalTotal }),
        });
        
        if (!orderRes.ok) {
            const err = await orderRes.json();
            throw new Error(err.message || 'Failed to create Razorpay order.');
        }
        
        const orderData = await orderRes.json();
        
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: "INR",
            name: "Shophub",
            description: "Kirana Store Transaction",
            image: '/favicon.svg',
            order_id: orderData.id,
            
            handler: async function (response: any) {
                const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

                // --- Payment ko backend par verify karein (Backend hi ab order create karega) ---
                const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/verify`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        razorpay_payment_id, 
                        razorpay_order_id, 
                        razorpay_signature,
                        cart,
                        shippingAddress
                    }),
                });
                
                if (!verifyRes.ok) throw new Error("Payment verification failed.");
                
                // ✅ FIX 2: 'placeOrder' call ko yahan se hata diya gaya hai
                addToast('Order placed successfully!', 'success');
                navigate('/account'); // User ko account page par bhej dein
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: user.phone
            },
            notes: {
                address: shippingAddress
            },
            theme: {
                color: "#FFA500"
            }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
        
        rzp.on('payment.failed', function (response: any) {
            addToast(`Payment failed: ${response.error.description}`, 'error');
            setIsProcessing(false);
        });

    } catch (error: any) {
        addToast(error.message || 'An error occurred during payment.', 'error');
        setIsProcessing(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" id="name" type="text" value={user?.name || ''} required disabled/>
                  <Input label="Email Address" id="email" type="email" value={user?.email || ''} required disabled/>
                  <Input label="Phone Number" id="phone" type="tel" value={user?.phone || ''} required disabled/>
                  <div className="sm:col-span-2">
                    <Input 
                        label="Shipping Address" 
                        id="address" 
                        type="text" 
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter your full delivery address"
                        required 
                    />
                  </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3 p-4 border rounded-lg bg-white shadow-sm">
                <label className="flex items-center"><input type="radio" name="payment" className="mr-2" defaultChecked/> Online Payment (Razorpay)</label>
              </div>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4">Your Order</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {cart.map(item => (
                <div key={item.id} className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
            <Button size="lg" className="w-full mt-6" onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? <Loader className="animate-spin" /> : `Pay ₹${finalTotal.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};