import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Dot } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
// ✅ FIX: 'Button' component ko yahan import kiya gaya hai
import { Button } from './ui/Button'; 

export const Header: React.FC = () => {
  const { cart, user, logout, products } = useAppContext();
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Effect to handle clicks outside of menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Effect to disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      handleSuggestionClick();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = products
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };
  
  const navLinkClasses = "py-2 px-3 text-gray-600 hover:text-black font-medium transition-colors";
  const activeNavLinkClasses = "text-black font-semibold";

  const SuggestionDropdown = () => (
    <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg z-10 overflow-hidden border">
      <ul>
        {suggestions.map(product => (
          <li key={product.id}>
            <Link to={`/product/${product.id}`} onClick={handleSuggestionClick} className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors">
              <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
              <span className="font-medium text-sm text-gray-800">{product.name}</span>
            </Link>
          </li>
        ))}
        {suggestions.length > 0 && (
          <li className="p-2 bg-gray-50 text-center">
            <button type="submit" className="font-semibold text-primary text-sm w-full">
              See all results
            </button>
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 md:top-4 z-50 container mx-auto px-4 py-2 md:py-0">
        <div className="bg-white/80 backdrop-blur-lg rounded-none md:rounded-2xl shadow-sm md:shadow-soft flex justify-between items-center py-3 px-4 md:px-6">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-black flex items-center">
              <Dot size={36} className="text-primary -ml-3" />
              shophub
            </Link>
            <nav className="hidden lg:flex items-center gap-4">
              <NavLink to="/products/all" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Shop</NavLink>
            </nav>
          </div>

          <div className="hidden md:flex flex-grow justify-center px-8" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="relative w-full max-w-lg">
              <input 
                type="text" 
                placeholder="Search for products..."
                className="bg-gray-100 w-full p-2.5 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                autoComplete="off"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </button>
              {showSuggestions && suggestions.length > 0 && <SuggestionDropdown />}
            </form>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center bg-black text-white rounded-full p-1.5 shadow-lg gap-x-1">
              <NavLink to="/wishlist" className="relative p-2.5 hover:bg-white/20 rounded-full transition-all" title="Wishlist">
                <Heart size={20}/>
              </NavLink>
              
              <div className="relative" ref={accountMenuRef}>
                <button 
                  onClick={() => user ? setIsAccountMenuOpen(prev => !prev) : navigate('/login')}
                  className="p-2.5 hover:bg-white/20 rounded-full transition-all"
                >
                  <User size={20}/>
                </button>
                {user && (
                  <div className={`absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-lg py-2 z-20 transition-opacity duration-300 ${isAccountMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                    <NavLink to="/account" onClick={() => setIsAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</NavLink>
                    {user.role === 'admin' && <NavLink to="/admin" onClick={() => setIsAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</NavLink>}
                    <button onClick={() => { logout(); setIsAccountMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>

              <NavLink to="/cart" className="relative p-2.5 bg-primary rounded-full transition-colors" title="Cart">
                <ShoppingCart size={20}/>
                {cartItemCount > 0 && (
                  <span key={cartItemCount} className="absolute -top-1 -right-1 bg-white text-primary text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pop-in">
                    {cartItemCount}
                  </span>
                )}
              </NavLink>
            </nav>
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-600 hover:text-primary p-2">
                <Menu size={24}/>
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className={`fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-lg z-[70] transform transition-transform md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg text-primary">Menu</h2>
          <button onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button>
        </div>
        
        <div className="p-4 border-b">
           <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="text" 
                placeholder="Search..."
                className="bg-gray-100 w-full p-2.5 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                autoComplete="off"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </button>
              {showSuggestions && suggestions.length > 0 && <SuggestionDropdown />}
            </form>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
            <NavLink to="/" onClick={handleSuggestionClick} className={({isActive}) => `p-3 rounded-lg font-medium ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}>Home</NavLink>
            <NavLink to="/products/all" onClick={handleSuggestionClick} className={({isActive}) => `p-3 rounded-lg font-medium ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}>Shop</NavLink>
            <NavLink to="/wishlist" onClick={handleSuggestionClick} className={({isActive}) => `p-3 rounded-lg font-medium ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}>Wishlist</NavLink>
            <NavLink to="/cart" onClick={handleSuggestionClick} className={({isActive}) => `p-3 rounded-lg font-medium ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}>Cart</NavLink>
        </nav>
        
        <div className="p-4 mt-auto absolute bottom-0 w-full border-t">
          {user ? (
            <div className="flex flex-col space-y-2">
               <NavLink to="/account" onClick={handleSuggestionClick} className="p-3 rounded-lg font-medium hover:bg-gray-100">My Account</NavLink>
               {user.role === 'admin' && <NavLink to="/admin" onClick={handleSuggestionClick} className="p-3 rounded-lg font-medium hover:bg-gray-100">Admin Panel</NavLink>}
               <button onClick={() => { logout(); handleSuggestionClick(); }} className="p-3 rounded-lg font-medium text-left text-red-500 hover:bg-red-50">Logout</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" onClick={handleSuggestionClick} className="flex-1">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/signup" onClick={handleSuggestionClick} className="flex-1">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

