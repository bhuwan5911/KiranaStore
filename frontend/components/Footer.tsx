import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-lightest mt-12 border-t border-neutral-dark/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-brand-black/80">
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-black">Shophub</h3>
            <p className="text-sm">Your daily needs, delivered fresh to your doorstep.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-brand-black">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/products/all" className="hover:text-primary transition-colors">All Products</a></li>
              <li><a href="#/account" className="hover:text-primary transition-colors">My Account</a></li>
              <li><a href="#/cart" className="hover:text-primary transition-colors">Your Cart</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-brand-black">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/products/fruits-vegetables" className="hover:text-primary transition-colors">Fruits & Vegetables</a></li>
              <li><a href="#/products/snacks" className="hover:text-primary transition-colors">Snacks</a></li>
              <li><a href="#/products/beverages" className="hover:text-primary transition-colors">Beverages</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-brand-black">Contact Us</h4>
            <p className="text-sm">123 Grocery Lane, Mumbai</p>
            <p className="text-sm">Email: support@shophub.com</p>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-dark/50 pt-4 text-center text-sm text-brand-black/50">
          <p>&copy; {new Date().getFullYear()} Shophub. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};