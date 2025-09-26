import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartItem, Product, User, ToastMessage, Review, Order, Category } from '../types';

const API_URL = 'http://localhost:5000/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }

    return response;
};

// ... (Interface AppContextType waisi hi rahegi) ...
interface AppContextType {
  cart: CartItem[];
  wishlist: Product[];
  user: User | null;
  toasts: ToastMessage[];
  recentlyViewed: Product[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: User[]; // For admin
  comparisonList: Product[];
  isOffline: boolean;
  showOfflineModal: boolean;
  closeOfflineModal: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  deliveryCharge: number;
  discount: number;
  finalTotal: number;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  addWishlistToCart: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: { message: string } | null }>;
  logout: () => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
  addRecentlyViewed: (product: Product) => void;
  getProductById: (id: number) => Product | undefined;
  fetchReviewsForProduct: (productId: number) => Promise<Review[]>;
  addReview: (productId: number, review: Omit<Review, 'id' | 'date' | 'user_id' | 'product_id'>) => Promise<Review | null>;
  updateUserProfile: (profileData: Partial<User>) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => Promise<void>;
  addProductsBulk: (products: Omit<Product, 'id' | 'rating' | 'reviews'>[]) => Promise<{ success: boolean; message: string }>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  updateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
  placeOrder: () => Promise<{ error: string | null; outOfStockItems?: number[] }>;
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: number) => boolean;
  clearCompare: () => void;
  redeemPoints: (points: number) => Promise<void>;
  subscribeToStock: (productId: number) => Promise<void>;
  isSubscribedToStock: (productId: number) => boolean;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        addToast("Could not load products. Using sample data.", 'error');
        setIsOffline(true);
      }
    };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategorySlugs = [...new Set(products.map(p => p.category))];
      const categoryObjects: Category[] = uniqueCategorySlugs.map(slug => ({
        slug: slug,
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      }));
      setCategories(categoryObjects);
    }
  }, [products]);
  
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchUserProfile();
      }
    };
    loadUser();
  }, []);
  
  useEffect(() => {
    const handleOnline = () => {
        setIsOffline(false);
        addToast("You're back online!", 'success');
    };
    const handleOffline = () => {
        setIsOffline(true);
        setShowOfflineModal(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (isOffline) {
        setShowOfflineModal(true);
    }
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  const closeOfflineModal = () => setShowOfflineModal(false);

  const fetchUserProfile = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/users/profile`);
        if (!res.ok) {
            localStorage.removeItem('token');
            setUser(null);
            return;
        }
        const userData = await res.json();
        setUser(userData);
        fetchUserCart();
        fetchUserWishlist();
        fetchUserOrders(userData);
        if (userData.role === 'admin') {
            fetchAdminData();
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        logout();
      }
  };

  const fetchUserCart = async () => {
      try {
          const res = await fetchWithAuth(`${API_URL}/users/cart`);
          if (res.ok) setCart(await res.json());
      } catch (e) { console.error(e); }
  };
  
  const fetchUserWishlist = async () => {
      try {
          const res = await fetchWithAuth(`${API_URL}/users/wishlist`);
          if (res.ok) setWishlist(await res.json());
      } catch (e) { console.error(e); }
  };

  const fetchUserOrders = async (currentUser: User) => {
    try {
        let url = `${API_URL}/users/orders`;
        if (currentUser.role === 'admin') {
            url = `${API_URL}/admin/orders`;
        }
        const res = await fetchWithAuth(url);
        if (res.ok) setOrders(await res.json());
    } catch(e) { console.error(e) }
  };
  
  const fetchAdminData = async () => {
      try {
          const [usersRes, ordersRes] = await Promise.all([
              fetchWithAuth(`${API_URL}/admin/users`),
              fetchWithAuth(`${API_URL}/admin/orders`)
          ]);
          if(usersRes.ok) setUsers(await usersRes.json());
          if(ordersRes.ok) setOrders(await ordersRes.json());
      } catch(e) { console.error(e); }
  }


  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  const login = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: { message: data.message || 'Login failed' } };
        }
        localStorage.setItem('token', data.token);
        await fetchUserProfile();
        return { error: null };
    } catch (e) {
        return { error: { message: "Network error. Please try again." } };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: { message: data.message || 'Signup failed' } };
        }
        addToast('Account created! Please log in.', 'success');
        return { error: null };
    } catch (e) {
        return { error: { message: "Network error. Please try again." } };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setUsers([]);
    addToast('You have been logged out.', 'info');
  };

  // --- BADLAV START ---
  // Cart functions ko naye response format ke liye theek kiya gaya hai
  const addToCart = async (product: Product, quantity = 1) => {
      if (!user) { addToast("Please log in to add items.", 'info'); return; }
      try {
          const res = await fetchWithAuth(`${API_URL}/users/cart`, {
              method: 'POST',
              body: JSON.stringify({ productId: product.id, quantity })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          setCart(data); // BADLAV: data.cart ki jagah seedha 'data' use karein
          addToast(`${product.name} added to cart!`, 'success');
      } catch (e: any) {
          addToast(e.message || 'Could not add to cart.', 'error');
      }
  };
  
  const updateQuantity = async (productId: number, quantity: number) => {
      if (!user) return;
      if (quantity <= 0) {
          await removeFromCart(productId);
          return;
      }
      try {
          const res = await fetchWithAuth(`${API_URL}/users/cart`, {
              method: 'PUT',
              body: JSON.stringify({ productId, quantity })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          setCart(data); // BADLAV: data.cart ki jagah seedha 'data' use karein
      } catch (e: any) {
          addToast(e.message || 'Could not update quantity.', 'error');
      }
  };
  
  const removeFromCart = async (productId: number) => {
      if (!user) return;
      try {
           const res = await fetchWithAuth(`${API_URL}/users/cart/${productId}`, { method: 'DELETE' });
           const data = await res.json();
           if (!res.ok) throw new Error(data.message);
           setCart(data); // BADLAV: data.cart ki jagah seedha 'data' use karein
           addToast('Item removed from cart.', 'info');
      } catch (e: any) {
          addToast(e.message || 'Could not remove item.', 'error');
      }
  };
  // --- BADLAV END ---

  const clearCart = async () => { /* Logic to be implemented if needed */ };
  
  const toggleWishlist = async (product: Product) => {
      if (!user) { addToast("Please log in to manage wishlist.", 'info'); return; }
      try {
          const res = await fetchWithAuth(`${API_URL}/users/wishlist`, {
              method: 'POST',
              body: JSON.stringify({ productId: product.id })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          setWishlist(data.wishlist);
          if (data.action === 'added') addToast(`${product.name} added to wishlist!`, 'success');
          else addToast(`${product.name} removed from wishlist.`, 'info');
      } catch(e: any) {
          addToast(e.message || 'Could not update wishlist.', 'error');
      }
  };
  
  const addWishlistToCart = async () => { /* Logic to be implemented if needed */ };
  const isInWishlist = (productId: number) => wishlist.some(item => item.id === productId);

  const addRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
        const existing = prev.find(p => p.id === product.id);
        if (existing) return [product, ...prev.filter(p => p.id !== product.id)];
        return [product, ...prev].slice(0, 5);
    });
  };

  const fetchReviewsForProduct = async (productId: number): Promise<Review[]> => { /* ... code ... */ return []; };
  const addReview = async (productId: number, reviewData: Omit<Review, 'id' | 'date' | 'user_id' | 'product_id'>): Promise<Review | null> => { /* ... code ... */ return null; };
  const getProductById = (id: number) => products.find(p => p.id === id);

  const cartTotal = cart ? cart.reduce((total, item) => total + item.price * item.quantity, 0) : 0;
  const deliveryCharge = cartTotal > 0 && cartTotal < 500 ? 40 : 0;
  const discount = cartTotal > 1000 ? 50 : 0;
  const finalTotal = cartTotal + deliveryCharge - discount;

  const placeOrder = async () => { /* ... code ... */ return { error: null }; };
  const updateUserProfile = async (profileData: Partial<User>) => { /* ... code ... */ return true; };
  const redeemPoints = async (pointsToRedeem: number) => { /* ... code ... */ };
  const subscribeToStock = async (productId: number) => { /* ... code ... */ };
  const isSubscribedToStock = (productId: number) => false;
  const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviews'>) => { /* ... code ... */ };
  const addProductsBulk = async (productsToAdd: Omit<Product, 'id' | 'rating' | 'reviews'>[]): Promise<{ success: boolean; message: string }> => { /* ... code ... */ return { success: true, message: '' }; };
  const updateProduct = async (updatedProduct: Product) => { /* ... code ... */ };
  const deleteProduct = async (productId: number) => { /* ... code ... */ };
  const updateOrderStatus = async (orderId: number, status: Order['status']) => { /* ... code ... */ };
  const toggleCompare = (product: Product) => { /* ... code ... */ };
  const isInCompare = (productId: number) => false;
  const clearCompare = () => setComparisonList([]);

  return (
    <AppContext.Provider
      value={{
        cart, wishlist, user, toasts, recentlyViewed, products, orders, users,
        categories,
        comparisonList, isOffline, addToCart, removeFromCart, updateQuantity,
        clearCart, toggleWishlist, isInWishlist, addWishlistToCart, login, signUp, logout,
        cartTotal, deliveryCharge, discount, finalTotal, addToast, removeToast,
        addRecentlyViewed, getProductById, updateUserProfile, addProduct, addProductsBulk, updateProduct, deleteProduct,
        updateOrderStatus, placeOrder, toggleCompare, isInCompare, clearCompare,
        showOfflineModal, closeOfflineModal, fetchReviewsForProduct, addReview, redeemPoints,
        subscribeToStock, isSubscribedToStock
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};