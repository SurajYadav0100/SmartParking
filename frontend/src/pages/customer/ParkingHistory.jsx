import React, { useState, useEffect } from 'react';
import { paymentAPI, ticketAPI } from '../../api/apiClient';
import { ReceiptCard } from '../../components/parking/ReceiptCard';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import {
  FileText,
  Search,
  Download,
  Calendar,
  CreditCard,
  Car,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const ParkingHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentAPI.getHistory();
        if (res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching payments:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const openReceipt = async (receiptId) => {
    try {
      const res = await paymentAPI.getReceipt(receiptId);
      if (res.data.success) {
        setSelectedReceipt(res.data.receipt);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      console.error('Error loading receipt:', err.message);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      searchQuery === '' ||
      p.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiptId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;

    return matchSearch && matchMethod;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            PARKING ARCHIVE & BILLING
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Parking & Payment History
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Audit your past parking durations, transactions, and download official mall digital tax receipts.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Ticket ID, Vehicle Number, or Receipt ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Payment:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash">Cash</option>
            <option value="Razorpay">Razorpay</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <Loader text="Loading your parking records..." />
      ) : filteredPayments.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No parking transactions found matching your criteria.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3.5 px-4">Receipt ID</th>
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {p.receiptId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {p.ticketId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {p.vehicleNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{p.amount}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(p.paidAt || p.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReceipt(p.receiptId)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Digital Parking Receipt"
        maxWidth="max-w-md"
      >
        {selectedReceipt && (
          <ReceiptCard
            receipt={selectedReceipt}
            onBack={() => setReceiptModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};
