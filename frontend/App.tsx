// src/App.tsx
import React, { useEffect } from "react";
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AccountPage } from "./pages/AccountPage";
import { WishlistPage } from "./pages/WishlistPage";
import { SearchPage } from "./pages/SearchPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AppProvider, useAppContext } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext"; // ✅ Correct import
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { ComparisonTray } from "./components/ComparisonTray";
import { AlertTriangle } from "lucide-react";
import { OfflineModal } from "./components/ui/OfflineModal";

// Admin Imports
import { AdminLayout } from "./admin/AdminLayout";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminProductsPage } from "./admin/AdminProductsPage";
import { AdminOrdersPage } from "./admin/AdminOrdersPage";
import { AdminUsersPage } from "./admin/AdminUsersPage";
import { ProtectedRoute } from "./admin/ProtectedRoute";
import { AdminLoginPage } from "./pages/AdminLoginPage";

// Password reset pages
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

// Scrolls to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main Layout (shared by all public pages)
const MainLayout = () => {
  const { isOffline, showOfflineModal, closeOfflineModal } = useAppContext();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-lightest text-text-primary">
      {isOffline && (
        <div className="bg-yellow-400 text-yellow-900 font-bold p-2 text-center flex items-center justify-center sticky top-0 z-[100]">
          <AlertTriangle size={16} className="mr-2" />
          Connection failed. Viewing in offline mode.
        </div>
      )}
      <Header />
      <OfflineModal isOpen={showOfflineModal} onClose={closeOfflineModal} />
      <main className="flex-grow container mx-auto px-4 py-8 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
      <ComparisonTray />
    </div>
  );
};

// ✅ App Component
const App: React.FC = () => {
  return (
    <AppProvider>
      {/* ✅ Wrap the entire app with ToastProvider */}
      <ToastProvider>
        <HashRouter>
          <ScrollToTop />
          <Routes>
            {/* ------------------- ADMIN ROUTES ------------------- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
            </Route>

            {/* ------------------- PUBLIC ROUTES ------------------- */}
            <Route path="/*" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products/:categorySlug" element={<ProductsPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="admin-login" element={<AdminLoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="track-order" element={<OrderTrackingPage />} />
              <Route path="track-order/:orderId" element={<OrderTrackingPage />} />

              {/* Password Reset Routes */}
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password/:token" element={<ResetPasswordPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  );
};

export default App;
