import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parkingAPI } from '../api/apiClient';
import {
  Car,
  QrCode,
  CreditCard,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const Home = () => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await parkingAPI.getAvailability();
        if (res.data.success) {
          setAvailability(res.data.summary);
        }
      } catch (err) {
        console.warn('Availability fetch failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const flowSteps = [
    { title: 'Register Vehicle', desc: 'Add vehicle details to your SmartPark customer profile.' },
    { title: 'Check Availability', desc: 'View live vacant slots across 3 mall floors in real time.' },
    { title: 'Optimal Allocation', desc: 'Backend algorithm matches nearest compatible slot.' },
    { title: 'Digital QR Ticket', desc: 'Instant QR code generated for boom-barrier entry.' },
    { title: 'Park Vehicle', desc: 'Drive directly to designated slot with zero queue delay.' },
    { title: 'Scan at Exit', desc: 'Camera or kiosk scans QR code to compute exact duration.' },
    { title: 'Instant Payment', desc: 'Pay via UPI, Cards, Netbanking, Cash, or Razorpay.' },
    { title: 'Slot Released', desc: 'Session closes & slot availability updates in real time.' }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Smart Mall Parking Platform • 500 Dynamic Slots
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Smart Parking. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Faster Entry. Easier Exit.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find, reserve and manage your mall parking in one simple platform. 
            Automated slot allocation, digital QR tickets, transparent tiered billing, and live WebSocket telemetry.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/find-parking"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 group"
            >
              <span>Find Parking Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/80 transition flex items-center justify-center gap-2"
            >
              Staff & Customer Sign In
            </Link>
          </div>

          {/* Live Quick Availability Ticker */}
          <div className="mt-16 max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Live Mall Occupancy Sensor Feed
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {isConnected ? 'ONLINE & SYNCED' : 'POLLING'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-center">
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <p className="text-xs text-slate-400">Total Capacity</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {availability ? availability.totalSlots : '500'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">3 Parking Floors</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-emerald-500/20">
                <p className="text-xs text-emerald-400">Available Slots</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {availability ? availability.availableSlots : '320+'}
                </p>
                <p className="text-[10px] text-emerald-500 mt-0.5">🟢 Ready to Park</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-rose-500/20">
                <p className="text-xs text-rose-400">Occupied Slots</p>
                <p className="text-2xl font-bold text-rose-400 mt-1">
                  {availability ? availability.occupiedSlots : '150'}
                </p>
                <p className="text-[10px] text-rose-500 mt-0.5">🔴 Parked Vehicles</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-2xl border border-amber-500/20">
                <p className="text-xs text-amber-400">Occupancy Rate</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {availability ? `${availability.occupancyRate}%` : '35%'}
                </p>
                <p className="text-[10px] text-amber-500 mt-0.5">Optimal Traffic Flow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            ENGINEERED FOR MODERN MALLS
          </h2>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            Complete Digital Parking Infrastructure
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            Solving long queues, manual paper passes, ticket loss, and uncoordinated slot management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Real-Time Parking Telemetry</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live slot statuses across all 3 mall floors. As vehicles enter or leave, Socket.IO broadcasts instant status updates.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Smart Backend Allocation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent algorithm matches vehicle classification (Car, Bike, SUV, EV) to nearest accessible vacant bay.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Paperless QR Tickets</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Secure QR tokens generated instantly upon entry. No crumpled paper slips; ticket is stored on your mobile.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Frictionless Cashless Checkout</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated duration fee calculation with grace period support. Pay via UPI, QR, Credit Card, or Cash.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Executive Analytics Hub</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive Recharts telemetry for revenue, vehicle flow, peak parking hours, and floor utilization rate.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">EV Charging Ready</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated high-power EV charging slots with specialized rates and designated charging zones.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Step-by-Step Flow */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            END-TO-END WORKFLOW
          </h2>
          <h3 className="text-3xl font-extrabold text-white mt-2">How SmartPark Works</h3>
          <p className="text-sm text-slate-400 mt-2">
            A frictionless 8-step journey from mall entrance barrier to automatic exit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flowSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between hover:bg-slate-900 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                  {idx + 1}
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">STEP 0{idx + 1}</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1.5">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Tariffs Demo */}
      <section id="rates" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            TRANSPARENT PRICING
          </h2>
          <h3 className="text-3xl font-extrabold text-white mt-2">Mall Parking Tariffs</h3>
          <p className="text-sm text-slate-400 mt-2">
            Configurable by mall admin. 10-minute free grace period for pickups and dropoffs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Car */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-semibold">
              Car / Hatchback / Sedan
            </span>
            <div className="text-3xl font-black text-white mt-4">
              ₹30 <span className="text-xs font-normal text-slate-400">/ first hour</span>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li className="flex items-center">✓ ₹20 / additional hour</li>
              <li className="flex items-center">✓ ₹200 daily maximum cap</li>
              <li className="flex items-center">✓ 10 mins free grace period</li>
            </ul>
          </div>

          {/* Bike */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-xs font-semibold">
              Motorbike / Scooter
            </span>
            <div className="text-3xl font-black text-white mt-4">
              ₹15 <span className="text-xs font-normal text-slate-400">/ first hour</span>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li className="flex items-center">✓ ₹10 / additional hour</li>
              <li className="flex items-center">✓ ₹100 daily maximum cap</li>
              <li className="flex items-center">✓ 10 mins free grace period</li>
            </ul>
          </div>

          {/* SUV */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-xs font-semibold">
              SUV / Premium Large
            </span>
            <div className="text-3xl font-black text-white mt-4">
              ₹40 <span className="text-xs font-normal text-slate-400">/ first hour</span>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li className="flex items-center">✓ ₹25 / additional hour</li>
              <li className="flex items-center">✓ ₹250 daily maximum cap</li>
              <li className="flex items-center">✓ 10 mins free grace period</li>
            </ul>
          </div>

          {/* EV */}
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase">
              Eco Saver
            </div>
            <span className="px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded text-xs font-semibold">
              Electric Vehicle (EV)
            </span>
            <div className="text-3xl font-black text-white mt-4">
              ₹25 <span className="text-xs font-normal text-slate-400">/ first hour</span>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li className="flex items-center">✓ ₹15 / additional hour</li>
              <li className="flex items-center">✓ High-speed charger included</li>
              <li className="flex items-center">✓ 15 mins free grace period</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Demo Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Experience the Future of Mall Parking
          </h3>
          <p className="mt-3 text-slate-300 text-sm max-w-xl mx-auto">
            Ready to test live vehicle entry, automatic slot allocation, QR pass generation, and cashless checkout?
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/find-parking"
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-500/20"
            >
              Explore Live Parking Map
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl text-sm transition border border-slate-700"
            >
              Sign In with Demo Accounts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
