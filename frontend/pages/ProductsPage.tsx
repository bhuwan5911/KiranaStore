import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
// SAHI: AppContext se data lene ke liye import karein
import { useAppContext } from '../context/AppContext';

export const ProductsPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  // SAHI: Mock data ki jagah AppContext se real data lein
  const { products, categories, isLoading } = useAppContext();
  
  const [sortOrder, setSortOrder] = useState('default');

  const filteredProducts = useMemo(() => {
    // Ab yeh real 'products' par kaam karega
    let prods = categorySlug === 'all' 
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
  }, [categorySlug, sortOrder, products]); // 'products' ko dependency mein add karein

  // Ab yeh real 'categories' par kaam karega
  const categoryName = categories.find(c => c.slug === categorySlug)?.name || 'All Products';

  // SAHI: Jab tak data load ho raha hai, loading message dikhayein
  if (isLoading) {
    return <div className="text-center py-16 text-lg">Loading Products...</div>;
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-2xl mb-8 shadow-soft">
        <h1 className="text-3xl font-bold text-text-primary">{categoryName}</h1>
        <div className="flex justify-end items-center mt-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              style={{ animationDelay: `${index * 50}ms` }} 
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-text-secondary py-16">No products found in this category.</p>
      )}
    </div>
  );
};