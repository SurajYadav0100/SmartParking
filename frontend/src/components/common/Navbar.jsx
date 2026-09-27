import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Car,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  QrCode,
  History,
  ShieldAlert,
  BarChart3,
  Layers,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { isConnected } = useSocket();
  const { notifications, unreadCount, markNotificationRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Smart<span className="text-emerald-400">Park</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Mall IoT
                </span>
              </div>
            </Link>

            {/* Socket Live Beacon */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 pl-3 border-l border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className="text-[11px] font-mono">
                {isConnected ? 'LIVE FEED' : 'CONNECTING...'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/find-parking"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/find-parking') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Live Slots
                </Link>
              </>
            ) : role === 'customer' ? (
              <>
                <Link
                  to="/customer/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/dashboard') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/find-parking"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/find-parking') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Find Parking
                </Link>
                <Link
                  to="/customer/my-tickets"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/my-tickets') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  My Tickets
                </Link>
                <Link
                  to="/customer/vehicles"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/vehicles') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  My Vehicles
                </Link>
                <Link
                  to="/customer/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/history') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  History
                </Link>
              </>
            ) : role === 'staff' ? (
              <>
                <Link
                  to="/staff/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/staff/dashboard') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Staff Portal
                </Link>
                <Link
                  to="/staff/entry"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/staff/entry') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Vehicle Entry
                </Link>
                <Link
                  to="/staff/exit"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/staff/exit') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Exit Gate & QR
                </Link>
                <Link
                  to="/find-parking"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/find-parking') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Live Floors
                </Link>
              </>
            ) : role === 'admin' ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/dashboard') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Admin Hub
                </Link>
                <Link
                  to="/admin/floors-slots"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/floors-slots') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Floors & Slots
                </Link>
                <Link
                  to="/admin/rates"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/rates') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Parking Rates
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/users') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Users & Staff
                </Link>
                <Link
                  to="/admin/reports"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/reports') ? 'text-emerald-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Reports
                </Link>
              </>
            ) : null}
          </div>

          {/* Right Action Buttons & User Menu */}
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-lg shadow-emerald-500/20 font-semibold"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <>
                {/* Notification Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-sm text-white">Notifications</span>
                        <span className="text-xs text-slate-400">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-y-reverse divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => markNotificationRead(n._id)}
                              className={`p-3.5 hover:bg-slate-800/60 transition cursor-pointer text-left ${
                                !n.isRead ? 'bg-slate-800/30' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="font-medium text-xs text-slate-200">{n.title}</span>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:block text-left text-xs">
                      <div className="font-medium text-white leading-tight">{user?.name}</div>
                      <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wide">
                        {user?.role}
                      </div>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                      <div className="px-4 py-3 border-b border-slate-800">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        <User className="w-4 h-4 mr-2.5 text-slate-400" />
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Home
              </Link>
              <Link
                to="/find-parking"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Live Slots
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-emerald-400 font-semibold"
              >
                Register
              </Link>
            </>
          ) : role === 'customer' ? (
            <>
              <Link
                to="/customer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Dashboard
              </Link>
              <Link
                to="/find-parking"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Find Parking
              </Link>
              <Link
                to="/customer/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                My Tickets
              </Link>
              <Link
                to="/customer/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                My Vehicles
              </Link>
              <Link
                to="/customer/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Parking History
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
              >
                Sign Out
              </button>
            </>
          ) : role === 'staff' ? (
            <>
              <Link
                to="/staff/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Staff Portal
              </Link>
              <Link
                to="/staff/entry"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Vehicle Entry
              </Link>
              <Link
                to="/staff/exit"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Exit Gate & QR
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/floors-slots"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Floors & Slots
              </Link>
              <Link
                to="/admin/rates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Parking Rates
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
              >
                Users & Staff
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
