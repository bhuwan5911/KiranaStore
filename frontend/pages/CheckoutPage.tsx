import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
// FIX: Import Loader for loading spinner
import { Loader } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  // FIX: Destructure finalTotal from context for accurate calculations
  const { cart, cartTotal, user, addToast, placeOrder, redeemPoints, finalTotal } = useAppContext();
  const navigate = useNavigate();
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  // FIX: Add isLoading state to manage UI during async operations
  const [isLoading, setIsLoading] = useState(false);

  const pointsValue = useMemo(() => Math.floor(pointsToRedeem / 100), [pointsToRedeem]); // 100 points = 1 Rupee
  // FIX: Calculate final total after loyalty points discount
  const finalTotalWithDiscount = useMemo(() => Math.max(0, finalTotal - pointsValue), [finalTotal, pointsValue]);
  
  if (cart.length === 0 && !isOrderPlaced) {
    navigate('/cart');
    return null;
  }
  
  // FIX: Convert to async function to handle promises from placeOrder and redeemPoints
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await placeOrder();
    
    if (!error) {
        await redeemPoints(pointsToRedeem);
        addToast('Order placed successfully!', 'success');
        setIsOrderPlaced(true);
    }
    // Error toast is handled within placeOrder
    setIsLoading(false);
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      // FIX: Use finalTotal from context for validation to ensure total doesn't go below zero
      if (user && value <= user.loyaltyPoints && (finalTotal - (value / 100)) >= 0) {
        setPointsToRedeem(value);
      }
  };

  if (isOrderPlaced) {
    return (
      <div className="text-center py-16 bg-green-50 rounded-lg">
        <h2 className="text-3xl font-bold text-primary mb-4">Thank You!</h2>
        <p className="text-xl text-text-primary mb-2">Your order has been placed successfully.</p>
        <p className="text-text-secondary mb-6">You will receive a confirmation email shortly.</p>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" id="name" type="text" defaultValue={user?.name} required />
                  <Input label="Email Address" id="email" type="email" defaultValue={user?.email} required />
                  <Input label="Phone Number" id="phone" type="tel" defaultValue={user?.phone} required />
                  <div className="sm:col-span-2">
                    <Input label="Shipping Address" id="address" type="text" defaultValue={user?.address} required />
                  </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3 p-4 border rounded-lg">
                <label className="flex items-center"><input type="radio" name="payment" className="mr-2" defaultChecked/> Cash on Delivery</label>

                <label className="flex items-center text-gray-400"><input type="radio" name="payment" className="mr-2" disabled/> Credit/Debit Card (Coming Soon)</label>
              </div>
            </div>
        </form>
        
        <div className="bg-neutral p-6 rounded-lg shadow-sm h-fit">
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

          {user && user.loyaltyPoints > 0 && (
            <div className="border-t mt-4 pt-4">
                <h3 className="text-lg font-semibold mb-2">Redeem Loyalty Points</h3>
                <p className="text-sm text-text-secondary mb-2">You have {user.loyaltyPoints} points. (100 points = ₹1)</p>
                <div className="flex flex-col">
                    <input 
                        type="range" 
                        min="0" 
                        max={Math.min(user.loyaltyPoints, cartTotal * 100)}
                        step="100"
                        value={pointsToRedeem}
                        onChange={handlePointsChange}
                        className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                        <span>0</span>
                        <span>{Math.min(user.loyaltyPoints, cartTotal * 100)}</span>
                    </div>
                </div>
                <p className="text-center font-semibold mt-2">Redeeming {pointsToRedeem} points for a discount of ₹{pointsValue.toFixed(2)}</p>
            </div>
          )}

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{finalTotal.toFixed(2)}</span></div>
            {pointsValue > 0 && <div className="flex justify-between text-green-600"><span>Loyalty Discount</span><span>- ₹{pointsValue.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{finalTotalWithDiscount.toFixed(2)}</span>
            </div>
            <Button size="lg" className="w-full mt-6" onClick={handlePlaceOrder} disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};