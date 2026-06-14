import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { AdminProvider } from "./context/AdminContext";
import { AdminLayout } from "./components/AdminLayout";

// Import all screens
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsListPage } from "./pages/ProductsListPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { CategoriesListPage } from "./pages/CategoriesListPage";
import { CategoryFormPage } from "./pages/CategoryFormPage";
import { PaymentMethodsPage } from "./pages/PaymentMethodsPage";
import { FloorPlanPage } from "./pages/FloorPlanPage";
import { CouponsListPage } from "./pages/CouponsListPage";
import { CouponFormPage } from "./pages/CouponFormPage";
import { UsersListPage } from "./pages/UsersListPage";
import { UserFormPage } from "./pages/UserFormPage";
import { KdsSettingsPage } from "./pages/KdsSettingsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { KitchenPage } from "./pages/KitchenPage";
import { PosApp } from "./pos/PosApp";

// Dynamic Wrapper for Page Transition animations
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

// Route security checkpoint (Checks if login context matches)
const PrivateRoute = ({ children }) => {
  const raw = localStorage.getItem("cafe_admin_user");
  if (!raw) return <Navigate to="/login" replace />;
  const user = JSON.parse(raw);
  if (user.role === "EMPLOYEE") return <Navigate to="/pos/" replace />;
  if (user.role === "CHEF") return <Navigate to="/kitchen" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  const location = useLocation();

  return (
    <AdminProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PageWrapper>
                <LoginPage />
              </PageWrapper>
            }
          />
          <Route
            path="/signup"
            element={
              <PageWrapper>
                <SignupPage />
              </PageWrapper>
            }
          />

          {/* Secure Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <DashboardPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <ProductsListPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <ProductFormPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <ProductFormPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <CategoriesListPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories/new"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <CategoryFormPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories/:id/edit"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <CategoryFormPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/payment-methods"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <PaymentMethodsPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/floor-plan"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <FloorPlanPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <CouponsListPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/coupons/new"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <CouponFormPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/coupons/:id/edit"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <CouponFormPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <UsersListPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <UserFormPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <UserFormPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/kds-settings"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <KdsSettingsPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <ReportsPage />
                </PageWrapper>
              </PrivateRoute>
            }
          />

          <Route
            path="/kitchen"
            element={
              <PageWrapper>
                <KitchenPage />
              </PageWrapper>
            }
          />

          {/* Standalone Employee / Cashier POS View — isolated providers, no shared auth */}
          <Route
            path="/pos/*"
            element={<PosApp />}
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </AdminProvider>
  );
}

export default App;
