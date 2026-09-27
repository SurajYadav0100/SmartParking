import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parkingAPI, ticketAPI, vehicleAPI } from '../../api/apiClient';
import { StatCard } from '../../components/common/StatCard';
import { DigitalTicket } from '../../components/parking/DigitalTicket';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import {
  Car,
  QrCode,
  CreditCard,
  Layers,
  Clock,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTicket, setActiveTicket] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      const [availRes, ticketsRes, vehRes] = await Promise.all([
        parkingAPI.getAvailability(),
        ticketAPI.getMyTickets(),
        vehicleAPI.getVehicles()
      ]);

      if (availRes.data.success) {
        setAvailability(availRes.data.summary);
      }

      if (ticketsRes.data.success) {
        const allTickets = ticketsRes.data.data;
        const active = allTickets.find((t) => t.status === 'active');
        setActiveTicket(active || null);
        setRecentTickets(allTickets.slice(0, 5));
      }

      if (vehRes.data.success) {
        setVehicles(vehRes.data.data);
      }
    } catch (err) {
      console.error('Error loading customer dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            CUSTOMER COMMAND DASHBOARD
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Welcome back, {user?.name || 'Driver'}! 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Monitor your parking tickets, find optimal available slots in real time, and process contactless digital checkouts.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/find-parking"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Find Parking
          </Link>
          <Link
            to="/customer/vehicles"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition border border-slate-700 flex items-center gap-2"
          >
            <Car className="w-4 h-4 text-emerald-400" />
            My Vehicles
          </Link>
        </div>
      </div>

      {/* Active Parking Status Card */}
      {activeTicket ? (
        <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE PARKING SESSION IN PROGRESS
              </div>
              <div className="flex flex-wrap items-baseline gap-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Slot <span className="text-emerald-400 font-mono">{activeTicket.slotNumber}</span>
                </h3>
                <span className="text-sm font-medium text-slate-300">
                  {activeTicket.floorName || 'Floor 1'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {activeTicket.vehicleNumber} ({activeTicket.vehicleType})
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Entered: {new Date(activeTicket.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Ticket ID: <span className="font-mono text-slate-200">{activeTicket.ticketId}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setTicketModalOpen(true)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                View QR Ticket
              </button>
              <button
                onClick={() => navigate(`/payment?ticketId=${activeTicket.ticketId}`)}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pay & Exit Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">No Active Parking Session</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                You do not have any vehicle parked right now.
              </p>
            </div>
          </div>
          <Link
            to="/find-parking"
            className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl text-xs transition self-start sm:self-auto flex items-center gap-1.5"
          >
            Find a Slot Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Real-time Mall Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mall Capacity"
          value={availability ? `${availability.totalSlots}` : '500'}
          subtitle="3 Parking Floors"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Available Slots"
          value={availability ? `${availability.availableSlots}` : '320+'}
          subtitle="Ready for entry"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Occupied Slots"
          value={availability ? `${availability.occupiedSlots}` : '150'}
          subtitle="Currently parked"
          icon={Car}
          color="rose"
        />
        <StatCard
          title="My Saved Vehicles"
          value={`${vehicles.length}`}
          subtitle="Registered in profile"
          icon={ShieldCheck}
          color="teal"
        />
      </div>

      {/* Two Columns: Saved Vehicles & Recent Parking History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Vehicles Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-400" />
              My Registered Vehicles
            </h3>
            <Link
              to="/customer/vehicles"
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <p className="text-xs">No vehicles registered yet.</p>
              <Link
                to="/customer/vehicles"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Your First Vehicle
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-white tracking-wider">
                      {v.vehicleNumber}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {v.model || v.vehicleType} {v.color ? `• ${v.color}` : ''}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {v.vehicleType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Parking Sessions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Parking Sessions & Tickets
            </h3>
            <Link
              to="/customer/history"
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              View Full History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent parking sessions recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-2">
                    <th className="py-2 font-medium">Ticket ID</th>
                    <th className="py-2 font-medium">Vehicle</th>
                    <th className="py-2 font-medium">Slot</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentTickets.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-mono font-bold text-slate-200">{t.ticketId}</td>
                      <td className="py-3 text-slate-300 font-mono">{t.vehicleNumber}</td>
                      <td className="py-3 font-mono text-emerald-400">{t.slotNumber}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            t.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => {
                            setActiveTicket(t);
                            setTicketModalOpen(true);
                          }}
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          View Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Digital Parking Ticket"
        maxWidth="max-w-md"
      >
        {activeTicket && (
          <DigitalTicket
            ticket={activeTicket}
            session={activeTicket.session}
            showActions={true}
          />
        )}
      </Modal>
    </div>
  );
};
