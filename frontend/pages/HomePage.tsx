import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { ArrowRight, ShoppingBag, Carrot, Cookie, GlassWater, Milk, Wheat } from 'lucide-react';

const categoryIcons: { [key: string]: React.Node } = {
  'fruits-vegetables': <Carrot className="w-8 h-8" />,
  'snacks': <Cookie className="w-8 h-8" />,
  'beverages': <GlassWater className="w-8 h-8" />,
  'dairy-bakery': <Milk className="w-8 h-8" />,
  'staples': <Wheat className="w-8 h-8" />,
};

export const HomePage: React.FC = () => {
  const { products, categories, recentlyViewed, isLoading } = useAppContext();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-24 container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-yellow to-brand-orange text-brand-black rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
        <div className="md:w-1/2 text-center md:text-left z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              Your Daily Dose
              <br />
              of Freshness.
            </h1>
            <p className="text-lg text-black/70 mb-8 max-w-lg mx-auto md:mx-0">
              High-quality groceries delivered to your door. Freshness guaranteed.
            </p>
            <Link to="/products/all">
                <Button size="lg" className="btn-shine">
                    Shop All Products <ArrowRight className="ml-2"/>
                </Button>
            </Link>
          </div>
          <div className="md:w-1/2 relative w-full h-64 md:h-96 flex items-center justify-center">
            {/* Image Layering Fix */}
            <div className="absolute w-48 h-48 md:w-64 md:h-64 bg-white/50 rounded-3xl transform rotate-12 z-0"></div>
            <img 
              src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500" 
              alt="Fresh carrots" 
              className="rounded-3xl shadow-lg w-40 h-40 md:w-56 md:h-56 object-cover absolute z-10 transform -translate-x-4 -translate-y-4"
            />
          </div>
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10 text-text-primary">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link 
                key={category.slug} 
                to={`/products/${category.slug}`} 
                className="group block text-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {categoryIcons[category.slug] || <ShoppingBag className="w-8 h-8" />}
              </div>
              <h3 className="text-text-primary text-lg font-semibold mt-4">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10 text-text-primary">Our Featured Products</h2>
        {isLoading ? (<p className="text-center">Loading...</p>) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard 
                  key={product.id} 
                  product={product} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-center mb-10 text-text-primary">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recentlyViewed.map((product) => (
              <ProductCard 
                key={`recent-${product.id}`} 
                product={product} 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};