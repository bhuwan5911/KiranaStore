import React from 'react';
import { Link } from 'react-router-dom';
import { products, categories } from '../data/mockData';
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
  const { recentlyViewed } = useAppContext();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-yellow to-brand-orange text-brand-black rounded-4xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 animate-slide-in-up">
        <div className="md:w-1/2 text-center md:text-left">
           <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Your Daily Dose
            <br />
            of Freshness.
          </h1>
          <p className="text-lg text-brand-black/70 mb-8 max-w-lg mx-auto md:mx-0">
            High-quality groceries delivered to your door. Freshness guaranteed.
          </p>
          <Link to="/products/all">
              <Button size="lg">
                  Shop All Products <ArrowRight className="ml-2"/>
              </Button>
          </Link>
        </div>
        <div className="md:w-1/2 relative w-full h-64 md:h-auto">
          <img 
            src="https://picsum.photos/seed/hero-fruit/300/300" 
            alt="Fresh fruit" 
            className="rounded-3xl shadow-soft-lg w-48 h-48 md:w-64 md:h-64 object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-gentle-float-2"
          />
           <img 
            src="https://picsum.photos/seed/hero-veg/300/300" 
            alt="Fresh vegetables" 
            className="rounded-3xl shadow-soft-lg w-32 h-32 md:w-48 md:h-48 object-cover absolute top-1/2 left-1/2 -translate-x-2/3 -translate-y-1/4 animate-gentle-float-1"
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

      {/* Featured Products */}
      <section className="animate-slide-in-up animation-delay-400">
        <h2 className="text-3xl font-bold text-center mb-10 text-text-primary">Our Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <ProductCard 
                key={product.id} 
                product={product} 
                style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      </section>

      {/* Recently Viewed */}
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