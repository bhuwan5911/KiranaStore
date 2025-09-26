import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { ArrowRight, ShoppingBag, Carrot, Cookie, GlassWater, Milk, Wheat } from 'lucide-react';

const categoryIcons: { [key: string]: React.ReactNode } = {
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
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-200 to-orange-300 text-black rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
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
                <Button size="lg" className="animate-pulse-slow">
                    Shop All Products <ArrowRight className="ml-2"/>
                </Button>
            </Link>
          </div>
          <div className="md:w-1/2 relative w-full h-64 md:h-auto">
            <img 
              src="https://plus.unsplash.com/premium_photo-1671583387034-e8175d7e1f18?w=500" 
              alt="Background decorative" 
              className="rounded-3xl shadow-soft-lg w-48 h-48 md:w-64 md:h-64 object-cover absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-2/3 animate-gentle-float-1 z-0"
            />
            <img 
              src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500" 
              alt="Fresh carrots" 
              className="rounded-3xl shadow-soft-lg w-32 h-32 md:w-56 md:h-56 object-cover absolute top-1/2 left-1/2 -translate-x-2/3 -translate-y-1/4 animate-gentle-float-2 z-10"
            />
          </div>
      </section>

      {/* Categories */}
      <section className="animate-slide-in-up animation-delay-200">
        <h2 className="text-3xl font-bold text-center mb-10 text-text-primary">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <Link 
                key={category.slug} 
                to={`/products/${category.slug}`} 
                className="group block text-center bg-white p-6 rounded-2xl shadow-soft hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms`}}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {categoryIcons[category.slug] || <ShoppingBag className="w-8 h-8" />}
              </div>
              <h3 className="text-text-primary text-lg font-semibold mt-4">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Baaki ka code waisa hi rahega... */}
      <section className="animate-slide-in-up animation-delay-400">
        <h2 className="text-3xl font-bold text-center mb-10 text-text-primary">Our Featured Products</h2>
        {isLoading ? (<p className="text-center">Loading...</p>) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard 
                  key={product.id} 
                  product={product} 
                  style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        )}
      </section>

      {recentlyViewed.length > 0 && (
        <section className="animate-slide-in-up">
          <h2 className="text-3xl font-bold text-center mb-10 text-text-primary">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recentlyViewed.map((product, index) => (
              <ProductCard 
                key={`recent-${product.id}`} 
                product={product} 
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};