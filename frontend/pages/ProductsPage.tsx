import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { products, categories } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';

export const ProductsPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  const [sortOrder, setSortOrder] = useState('default');

  const filteredProducts = useMemo(() => {
    let prods = categorySlug === 'all' 
      ? products 
      : products.filter(p => p.category === categorySlug);
      
    // Create a new array to avoid mutating the original
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
  }, [categorySlug, sortOrder]);

  const categoryName = categories.find(c => c.slug === categorySlug)?.name || 'All Products';

  return (
    <div>
      <div className="bg-neutral p-4 rounded-lg mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{categoryName}</h1>
        <div className="flex justify-end items-center mt-4">
            <label htmlFor="sort" className="mr-2 text-sm text-text-secondary">Sort by:</label>
            <select
                id="sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-neutral-dark rounded-md p-2 focus:ring-primary focus:border-primary"
            >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Top Rated</option>
            </select>
        </div>
      </div>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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