import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { ArrowRight, ShoppingBag, Carrot, Cookie, GlassWater, Milk, Wheat } from 'lucide-react';
import { ReactNode } from 'react'; // ReactNode ko import karein

// FIX: Type ko ReactNode se update kiya gaya hai for better type safety
const categoryIcons: { [key: string]: ReactNode } = {
  'fruits-vegetables': <Carrot className="w-8 h-8" />,
  'snacks': <Cookie className="w-8 h-8" />,
  'beverages': <GlassWater className="w-8 h-8" />,
  'dairy-bakery': <Milk className="w-8 h-8" />,
  'staples': <Wheat className="w-8 h-8" />,
};

export const HomePage: React.FC = () => {
  // @ts-ignore - isLoading ko AppContext se hata diya gaya hai, aap ise add kar sakte hain agar zaroorat ho
  const { products, categories, recentlyViewed } = useAppContext();
  const featuredProducts = products.slice(0, 4);

  return (
    // FIX: Vertical spacing ko responsive banaya gaya hai (mobile par kam, desktop par zyada)
    <div className="space-y-16 md:space-y-24 container mx-auto px-4 py-8 md:py-12">
      
      {/* Hero Section */}
      {/* FIX: Padding aur text sizes ko mobile ke liye adjust kiya gaya hai */}
      <section className="bg-gradient-to-br from-yellow-300 to-orange-400 text-black rounded-3xl p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
        <div className="md:w-1/2 text-center md:text-left z-10">
            {/* FIX: Heading ko mobile par chota (text-3xl) aur desktop par bada (text-5xl) kiya gaya hai */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Your Daily Dose
              <br />
              of Freshness.
            </h1>
            <p className="text-md md:text-lg text-black/70 mb-8 max-w-lg mx-auto md:mx-0">
              High-quality groceries delivered to your door. Freshness guaranteed.
            </p>
            <Link to="/products/all">
                <Button size="lg" className="bg-slate-800 text-white hover:bg-slate-900 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    Shop All Products <ArrowRight className="ml-2"/>
                </Button>
            </Link>
          </div>
          <div className="md:w-1/2 w-full h-64 md:h-auto flex items-center justify-center relative">
            <div className="absolute w-48 h-48 md:w-72 md:h-72 bg-white/30 rounded-full blur-xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500" 
              alt="Fresh Groceries" 
              className="rounded-3xl shadow-2xl w-56 h-56 object-cover relative z-10 transform -rotate-6 hover:rotate-0 hover:scale-110 transition-transform duration-500"
            />
        </div>
      </section>

      {/* Categories Section */}
      <section>
        {/* FIX: Heading ko responsive banaya gaya hai */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-text-primary">Shop by Category</h2>
        {/* FIX: Grid gap ko mobile ke liye chota kiya gaya hai */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link 
                key={category.slug} 
                to={`/products/${category.slug}`} 
                className="group block text-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                {categoryIcons[category.slug] || <ShoppingBag className="w-8 h-8" />}
              </div>
              <h3 className="text-text-primary text-md md:text-lg font-semibold mt-4">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-text-primary">Our Featured Products</h2>
        {/* FIX: Grid gap ko responsive banaya gaya hai */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard 
                key={product.id} 
                product={product} 
            />
          ))}
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-text-primary">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
