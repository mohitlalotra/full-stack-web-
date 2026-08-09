import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import ChallansPage from './pages/ChallansPage';
import InvoicesPage from './pages/InvoicesPage';

// Main App Layout Wrapper
const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 text-zinc-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes wrapped in MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />

              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Sales']} />}>
                <Route path="/customers" element={<CustomersPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Warehouse']} />}>
                <Route path="/products" element={<ProductsPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Warehouse']} />}>
                <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Warehouse']} />}>
                <Route path="/challans" element={<ChallansPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Accounts']} />}>
                <Route path="/invoices" element={<InvoicesPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
