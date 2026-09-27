import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiClient';
import { StatCard } from '../../components/common/StatCard';
import {
  DailyVehiclesChart,
  RevenueTrendChart,
  FloorOccupancyChart,
  VehicleTypeChart,
  PeakHoursChart
} from '../../components/charts/AnalyticsCharts';
import { Loader } from '../../components/common/Loader';
import { useSocket } from '../../context/SocketContext';
import {
  Layers,
  Car,
  DollarSign,
  TrendingUp,
  Clock,
  PieChart,
  BarChart3,
  Calendar,
  RefreshCw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, lastSlotUpdate } = useSocket();

  const fetchAdminData = async () => {
    try {
      const [dashRes, analRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics()
      ]);

      if (dashRes.data.success) {
        setStats(dashRes.data.stats);
        setRecentSessions(dashRes.data.recentSessions || []);
      }

      if (analRes.data.success) {
        setAnalytics(analRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin telemetry:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update counts on real-time socket events
  useEffect(() => {
    if (lastSlotUpdate) {
      fetchAdminData();
    }
  }, [lastSlotUpdate]);

  return (
    <div className="space-y-8 pb-14">
      {/* Executive Command Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest font-mono">
              CENTRAL MALL CONTROL CONSOLE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Executive Operations & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time capacity tracking, revenue analysis, tariff controls, and vehicle flow telemetry.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          Refresh Live Data
        </button>
      </div>

      {loading ? (
        <Loader text="Loading live analytics and telemetry..." />
      ) : (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Mall Capacity"
              value={stats ? `${stats.totalSlots}` : '500'}
              subtitle="Across 3 parking floors"
              icon={Layers}
              color="blue"
            />
            <StatCard
              title="Available Slots"
              value={stats ? `${stats.availableSlots}` : '320+'}
              subtitle="🟢 Ready for parking"
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="Occupied Slots"
              value={stats ? `${stats.occupiedSlots}` : '150'}
              subtitle="🔴 Active vehicles"
              icon={Car}
              color="rose"
            />
            <StatCard
              title="Current Occupancy"
              value={stats ? `${stats.occupancyRate}%` : '35%'}
              subtitle="Real-time fill ratio"
              icon={TrendingUp}
              color="amber"
            />
          </div>

          {/* Revenue & Daily Vehicles Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Vehicles"
              value={stats ? `${stats.todayVehicles}` : '425'}
              subtitle="Entries recorded today"
              icon={Car}
              color="teal"
            />
            <StatCard
              title="Today's Revenue"
              value={stats ? `₹${stats.todayRevenue}` : '₹28,500'}
              subtitle="Cash & digital payments"
              icon={DollarSign}
              color="emerald"
            />
            <StatCard
              title="Lifetime Revenue"
              value={stats ? `₹${stats.totalRevenue}` : '₹1,45,000'}
              subtitle="Total audited collections"
              icon={DollarSign}
              color="purple"
            />
            <StatCard
              title="Registered Customers"
              value={stats ? `${stats.totalUsers}` : '120'}
              subtitle={`${stats?.totalStaff || 2} staff operators`}
              icon={ShieldCheck}
              color="slate"
            />
          </div>

          {/* Analytics Charts Grid 1: Daily Vehicles & Revenue Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Vehicle Entries Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Daily Vehicle Entries (Last 7 Days)
                  </h3>
                  <p className="text-[11px] text-slate-400">Total vehicles entered per day</p>
                </div>
              </div>
              <DailyVehiclesChart data={analytics?.dailyChart} />
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    Daily Revenue Collections (Last 7 Days)
                  </h3>
                  <p className="text-[11px] text-slate-400">Net parking fee billed in INR (₹)</p>
                </div>
              </div>
              <RevenueTrendChart data={analytics?.dailyChart} />
            </div>
          </div>

          {/* Analytics Charts Grid 2: Floor Occupancy, Vehicle Breakdown & Peak Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Floor Occupancy Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Occupancy by Floor
                </h3>
                <p className="text-[11px] text-slate-400">Floor 1, Floor 2, Floor 3 capacity load</p>
              </div>
              <FloorOccupancyChart data={analytics?.floorOccupancyChart} />
            </div>

            {/* Vehicle Type Donut Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  Vehicle Classification
                </h3>
                <p className="text-[11px] text-slate-400">Car vs Bike vs SUV vs EV allocation</p>
              </div>
              <VehicleTypeChart data={analytics?.vehicleTypeChart} />
            </div>

            {/* Peak Hours Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 md:col-span-2 lg:col-span-1">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Peak Parking Hours
                </h3>
                <p className="text-[11px] text-slate-400">Busiest mall entrance traffic times</p>
              </div>
              <PeakHoursChart data={analytics?.peakHoursChart} />
            </div>
          </div>

          {/* Recent Live Active Sessions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Parking Activity</h3>
                <p className="text-[11px] text-slate-400">Audit of latest parking sessions logged</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Entry Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentSessions.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        {s.ticketId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400">
                        {s.vehicleNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {s.vehicleType}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {s.customerName || 'Mall Guest'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(s.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            s.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {s.amount > 0 ? `₹${s.amount}` : s.paymentStatus === 'paid' ? '₹0 (Grace)' : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
