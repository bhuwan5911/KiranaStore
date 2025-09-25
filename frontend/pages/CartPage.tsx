import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, deliveryCharge, discount, finalTotal, user } = useAppContext();
  const navigate = useNavigate();
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const [highlightClass, setHighlightClass] = useState('');
  const totalRef = useRef(finalTotal);

  useEffect(() => {
    if (totalRef.current !== finalTotal) {
      setHighlightClass('animate-highlight');
      const timer = setTimeout(() => setHighlightClass(''), 800); // Animation duration
      totalRef.current = finalTotal;
      return () => clearTimeout(timer);
    }
  }, [finalTotal]);

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-text-primary">Your cart is empty</h2>
        <p className="text-text-secondary mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products/all">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-text-primary">Shopping Cart</h1>
        <p className="text-lg text-text-secondary">{cartItemCount} {cartItemCount > 1 ? 'Items' : 'Item'}</p>
      </div>

      <div className="space-y-4">
        {cart.map((item, index) => (
          <div 
            key={item.id} 
            className="bg-white rounded-lg shadow-md flex items-center p-4 animate-slide-in-up"
            style={{ animationDelay: `${index * 75}ms`}}
          >
            <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md mr-6" />
            <div className="flex-grow">
              <Link to={`/product/${item.id}`} className="font-bold text-xl text-text-primary hover:text-primary transition-colors">{item.name}</Link>
              <p className="text-md text-text-secondary mt-1">₹{item.price.toFixed(2)} / unit</p>
              <button onClick={() => removeFromCart(item.id)} className="mt-2 flex items-center text-sm text-red-500 hover:text-red-700 transition-colors">
                <Trash2 size={16} className="mr-1" /> Remove
              </button>
            </div>
            
            <div className="flex items-center border border-gray-300 rounded-md mx-6">
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                className="p-3 text-gray-600 hover:bg-gray-100 rounded-l-md transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <span className="px-5 font-semibold text-lg text-text-primary min-w-[60px] text-center">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="p-3 text-gray-600 hover:bg-gray-100 rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>

            <p className="font-bold text-xl text-text-primary w-28 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md animate-slide-in-up" style={{ animationDelay: `${cart.length * 75 + 100}ms` }}>
        <h2 className="text-2xl font-bold text-text-primary mb-6 border-b pb-4">Order Summary</h2>
        <div className="space-y-3 text-text-primary text-lg">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal ({cartItemCount} items)</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Delivery Charges</span>
            <span>{deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-4 mt-4 flex justify-between font-bold text-2xl">
            <span>Total</span>
            <span className={`p-1 rounded-md ${highlightClass}`}>₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>
        <Button size="lg" className="w-full mt-6" onClick={() => navigate(user ? '/checkout' : '/login')}>
          Proceed to Checkout
        </Button>
        <button onClick={() => navigate('/products/all')} className="w-full mt-3 flex items-center justify-center text-primary hover:text-teal-700 font-semibold transition-colors">
          <ArrowLeft size={18} className="mr-2"/> Continue Shopping
        </button>
      </div>
    </div>
  );
};