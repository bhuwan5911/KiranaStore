import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useAppContext } from '../context/AppContext'; // AppContext ko import karein

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // AppContext se real data lein
  const { products, categories } = useAppContext();
  
  const allPrices = products.map(p => p.price);
  const maxPrice = Math.max(...allPrices, 0); // Default to 0 if no products

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(maxPrice);
  
  useEffect(() => {
    setSelectedCategories([]);
    setPriceRange(maxPrice);
  }, [query, maxPrice]);

  const handleCategoryChange = (slug: string) => {
      setSelectedCategories(prev => 
          prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
      );
  };

  const searchedProducts = useMemo(() => {
    if (!query) {
      return [];
    }
    return products.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
        const matchesPrice = p.price <= priceRange;
        return matchesQuery && matchesCategory && matchesPrice;
    });
  }, [query, products, selectedCategories, priceRange]); // 'products' ko dependency mein add karein

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-soft h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <div className="mb-6">
              <h3 className="font-semibold mb-2">Category</h3>
              <div className="space-y-2">
                  {categories.map(cat => (
                      <label key={cat.slug} className="flex items-center">
                          <input 
                            type="checkbox"
                            checked={selectedCategories.includes(cat.slug)}
                            onChange={() => handleCategoryChange(cat.slug)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                          />
                          <span className="ml-2 text-text-secondary">{cat.name}</span>
                      </label>
                  ))}
              </div>
          </div>
          <div>
              <h3 className="font-semibold mb-2">Price Range</h3>
              <input 
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange}
                onChange={e => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-text-secondary mt-1">
                  <span>₹0</span>
                  <span>Up to ₹{priceRange}</span>
              </div>
          </div>
      </aside>

      <main className="lg:col-span-3">
        <div className="bg-white p-6 rounded-2xl mb-8 shadow-soft">
            <h1 className="text-3xl font-bold text-text-primary">
            Search Results for "{query}"
            </h1>
            <p className="text-text-secondary mt-2">
                {searchedProducts.length} {searchedProducts.length === 1 ? 'product' : 'products'} found.
            </p>
        </div>
        
        {searchedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {searchedProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                />
            ))}
            </div>
        ) : (
            <p className="text-center text-text-secondary py-16">
            No products found matching your search or filters. Try adjusting your criteria.
            </p>
        )}
      </main>
    </div>
  );
};