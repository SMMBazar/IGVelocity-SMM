import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Marquee from './components/Marquee';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import MyOrders from './pages/MyOrders';
import AddFunds from './pages/AddFunds';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import AdminOrders from './pages/AdminOrders';
import AdminPayments from './pages/AdminPayments';
import AdminCoupons from './pages/AdminCoupons';
import Support from './pages/Support';
import SupportSettings from './pages/admin/SupportSettings';

const PrivateRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Marquee />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/new-order" element={<PrivateRoute><NewOrder /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/add-funds" element={<PrivateRoute><AddFunds /></PrivateRoute>} />
          <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/services" element={<PrivateRoute adminOnly><AdminServices /></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute adminOnly><AdminOrders /></PrivateRoute>} />
          <Route path="/admin/payments" element={<PrivateRoute adminOnly><AdminPayments /></PrivateRoute>} />
          <Route path="/admin/coupons" element={<PrivateRoute adminOnly><AdminCoupons /></PrivateRoute>} />
          <Route path="/admin/support" element={<PrivateRoute adminOnly><SupportSettings /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
