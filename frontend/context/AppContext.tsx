import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartItem, Product, User, ToastMessage, Review, Order } from '../types';

// The custom backend URL. For development, this will be localhost.
const API_URL = 'http://localhost:5000/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Handle token expiration, e.g., by logging out the user
      localStorage.removeItem('token');
      window.location.href = '#/login'; // Force redirect
      throw new Error('Session expired. Please log in again.');
    }

    return response;
};


interface AppContextType {
  cart: CartItem[];
  wishlist: Product[];
  user: User | null;
  toasts: ToastMessage[];
  recentlyViewed: Product[];
  products: Product[];
  orders: Order[];
  users: User[]; // For admin
  comparisonList: Product[];
  isOffline: boolean;
  // FIX: Added properties for offline modal
  showOfflineModal: boolean;
  closeOfflineModal: () => void;
  
  // Cart Functions
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  deliveryCharge: number;
  discount: number;
  finalTotal: number;
  
  // Wishlist Functions
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  addWishlistToCart: () => Promise<void>;

  // Auth Functions
  login: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: { message: string } | null }>;
  logout: () => void;

  // Toast Functions
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
  
  // Product Functions
  addRecentlyViewed: (product: Product) => void;
  getProductById: (id: number) => Product | undefined;
  // FIX: Added functions for reviews
  fetchReviewsForProduct: (productId: number) => Promise<Review[]>;
  addReview: (productId: number, review: Omit<Review, 'id' | 'date' | 'user_id' | 'product_id'>) => Promise<Review | null>;
  
  // User Profile
  updateUserProfile: (profileData: Partial<User>) => Promise<boolean>;

  // Admin Functions
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => Promise<void>;
  addProductsBulk: (products: Omit<Product, 'id' | 'rating' | 'reviews'>[]) => Promise<{ success: boolean; message: string }>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  updateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;

  // Other Features
  placeOrder: () => Promise<{ error: string | null; outOfStockItems?: number[] }>;
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: number) => boolean;
  clearCompare: () => void;
  // FIX: Added missing feature functions
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]); // For admin view
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  // FIX: Added state for offline modal
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

  // Fetch products on initial load
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Check for existing token on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchUserProfile();
      }
    };
    loadUser();
  }, []);

  // FIX: Added effect for online/offline status
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

  // FIX: Added function to close offline modal
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
        // After setting user, fetch their data
        fetchUserCart();
        fetchUserWishlist();
        fetchUserOrders(userData);
        if (userData.role === 'admin') {
            fetchAdminData();
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        logout(); // Logout on auth error
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
        await fetchUserProfile(); // Fetch profile and related data
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

  const addToCart = async (product: Product, quantity = 1) => {
      if (!user) { addToast("Please log in to add items.", 'info'); return; }
      try {
          const res = await fetchWithAuth(`${API_URL}/users/cart`, {
              method: 'POST',
              body: JSON.stringify({ productId: product.id, quantity })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          setCart(data.cart);
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
          setCart(data.cart);
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
           setCart(data.cart);
           addToast('Item removed from cart.', 'info');
      } catch (e: any) {
          addToast(e.message || 'Could not remove item.', 'error');
      }
  };

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

  // FIX: Added function implementations
  const fetchReviewsForProduct = async (productId: number): Promise<Review[]> => {
      try {
          const res = await fetch(`${API_URL}/products/${productId}/reviews`);
          if (!res.ok) {
              addToast('Could not load reviews.', 'error');
              return [];
          }
          return await res.json();
      } catch (error) {
         console.error("Network error fetching reviews:", error);
         addToast("Network error fetching reviews.", "error");
         setIsOffline(true);
         return [];
      }
  };

  const addReview = async (productId: number, reviewData: Omit<Review, 'id' | 'date' | 'user_id' | 'product_id'>): Promise<Review | null> => {
      if (!user) {
          addToast('You must be logged in to leave a review.', 'info');
          return null;
      }
      try {
          const res = await fetchWithAuth(`${API_URL}/products/${productId}/reviews`, {
              method: 'POST',
              body: JSON.stringify(reviewData)
          });
          const newReview = await res.json();
          if (!res.ok) throw new Error(newReview.message || 'Failed to submit review');
          addToast('Thank you for your review!', 'success');
          return newReview as Review;
      } catch(e: any) {
        addToast(e.message || 'Network error: Could not submit review.', 'error');
        return null;
      }
  };

  const getProductById = (id: number) => products.find(p => p.id === id);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryCharge = cartTotal > 0 && cartTotal < 500 ? 40 : 0;
  const discount = cartTotal > 1000 ? 50 : 0;
  const finalTotal = cartTotal + deliveryCharge - discount;

  const placeOrder = async () => {
      if (!user) return { error: "Please log in to place an order." };
      try {
          const res = await fetchWithAuth(`${API_URL}/users/orders`, {
              method: 'POST',
              body: JSON.stringify({ cart }) // Backend will recalculate total
          });
          const data = await res.json();
          if (!res.ok) {
              return { error: data.message, outOfStockItems: data.outOfStockItems };
          }
          setOrders(prev => [data, ...prev]);
          setCart([]);
          return { error: null };
      } catch(e: any) {
          return { error: e.message || "Failed to place order." };
      }
  };
  
  const updateUserProfile = async (profileData: Partial<User>) => {
      if (!user) return false;
      try {
          const res = await fetchWithAuth(`${API_URL}/users/profile`, {
              method: 'PUT',
              body: JSON.stringify(profileData),
          });
          const updatedUser = await res.json();
          if (!res.ok) throw new Error(updatedUser.message);
          setUser(updatedUser);
          addToast('Profile updated successfully!', 'success');
          return true;
      } catch(e: any) {
          addToast(e.message || "Failed to update profile.", 'error');
          return false;
      }
  }

  const redeemPoints = async (pointsToRedeem: number) => {
    if (user && user.loyaltyPoints >= pointsToRedeem) {
      await updateUserProfile({ loyaltyPoints: user.loyaltyPoints - pointsToRedeem });
    }
  };

  const subscribeToStock = async (productId: number) => {
      if (user && !user.stockNotifications?.includes(productId)) {
          const currentSubs = user.stockNotifications || [];
          const success = await updateUserProfile({ stockNotifications: [...currentSubs, productId] });
          if(success) addToast("You'll be notified when this is back in stock!", 'success');
      }
  };

  const isSubscribedToStock = (productId: number) => user?.stockNotifications?.includes(productId) || false;

  // Admin Functions
  const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
      try {
          const res = await fetchWithAuth(`${API_URL}/admin/products`, {
              method: 'POST',
              body: JSON.stringify(productData)
          });
          const newProduct = await res.json();
          if (!res.ok) throw new Error(newProduct.message);
          setProducts(prev => [...prev, newProduct]);
          addToast('Product added successfully!', 'success');
      } catch (e: any) {
          addToast(e.message || "Failed to add product.", 'error');
      }
  };

  const addProductsBulk = async (productsToAdd: Omit<Product, 'id' | 'rating' | 'reviews'>[]): Promise<{ success: boolean; message: string }> => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/products/bulk`, {
                method: 'POST',
                body: JSON.stringify(productsToAdd)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            await fetchProducts(); // Refetch after successful upload

            addToast(data.message, 'success');
            return { success: true, message: data.message };
        } catch (e: any) {
            const errorMessage = e.message || "Failed to bulk add products.";
            addToast(errorMessage, 'error');
            return { success: false, message: errorMessage };
        }
    };

  const updateProduct = async (updatedProduct: Product) => {
      try {
          const res = await fetchWithAuth(`${API_URL}/admin/products/${updatedProduct.id}`, {
              method: 'PUT',
              body: JSON.stringify(updatedProduct)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? data : p));
          addToast('Product updated successfully!', 'success');
      } catch (e: any) {
          addToast(e.message || "Failed to update product.", 'error');
      }
  };

  const deleteProduct = async (productId: number) => {
      try {
          const res = await fetchWithAuth(`${API_URL}/admin/products/${productId}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          setProducts(prev => prev.filter(p => p.id !== productId));
          addToast('Product deleted.', 'info');
      } catch (e: any) {
          addToast(e.message || "Failed to delete product.", 'error');
      }
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
      try {
          const res = await fetchWithAuth(`${API_URL}/admin/orders/${orderId}/status`, {
              method: 'PUT',
              body: JSON.stringify({ status })
          });
          const updatedOrder = await res.json();
          if (!res.ok) throw new Error(updatedOrder.message);
          setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
          addToast(`Order #${orderId} status updated.`, 'success');
      } catch (e: any) {
          addToast(e.message || "Failed to update order status.", 'error');
      }
  };


  const toggleCompare = (product: Product) => {
    setComparisonList(prev => {
        const isInList = prev.some(p => p.id === product.id);
        if (isInList) return prev.filter(p => p.id !== product.id);
        if (prev.length >= 4) {
            addToast('You can compare a maximum of 4 products.', 'info');
            return prev;
        }
        return [...prev, product];
    });
  };
  const isInCompare = (productId: number) => comparisonList.some(p => p.id === productId);
  const clearCompare = () => setComparisonList([]);

  return (
    <AppContext.Provider
      value={{
        cart, wishlist, user, toasts, recentlyViewed, products, orders, users,
        comparisonList, isOffline, addToCart, removeFromCart, updateQuantity,
        clearCart, toggleWishlist, isInWishlist, addWishlistToCart, login, signUp, logout,
        cartTotal, deliveryCharge, discount, finalTotal, addToast, removeToast,
        addRecentlyViewed, getProductById, updateUserProfile, addProduct, addProductsBulk, updateProduct, deleteProduct,
        updateOrderStatus, placeOrder, toggleCompare, isInCompare, clearCompare,
        // FIX: Provide new properties in context value
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