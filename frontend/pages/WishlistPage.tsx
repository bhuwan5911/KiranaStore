import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { HeartCrack, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const WishlistPage: React.FC = () => {
  // Yeh pehle se hi AppContext use kar raha hai, isliye ismein koi badlav nahi. Bilkul sahi hai!
  const { wishlist, addWishlistToCart } = useAppContext();

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16 animate-slide-in-up">
        <HeartCrack size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-text-secondary mb-6">Explore products and save your favorites here.</p>
        <Link to="/products/all">
          <Button>Explore Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-slide-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <Button onClick={addWishlistToCart}>
            <ShoppingCart className="mr-2" size={20}/>
            Add All to Cart
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
          />
        ))}
      </div>
    </div>
  );
};