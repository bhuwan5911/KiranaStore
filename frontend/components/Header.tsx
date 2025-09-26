import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Dot } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

export const Header: React.FC = () => {
  const { cart, user, logout, products } = useAppContext();
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const mobileSearchContainerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) &&
        (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target as Node))
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      handleSuggestionClick();
    }
  };
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const filteredSuggestions = products
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    closeMobileMenu();
  };
  
  const navLinkClasses = "py-2 px-3 text-brand-black/60 hover:text-brand-black font-medium transition-colors";
  const activeNavLinkClasses = "text-brand-black font-semibold";

  const SuggestionDropdown = ({ onSuggestionClick }: { onSuggestionClick: () => void }) => (
    <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg z-10 overflow-hidden border">
      <ul>
        {suggestions.map(product => (
          <li key={product.id}>
            <NavLink
              to={`/product/${product.id}`}
              onClick={onSuggestionClick}
              className="flex items-center gap-4 p-3 hover:bg-neutral-lightest transition-colors"
            >
              <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
              <span className="font-medium text-sm">{product.name}</span>
            </NavLink>
          </li>
        ))}
        {suggestions.length > 0 && (
          <li className="p-2 bg-neutral-lightest text-center">
            <button type="submit" className="font-semibold text-primary text-sm w-full">
              See all results for "{searchQuery}"
            </button>
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <>
      <header className="sticky top-4 z-50 container mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-soft flex justify-between items-center py-3 px-6">
            
            {/* Left Side: Logo & Nav */}
            <div className="flex items-center gap-8">
              <NavLink to="/" className="text-2xl font-bold text-brand-black flex items-center">
                <Dot size={36} className="text-primary -ml-3" />
                shophub
              </NavLink>
              <nav className="hidden md:flex items-center gap-4">
                  <NavLink to="/products/all" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Shop</NavLink>
              </nav>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden md:flex flex-grow justify-center px-8">
              {/* --- BADLAV: 'flex' class add ki gayi hai taaki text aur icon ek line mein aayein --- */}
              <form ref={searchContainerRef} onSubmit={handleSearch} className="relative flex items-center bg-neutral-lightest rounded-full border border-neutral-dark/50 w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Search for products..."
                  className="bg-transparent w-full p-2.5 pl-4 rounded-full focus:outline-none text-sm"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  autoComplete="off"
                />
                <button type="submit" className="text-black/50 p-2 m-1">
                  <Search size={18} />
                </button>
                {showSuggestions && suggestions.length > 0 && <SuggestionDropdown onSuggestionClick={handleSuggestionClick} />}
              </form>
            </div>

            {/* Right Side: Icons */}
            <nav className="flex items-center">
              {/* --- BADLAV: gap-x-2 se badha kar gap-x-3 kiya gaya hai --- */}
              <div className="hidden md:flex items-center bg-brand-black text-white rounded-full p-1.5 shadow-lg gap-x-3">
                <NavLink to="/wishlist" className="relative p-3 hover:bg-white/20 rounded-full transition-all hover:scale-110" title="Wishlist">
                  <Heart size={22}/>
                </NavLink>
                <div className="relative group">
                  <NavLink to={user ? "/account" : "/login"} className="p-3 hover:bg-white/20 rounded-full transition-all hover:scale-110">
                    <User size={22}/>
                  </NavLink>
                  {user && (
                    <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-lg py-2 z-20 hidden group-hover:block animate-fade-in">
                        <NavLink to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-neutral-dark">My Account</NavLink>
                        {user.role === 'admin' && <NavLink to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-neutral-dark">Admin Panel</NavLink>}
                        <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-neutral-dark">Logout</button>
                    </div>
                  )}
                </div>
                <NavLink to="/cart" className="relative p-3 bg-primary rounded-full transition-colors" title="Cart">
                  <ShoppingCart size={22}/>
                  {cartItemCount > 0 && (
                    <span key={cartItemCount} className="absolute -top-1 -right-1 bg-white text-primary text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pop-in">
                      {cartItemCount}
                    </span>
                  )}
                </NavLink>
              </div>
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-text-secondary hover:text-primary p-2 ml-2">
                  <Menu/>
              </button>
            </nav>
          </div>
      </header>

      {/* Mobile Menu (No changes needed here) */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeMobileMenu}></div>
      <div className={`fixed top-0 right-0 h-full w-72 bg-neutral-lightest shadow-lg z-[70] transform transition-transform md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-primary">Menu</h2>
            <button onClick={closeMobileMenu}><X/></button>
          </div>
          <div className="p-4">
            <form ref={mobileSearchContainerRef} onSubmit={handleSearch} className="relative flex items-center bg-white rounded-full w-full border">
              <input type="text" placeholder="Search..." className="bg-transparent w-full p-2 pl-4 rounded-full focus:outline-none" value={searchQuery} onChange={handleInputChange} onFocus={() => setShowSuggestions(suggestions.length > 0)} autoComplete="off" />
              <button type="submit" className="bg-primary text-white p-2 rounded-full m-1"><Search size={20} /></button>
              {showSuggestions && suggestions.length > 0 && <SuggestionDropdown onSuggestionClick={handleSuggestionClick} />}
            </form>
          </div>
          <nav className="flex flex-col p-4 space-y-2">
            <NavLink to="/" onClick={closeMobileMenu} className="p-2 rounded-lg hover:bg-gray-100">Home</NavLink>
            <NavLink to="/products/all" onClick={closeMobileMenu} className="p-2 rounded-lg hover:bg-gray-100 font-semibold">Shop</NavLink>
             {user?.role === 'admin' && (
                <NavLink to="/admin" onClick={closeMobileMenu} className="p-2 rounded-lg hover:bg-gray-100 border-t mt-2 pt-2">Admin Panel</NavLink>
              )}
          </nav>
      </div>
    </>
  );
};