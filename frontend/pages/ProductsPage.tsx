import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import { CategorySidebar } from '../components/CategorySidebar'; // Naye sidebar ko import karein

export const ProductsPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  const { products, categories, isLoading } = useAppContext();
  
  const [sortOrder, setSortOrder] = useState('default');

  const filteredProducts = useMemo(() => {
    // URL se category ke hisaab se filter karein
    let prods = categorySlug === 'all' || !categorySlug
      ? products 
      : products.filter(p => p.category === categorySlug);
      
    // Sorting logic ko waisa hi rakhein
    let sortedProds = [...prods];

    switch (sortOrder) {
      case 'price-asc':
        sortedProds.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedProds.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        sortedProds.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    return sortedProds;
  }, [categorySlug, sortOrder, products]);

  const categoryName = categories.find(c => c.slug === categorySlug)?.name || 'All Products';

  if (isLoading) {
    return <div className="text-center py-16 text-lg">Loading Products...</div>;
  }

  return (
    // --- BADLAV: Page ko 2-column grid layout diya gaya hai ---
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Column 1: Sidebar */}
        <CategorySidebar />

        {/* Column 2: Products Grid aur Sorting */}
        <main className="lg:col-span-3">
            <div className="bg-white p-6 rounded-2xl mb-8 shadow-soft flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">{categoryName}</h1>
                    <p className="text-text-secondary mt-1">{filteredProducts.length} products found</p>
                </div>
                <div className="flex items-center">
                    <label htmlFor="sort" className="mr-2 text-sm text-text-secondary">Sort by:</label>
                    <select
                        id="sort"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5"
                    >
                        <option value="default">Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-desc">Top Rated</option>
                    </select>
                </div>
            </div>
            
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-text-secondary py-16 bg-white rounded-2xl shadow-soft">
                    <p>No products found in this category.</p>
                </div>
            )}
        </main>
    </div>
  );
};
