import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  CreditCard,
  Clock,
  MapPin,
  Car,
  ShieldCheck,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const DigitalTicket = ({ ticket, session = null, showActions = true }) => {
  const navigate = useNavigate();

  if (!ticket) return null;

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

  const isCompleted = ticket.status === 'completed' || session?.status === 'completed';

  return (
    <div className="printable-area max-w-md mx-auto bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100">
      {/* Decorative Ticket Header Notch */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="w-5 h-5 text-white" />
          <span className="font-extrabold tracking-wider text-sm uppercase text-white">
            SmartPark Pass
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
            isCompleted
              ? 'bg-slate-900/80 text-slate-300'
              : 'bg-emerald-400 text-slate-950 animate-pulse'
          }`}
        >
          {isCompleted ? 'COMPLETED' : 'ACTIVE PASS'}
        </span>
      </div>

      {/* Ticket Body */}
      <div className="p-6 space-y-5">
        {/* Ticket ID & QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
          {ticket.qrCode ? (
            <img
              src={ticket.qrCode}
              alt={`QR for ${ticket.ticketId}`}
              className="w-48 h-48 object-contain"
            />
          ) : (
            <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400 font-mono text-xs">
              QR Code Placeholder
            </div>
          )}
          <span className="mt-2 text-xs font-mono font-bold tracking-widest text-slate-900">
            {ticket.ticketId}
          </span>
          <span className="text-[10px] text-slate-500 font-sans">
            Scan at automated mall exit gate or staff kiosk
          </span>
        </div>

        {/* Assigned Slot Highlight */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Assigned Floor
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {ticket.floorName || 'Floor 1'}
            </div>
          </div>
          <div className="border-l border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
              Parking Slot
            </div>
            <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
              {ticket.slotNumber}
            </div>
          </div>
        </div>

        {/* Vehicle & Customer Details */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Vehicle Number:</span>
            <span className="font-mono font-bold text-white tracking-wider">
              {ticket.vehicleNumber}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Vehicle Category:</span>
            <span className="font-medium text-white">{ticket.vehicleType}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Customer Name:</span>
            <span className="font-medium text-white">{ticket.customerName || 'Mall Visitor'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Entry Timestamp:</span>
            <span className="font-medium text-slate-200">{formatDate(ticket.entryTime)}</span>
          </div>
          {ticket.expectedExit && (
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Expected Exit:</span>
              <span className="font-medium text-slate-200">{formatDate(ticket.expectedExit)}</span>
            </div>
          )}
          {session?.amount > 0 && (
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Parking Fee:</span>
              <span className="font-bold text-emerald-400">₹{session.amount}</span>
            </div>
          )}
        </div>

        {/* Barcode Line Simulation */}
        <div className="pt-2 flex flex-col items-center">
          <div className="w-full h-8 flex justify-between items-center px-4 opacity-50 space-x-0.5">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-400 h-full"
                style={{ width: `${(i % 3) + 1}px` }}
              ></div>
            ))}
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1">
            SECURE VERIFICATION TOKEN • SMARTPARK IOT
          </span>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        {showActions && (
          <div className="no-print pt-2 flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              Print Ticket
            </button>

            {!isCompleted && (
              <button
                onClick={() => navigate(`/payment?ticketId=${ticket.ticketId}`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
              >
                <CreditCard className="w-4 h-4" />
                Pay & Exit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
