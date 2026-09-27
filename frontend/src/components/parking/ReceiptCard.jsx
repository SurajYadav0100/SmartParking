import React from 'react';
import { Printer, CheckCircle, Car, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReceiptCard = ({ receipt, onBack = null }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="printable-area max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100">
      {/* Top Banner */}
      <div className="bg-emerald-600/20 border-b border-emerald-500/30 p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 mb-3">
          <CheckCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white">Payment Successful</h3>
        <p className="text-xs text-emerald-400 mt-1">Digital Tax Invoice & Exit Pass</p>
      </div>

      {/* Receipt Body */}
      <div className="p-6 space-y-4">
        {/* Receipt & Ticket IDs */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Receipt ID:</span>
            <span className="font-mono font-bold text-white">{receipt.receiptId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ticket ID:</span>
            <span className="font-mono font-bold text-emerald-400">{receipt.ticketId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Transaction ID:</span>
            <span className="font-mono text-slate-300">{receipt.transactionId}</span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-2 text-xs divide-y divide-slate-800/80">
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Vehicle Number:</span>
            <span className="font-mono font-bold text-white">{receipt.vehicleNumber}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Vehicle Type:</span>
            <span className="text-slate-200">{receipt.vehicleType}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Slot Occupied:</span>
            <span className="font-mono font-bold text-white">{receipt.slotNumber}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Entry Time:</span>
            <span className="text-slate-300">{formatDate(receipt.entryTime)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Exit / Payment Time:</span>
            <span className="text-slate-300">{formatDate(receipt.paidAt || receipt.exitTime)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Total Duration:</span>
            <span className="font-bold text-white">{receipt.duration}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Payment Method:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium">
              {receipt.paymentMethod}
            </span>
          </div>
        </div>

        {/* Amount Paid Box */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">
              Total Amount Paid
            </span>
            <div className="text-2xl font-extrabold text-white mt-0.5">₹{receipt.amount}</div>
          </div>
          <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-full">
            PAID
          </span>
        </div>

        <p className="text-[10px] text-center text-slate-500 pt-2">
          Thank you for visiting! Exit gate boom-barrier will open automatically.
        </p>

        {/* Action Buttons */}
        <div className="no-print pt-2 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            Print / Save Receipt
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
