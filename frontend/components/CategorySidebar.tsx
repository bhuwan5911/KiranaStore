import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ChevronRight } from 'lucide-react';

export const CategorySidebar: React.FC = () => {
    const { categories } = useAppContext();

    const linkClasses = "flex justify-between items-center w-full px-4 py-3 text-left text-text-secondary rounded-lg hover:bg-gray-100 hover:text-primary transition-colors";
    const activeLinkClasses = "bg-primary/10 text-primary font-semibold";

    return (
        <aside className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-soft h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-4">Categories</h2>
            <nav className="space-y-2">
                <NavLink
                    to="/products/all"
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                    All Products
                    <ChevronRight size={16} />
                </NavLink>

                {categories.map(cat => (
                    <NavLink
                        key={cat.slug}
                        to={`/products/${cat.slug}`}
                        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        {cat.name}
                        <ChevronRight size={16} />
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};