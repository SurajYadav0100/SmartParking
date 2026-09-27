import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  QrCode,
  Layers,
  Users,
  Settings,
  DollarSign,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';

export const DashboardLayout = ({ roleRequired }) => {
  const { user, role, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Navigation menu items based on role
  let navItems = [];

  if (role === 'admin') {
    navItems = [
      { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Floors & Slots', path: '/admin/floors-slots', icon: Layers },
      { name: 'Parking Rates', path: '/admin/rates', icon: DollarSign },
      { name: 'Users & Staff', path: '/admin/users', icon: Users },
      { name: 'Reports & Audit', path: '/admin/reports', icon: FileText }
    ];
  } else if (role === 'staff') {
    navItems = [
      { name: 'Staff Control Hub', path: '/staff/dashboard', icon: LayoutDashboard },
      { name: 'Vehicle Entry', path: '/staff/entry', icon: Car },
      { name: 'Vehicle Exit & QR', path: '/staff/exit', icon: QrCode },
      { name: 'Floor Monitor', path: '/find-parking', icon: Layers }
    ];
  } else {
    navItems = [
      { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
      { name: 'Find Parking', path: '/find-parking', icon: Layers },
      { name: 'My Tickets', path: '/customer/my-tickets', icon: QrCode },
      { name: 'My Vehicles', path: '/customer/vehicles', icon: Car },
      { name: 'Parking History', path: '/customer/history', icon: FileText }
    ];
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};
