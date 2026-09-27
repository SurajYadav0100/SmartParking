import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './layouts/MainLayout';
import { Loader } from './components/common/Loader';

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { NotFound } from './pages/NotFound';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { FindParking } from './pages/customer/FindParking';
import { MyVehicles } from './pages/customer/MyVehicles';
import { MyTickets } from './pages/customer/MyTickets';
import { ParkingHistory } from './pages/customer/ParkingHistory';
import { Profile } from './pages/customer/Profile';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { VehicleEntry } from './pages/staff/VehicleEntry';
import { VehicleExit } from './pages/staff/VehicleExit';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FloorManagement } from './pages/admin/FloorManagement';
import { SlotManagement } from './pages/admin/SlotManagement';
import { RateManagement } from './pages/admin/RateManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { Reports } from './pages/admin/Reports';

// Payment Pages
import { PaymentPage } from './pages/payment/PaymentPage';
import { ReceiptPage } from './pages/payment/ReceiptPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader text="Verifying authentication session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If logged in but doesn't have permission for this role
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'staff') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              {/* Main Application Layout Wrapper */}
              <Route element={<MainLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/find-parking" element={<FindParking />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/receipt/:receiptId" element={<ReceiptPage />} />

                {/* Customer Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/vehicles"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                      <MyVehicles />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/my-tickets"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/history"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                      <ParkingHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Staff Operator Routes */}
                <Route
                  path="/staff/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/entry"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <VehicleEntry />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/exit"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <VehicleExit />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Management Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/floors-slots"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <FloorManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/slots"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SlotManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rates"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <RateManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
