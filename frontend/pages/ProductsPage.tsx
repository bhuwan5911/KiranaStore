import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import { CategorySidebar } from '../components/CategorySidebar';

export const ProductsPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  // @ts-ignore - isLoading ko AppContext se hata diya gaya hai
  const { products, categories } = useAppContext();
  
  const [sortOrder, setSortOrder] = useState('default');

  const filteredProducts = useMemo(() => {
    let prods = categorySlug === 'all' || !categorySlug
      ? products 
      : products.filter(p => p.category === categorySlug);
      
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

  // if (isLoading) {
  //   return <div className="text-center py-16 text-lg">Loading Products...</div>;
  // }

  return (
    // FIX: Main grid layout ko mobile aur desktop ke liye adjust kiya gaya hai.
    // Mobile par 1 column, lg screens (desktop) par 4 columns.
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Column 1: Sidebar */}
        <CategorySidebar />

        {/* Column 2: Products Grid aur Sorting */}
        <main className="lg:col-span-3">
            {/* FIX: Header section ko responsive banaya gaya hai. flex-col mobile par, sm:flex-row tablet aur upar. */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl mb-8 shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    {/* FIX: Heading ka size mobile ke liye chota kiya gaya hai */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{categoryName}</h1>
                    <p className="text-text-secondary mt-1">{filteredProducts.length} products found</p>
                </div>
                <div className="flex items-center w-full sm:w-auto">
                    <label htmlFor="sort" className="mr-2 text-sm text-text-secondary whitespace-nowrap">Sort by:</label>
                    <select
                        id="sort"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5 w-full"
                    >
                        <option value="default">Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-desc">Top Rated</option>
                    </select>
                </div>
            </div>
            
            {filteredProducts.length > 0 ? (
                // FIX: Product grid ko medium screens (md) ke liye bhi adjust kiya gaya hai.
                // Mobile: 1 col, sm: 2 cols, md: 3 cols.
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
