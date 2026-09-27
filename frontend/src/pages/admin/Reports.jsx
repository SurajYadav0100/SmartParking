import React, { useState, useEffect } from 'react';
import { adminAPI, notificationAPI } from '../../api/apiClient';
import { Loader } from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import {
  FileText,
  Download,
  Send,
  Calendar,
  DollarSign,
  Car,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Reports = () => {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast announcement form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [announcementType, setAnnouncementType] = useState('info');
  const [sending, setSending] = useState(false);
  const { addToast } = useNotification();

  useEffect(() => {
    adminAPI
      .getDashboard()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentSessions(res.data.recentSessions || []);
        }
      })
      .catch((err) => console.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setSending(true);
    try {
      await notificationAPI.createAnnouncement({
        title,
        message,
        type: announcementType,
        role: targetRole
      });
      addToast('Broadcast Dispatched', 'Real-time alert sent to connected users.', 'success');
      setTitle('');
      setMessage('');
    } catch (err) {
      addToast('Error', err.message, 'danger');
    } finally {
      setSending(false);
    }
  };

  const handleExportCSV = () => {
    if (recentSessions.length === 0) {
      addToast('No Data', 'No sessions available to export', 'warning');
      return;
    }

    const headers = ['Ticket ID,Vehicle Number,Vehicle Type,Customer,Entry Time,Amount,Payment Status'];
    const rows = recentSessions.map((s) =>
      `"${s.ticketId}","${s.vehicleNumber}","${s.vehicleType}","${s.customerName || 'Guest'}","${s.entryTime}","${s.amount}","${s.paymentStatus}"`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartPark_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Report Downloaded', 'CSV exported successfully', 'success');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest font-mono">
            AUDIT TRAIL & SYSTEM DISPATCH
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Reports & Announcements
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Export session logs as CSV spreadsheets and broadcast instant notifications to mall parkers and staff.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Sessions (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast System Announcement Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Broadcast Real-Time Mall Alert
            </h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Announcement Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Floor 3 Maintenance / EV Station Upgrade"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Recipient Audience
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Everyone (Mall Broadcast)</option>
                  <option value="customer">Customers Only</option>
                  <option value="staff">Staff Operators Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Alert Severity
                </label>
                <select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="info">Informational (Blue)</option>
                  <option value="success">Success / Milestone (Green)</option>
                  <option value="warning">Warning / Capacity Alert (Amber)</option>
                  <option value="danger">High Priority / Closure (Red)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Message Body
              </label>
              <textarea
                required
                rows={3}
                placeholder="Type the message to display on user screens..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Real-Time Alert</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Audit Metrics Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">System Audit Summary</h3>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Total System Parking Slots:</span>
                <span className="font-bold text-white font-mono">{stats?.totalSlots || 500}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Vehicles Logged Today:</span>
                <span className="font-bold text-emerald-400 font-mono">{stats?.todayVehicles || 0}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Net Revenue Today:</span>
                <span className="font-bold text-white font-mono">₹{stats?.todayRevenue || 0}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Lifetime Revenue Audited:</span>
                <span className="font-bold text-purple-400 font-mono">₹{stats?.totalRevenue || 0}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Records are synchronized with MongoDB Atlas and indexed for rapid retrieval and dispute resolution.
          </p>
        </div>
      </div>
    </div>
  );
};
