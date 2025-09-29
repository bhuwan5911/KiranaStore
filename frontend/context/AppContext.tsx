import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
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
  addReview: (productId: number, review: Omit<Review, 'id' | 'date' | 'user_id' | 'product_id' | '_id'>) => Promise<Review | null>;
  deleteReview: (productId: number, reviewId: any) => Promise<boolean>;
  editReview: (productId: number, reviewId: any, newRating: number, newComment: string) => Promise<Review | null>;
  updateUserProfile: (profileData: Partial<User>) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | '_id'>) => Promise<void>;
  addProductsBulk: (products: Omit<Product, 'id' | 'rating' | 'reviews'>[]) => Promise<{ success: boolean; message: string }>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  updateOrderStatus: (orderId: any, status: Order['status']) => Promise<void>;
  placeOrder: (shippingAddress: any) => Promise<{ error: string | null; outOfStockItems?: number[] }>;
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
  
  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const fetchProducts = useCallback(async () => {
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
  }, [addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
  
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setUsers([]);
    addToast('You have been logged out.', 'info');
  }, [addToast]);
  
  const fetchUserCart = useCallback(async () => { try { const res = await fetchWithAuth(`${API_URL}/users/cart`); if (res.ok) setCart(await res.json()); } catch (e) { console.error(e); } }, []);
  const fetchUserWishlist = useCallback(async () => { try { const res = await fetchWithAuth(`${API_URL}/users/wishlist`); if (res.ok) setWishlist(await res.json()); } catch (e) { console.error(e); } }, []);
  const fetchUserOrders = useCallback(async () => { try { const res = await fetchWithAuth(`${API_URL}/users/orders`); if (res.ok) setOrders(await res.json()); } catch(e) { console.error(e) } }, []);
  const fetchAdminData = useCallback(async () => { try { const [usersRes, ordersRes] = await Promise.all([ fetchWithAuth(`${API_URL}/admin/users`), fetchWithAuth(`${API_URL}/admin/orders`) ]); if(usersRes.ok) setUsers(await usersRes.json()); if(ordersRes.ok) setOrders(await ordersRes.json()); } catch(e) { console.error(e); } }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
        const res = await fetchWithAuth(`${API_URL}/users/profile`);
        if (!res.ok) {
            logout();
            return;
        }
        const userData = await res.json();
        setUser(userData);
        await fetchUserCart();
        await fetchUserWishlist();
        if (userData.role === 'admin') {
            await fetchAdminData();
        } else {
            await fetchUserOrders();
        }
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        logout();
    }
  }, [logout, fetchUserCart, fetchUserWishlist, fetchUserOrders, fetchAdminData]);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchUserProfile();
      }
    };
    loadUser();
  }, [fetchUserProfile]);
  
  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); addToast("You're back online!", 'success'); };
    const handleOffline = () => { setIsOffline(true); setShowOfflineModal(true); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (isOffline) { setShowOfflineModal(true); }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline, addToast]);

  const closeOfflineModal = () => setShowOfflineModal(false);
  
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

  const removeFromCart = async (productId: number) => {
    if (!user) return;
    try {
         const res = await fetchWithAuth(`${API_URL}/users/cart/${productId}`, { method: 'DELETE' });
         const data = await res.json();
         if (!res.ok) throw new Error(data.message);
         setCart(data);
         addToast('Item removed from cart.', 'info');
    } catch (e: any) {
        addToast(e.message || 'Could not remove item.', 'error');
    }
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
        setCart(data);
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
        setCart(data);
    } catch (e: any) {
        addToast(e.message || 'Could not update quantity.', 'error');
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

  const addRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed(prev => {
        const existing = prev.find(p => p.id === product.id);
        if (existing) return [product, ...prev.filter(p => p.id !== product.id)];
        return [product, ...prev].slice(0, 5);
    });
  }, []);

  const fetchReviewsForProduct = useCallback(async (productId: number): Promise<Review[]> => {
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
  }, [addToast]);
  
  const getProductById = (id: number) => products.find(p => p.id === id);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryCharge = cartTotal > 0 && cartTotal < 500 ? 40 : 0;
  const discount = cartTotal > 1000 ? 50 : 0;
  const finalTotal = cartTotal + deliveryCharge - discount;

  const placeOrder = async (shippingAddress: any) => {
    if (!user) return { error: "Please log in to place an order." };
    try {
        const res = await fetchWithAuth(`${API_URL}/users/orders`, {
            method: 'POST',
            body: JSON.stringify({ cart, shippingAddress })
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

  const addReview = async (productId: number, reviewData: Omit<Review, 'id' | 'date' | 'user_id' | 'product_id' | '_id'>): Promise<Review | null> => {
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
        await fetchProducts();
        return newReview as Review;
    } catch(e: any) {
      addToast(e.message || 'Network error: Could not submit review.', 'error');
      return null;
    }
  };
  
  const deleteReview = async (productId: number, reviewId: any) => {
    try {
        const res = await fetchWithAuth(`${API_URL}/products/${productId}/reviews/${reviewId}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
        }
        addToast('Review deleted successfully', 'success');
        await fetchProducts();
        return true;
    } catch (e: any) {
        addToast(e.message || "Failed to delete review.", 'error');
        return false;
    }
  };

  // --- BADLAV START ---
  // Naya editReview function add kiya gaya hai
  const editReview = async (productId: number, reviewId: any, newRating: number, newComment: string): Promise<Review | null> => {
    try {
        const res = await fetchWithAuth(`${API_URL}/products/${productId}/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify({ rating: newRating, comment: newComment }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
        }
        const updatedReview = await res.json();
        addToast('Review updated successfully', 'success');
        await fetchProducts(); // Product rating update ke liye products refetch karein
        return updatedReview;
    } catch (e: any) {
        addToast(e.message || "Failed to update review.", 'error');
        return null;
    }
  };
  // --- BADLAV END ---

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
  
  const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviews' | '_id'>) => {
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
            
            await fetchProducts();
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
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
          }
          setProducts(prev => prev.filter(p => p.id !== productId));
          addToast('Product deleted.', 'info');
      } catch (e: any) {
          addToast(e.message || "Failed to delete product.", 'error');
      }
  };
  
  const updateOrderStatus = async (orderId: any, status: Order['status']) => {
      try {
          const res = await fetchWithAuth(`${API_URL}/admin/orders/${orderId}/status`, {
              method: 'PUT',
              body: JSON.stringify({ status })
          });
          const updatedOrder = await res.json();
          if (!res.ok) throw new Error(updatedOrder.message);
          setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
          addToast(`Order status updated.`, 'success');
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
        categories, comparisonList, isOffline, addToCart, removeFromCart, updateQuantity,
        clearCart, toggleWishlist, isInWishlist, addWishlistToCart, login, signUp, logout,
        cartTotal, deliveryCharge, discount, finalTotal, addToast, removeToast,
        addRecentlyViewed, getProductById, updateUserProfile, addProduct, addProductsBulk, updateProduct, deleteProduct,
        updateOrderStatus, placeOrder, toggleCompare, isInCompare, clearCompare,
        showOfflineModal, closeOfflineModal, fetchReviewsForProduct, addReview, deleteReview, editReview, redeemPoints,
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

