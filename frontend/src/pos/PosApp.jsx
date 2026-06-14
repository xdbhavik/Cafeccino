import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// POS-scoped Providers (completely isolated from Admin providers)
import { AuthProvider, useAuth } from './context/AuthContext';
import { TablesProvider } from './context/TablesContext';
import { OrdersProvider } from './context/OrdersContext';
import { CustomersProvider } from './context/CustomersContext';
import { CartProvider } from './context/CartContext';

// POS Layout
import { TopNav } from './components/layout/TopNav';

// POS Pages
import { OrderViewPage } from './pages/OrderViewPage';
import { OrdersListPage } from './pages/OrdersListPage';
import { TableViewPage } from './pages/TableViewPage';
import { CustomersPage } from './pages/CustomersPage';

// Protected layout — redirects to shared /login if not an authenticated EMPLOYEE
const PosProtectedLayout = () => {
  const { isAuthenticated, loadingSession } = useAuth();

  if (!isAuthenticated) {
    // Redirect to the shared login page (not a separate POS login)
    return <Navigate to="/login" replace />;
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F5A623]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F] text-[#F0EDE8] overflow-hidden">
      <TopNav />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

// Inner routes component (needs to be inside AuthProvider to use useAuth)
const PosRoutes = () => {
  return (
    <Routes>
      {/* /pos/login — redirect to the shared login page */}
      <Route path="login" element={<Navigate to="/login" replace />} />

      {/* Protected: POS Employee Screens */}
      <Route element={<PosProtectedLayout />}>
        <Route index element={<OrderViewPage />} />
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="tables" element={<TableViewPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Root POS Application — all POS providers are scoped here
export const PosApp = () => {
  return (
    <AuthProvider>
      <TablesProvider>
        <OrdersProvider>
          <CustomersProvider>
            <CartProvider>
              <PosRoutes />
            </CartProvider>
          </CustomersProvider>
        </OrdersProvider>
      </TablesProvider>
    </AuthProvider>
  );
};

export default PosApp;
