import React from 'react';
import { Car, ShieldCheck, Cpu, Code2, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Smart<span className="text-emerald-400">Park</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Enterprise IoT & QR-based smart mall parking management platform built with the MERN Stack. 
              Accelerating entry, dynamic slot allocation, cashless payments, and real-time operational analytics.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="flex items-center">
                <Cpu className="w-4 h-4 mr-1 text-emerald-400" /> Real-Time Socket.IO
              </span>
              <span className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-teal-400" /> JWT & bcrypt Security
              </span>
              <span className="flex items-center">
                <Code2 className="w-4 h-4 mr-1 text-blue-400" /> B.Tech CSE Project
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/find-parking" className="hover:text-emerald-400 transition">
                  Floor Availability
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-emerald-400 transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#rates" className="hover:text-emerald-400 transition">
                  Parking Tariffs
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-emerald-400 transition">
                  Staff & Admin Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              MERN Architecture
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                MongoDB
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                Express.js
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                React.js (Vite)
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                Node.js
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                Tailwind CSS
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                Recharts
              </span>
              <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300">
                Razorpay
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SmartPark — Smart Mall Parking Management System.</p>
          <p className="flex items-center">
            Designed & Engineered with <Heart className="w-3.5 h-3.5 mx-1 text-rose-500 fill-rose-500" /> for Academic Excellence
          </p>
        </div>
      </div>
    </footer>
  );
};
