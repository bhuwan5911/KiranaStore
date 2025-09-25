import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/Button';

interface ProductCardProps {
  product: Product;
  style?: React.CSSProperties;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, style }) => {
  const { cart, addToCart, updateQuantity, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useAppContext();
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const cartItem = cart.find(item => item.id === product.id);

  return (
    <div 
      className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 group hover:-translate-y-1 relative"
      style={style}
    >
      <button
          onClick={() => toggleCompare(product)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${inCompare ? 'bg-primary text-white shadow-md' : 'bg-white/70 text-gray-600 hover:bg-white'}`}
          aria-label={inCompare ? "Remove from Compare" : "Add to Compare"}
          title={inCompare ? "Remove from Compare" : "Add to Compare"}
        >
          {inCompare ? <Check size={20} /> : <Plus size={20} />}
      </button>

      <Link to={`/product/${product.id}`} className="block overflow-hidden p-4 bg-neutral rounded-t-3xl">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-5">
        <p className="text-sm text-text-secondary capitalize">{product.category.replace('-', ' & ')}</p>
        <h3 className="text-lg font-bold text-text-primary truncate h-7 my-1">{product.name}</h3>
        
        <div className="flex justify-between items-center mt-4">
          <p className="text-2xl font-extrabold text-brand-black">₹{product.price.toFixed(2)}</p>
           <button
              onClick={() => toggleWishlist(product)}
              className={`p-2 rounded-full transition-all active:scale-125 ${inWishlist ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:bg-gray-100'}`}
              aria-label="Toggle Wishlist"
            >
              <Heart size={22} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
        </div>
         <div className="mt-4">
            {product.stock > 0 ? (
                cartItem ? (
                    <div className="flex items-center justify-between border-2 border-brand-black rounded-full text-brand-black font-bold h-12 w-full">
                        <button 
                            onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} 
                            className="px-4 h-full rounded-l-full hover:bg-black/10 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={18} />
                        </button>
                        <span className="px-3 text-lg">{cartItem.quantity}</span>
                        <button 
                            onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= product.stock}
                            className="px-4 h-full rounded-r-full hover:bg-black/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                ) : (
                    <Button onClick={() => addToCart(product)} size="md" className="w-full h-12">
                        <ShoppingCart size={20} className="mr-2"/> Add to Cart
                    </Button>
                )
            ) : (
                <Button size="md" disabled className="w-full h-12">
                    Out of Stock
                </Button>
            )}
          </div>
      </div>
    </div>
  );
};