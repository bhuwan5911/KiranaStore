export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  relatedImages?: string[];
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: number; // Changed from string
  userId: string; 
  userName:string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  trackingHistory: { status: string; date: string; }[];
}

export interface User {
  id: string; // Changed from number to string for Supabase UUID
  name: string;
  email: string;
  address: string;
  phone: string;
  role: 'user' | 'admin';
  loyaltyPoints: number;
  stockNotifications?: number[]; // Made optional
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface Review {
    id: number;
    product_id: number;
    user_id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
}
export interface Category {
  slug: string;
  name: string;
}