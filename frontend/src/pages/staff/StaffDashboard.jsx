import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parkingAPI, ticketAPI } from '../../api/apiClient';
import { StatCard } from '../../components/common/StatCard';
import { QRScannerModal } from '../../components/qr/QRScannerModal';
import { Loader } from '../../components/common/Loader';
import { useSocket } from '../../context/SocketContext';
import {
  Car,
  QrCode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  AlertTriangle
} from 'lucide-react';

export const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected, lastSlotUpdate } = useSocket();
  const navigate = useNavigate();

  const fetchStaffData = async () => {
    try {
      const [availRes, slotsRes] = await Promise.all([
        parkingAPI.getAvailability(),
        parkingAPI.getSlots({ status: 'Occupied' })
      ]);

      if (availRes.data.success) {
        setStats(availRes.data.summary);
      }
      if (slotsRes.data.success) {
        setRecentEntries(slotsRes.data.data.slice(0, 10));
      }
    } catch (err) {
      console.error('Error loading staff dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Re-fetch or react when a slot is updated via WebSocket
  useEffect(() => {
    if (lastSlotUpdate) {
      fetchStaffData();
    }
  }, [lastSlotUpdate]);

  const handleScanSuccess = (scannedData) => {
    navigate(`/staff/exit?scan=${encodeURIComponent(scannedData)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/staff/exit?scan=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Gate Operational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-mono">
              STAFF GATE OPERATIONS • LIVE DESK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Mall Parking Control Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Handle vehicle entry, inspect parking passes, scan exit QR tickets, and clear boom-barriers in real time.
          </p>
        </div>

        {/* Quick Operations Bar */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/staff/entry"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Car className="w-4 h-4" />
            + Vehicle Entry
          </Link>
          <button
            onClick={() => setQrModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Scan Exit QR
          </button>
          <Link
            to="/staff/exit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition border border-slate-700 flex items-center gap-2"
          >
            Manual Exit Desk
          </Link>
        </div>
      </div>

      {/* Real-time Mall Occupancy Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mall Capacity"
          value={stats ? `${stats.totalSlots}` : '500'}
          subtitle="3 Active Floors"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Available Slots"
          value={stats ? `${stats.availableSlots}` : '320+'}
          subtitle="Ready for arrival"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Occupied Slots"
          value={stats ? `${stats.occupiedSlots}` : '150'}
          subtitle="Currently inside mall"
          icon={Car}
          color="rose"
        />
        <StatCard
          title="Occupancy Load"
          value={stats ? `${stats.occupancyRate}%` : '35%'}
          subtitle="Real-time capacity ratio"
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      {/* Fast Vehicle / Ticket Search */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Instant Search by Ticket ID (SP-2026-...) or Vehicle Number (DL01AB1234)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase tracking-wider font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Lookup & Exit
          </button>
        </form>
      </div>

      {/* Currently Occupied Slots Live Monitor Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-rose-400" />
              Currently Occupied Slots (Live Queue)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live telemetry of vehicles actively parked on mall premises
            </p>
          </div>
          <Link
            to="/find-parking"
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            Floor Map View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <Loader text="Loading occupied slots..." />
        ) : recentEntries.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No occupied slots recorded right now. All bays are available!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Floor</th>
                  <th className="py-3 px-4">Vehicle Type</th>
                  <th className="py-3 px-4">Active Ticket</th>
                  <th className="py-3 px-4">Vehicle Number</th>
                  <th className="py-3 px-4 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentEntries.map((slot) => (
                  <tr key={slot._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                      {slot.slotNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      Floor {slot.floorNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {slot.vehicleType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {slot.currentSessionId?.ticketId || 'Active'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {slot.currentSessionId?.vehicleNumber || 'Parked Vehicle'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/staff/exit?scan=${encodeURIComponent(
                              slot.currentSessionId?.ticketId || slot.slotNumber
                            )}`
                          )
                        }
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition"
                      >
                        Process Exit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
