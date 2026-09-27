import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parkingAPI } from '../../api/apiClient';
import { ReceiptCard } from '../../components/parking/ReceiptCard';
import { QRScannerModal } from '../../components/qr/QRScannerModal';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  QrCode,
  Search,
  Clock,
  Car,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  LogOut
} from 'lucide-react';

export const VehicleExit = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useNotification();

  const [identifier, setIdentifier] = useState(searchParams.get('scan') || '');
  const [loading, setLoading] = useState(false);
  const [lookupData, setLookupData] = useState(null);
  const [error, setError] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processingExit, setProcessingExit] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Auto-search if scan query param is present in URL
  useEffect(() => {
    const scanParam = searchParams.get('scan');
    if (scanParam) {
      handleLookup(scanParam);
    }
  }, [searchParams]);

  const handleLookup = async (idToSearch) => {
    const target = idToSearch || identifier;
    if (!target.trim()) {
      setError('Please provide Ticket ID, Vehicle Number, or scan QR');
      return;
    }

    setError('');
    setLoading(true);
    setLookupData(null);
    setReceiptData(null);

    try {
      const res = await parkingAPI.lookupExit(target.trim());
      if (res.data.success) {
        setLookupData(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'No active parking session found for this vehicle/ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessExit = async () => {
    if (!lookupData) return;

    setProcessingExit(true);
    try {
      const res = await parkingAPI.vehicleExit({
        ticketId: lookupData.ticket?.ticketId || lookupData.session?.ticketId,
        paymentMethod: lookupData.fee === 0 ? 'Cash' : paymentMethod
      });

      if (res.data.success) {
        setReceiptData(res.data.receipt);
        addToast(
          'Vehicle Exited Successfully',
          `Slot ${res.data.receipt.slotNumber} has been released and is now Available.`,
          'success'
        );
      }
    } catch (err) {
      addToast('Exit Processing Failed', err.message, 'danger');
    } finally {
      setProcessingExit(false);
    }
  };

  const handleScanSuccess = (decoded) => {
    setIdentifier(decoded);
    handleLookup(decoded);
  };

  const resetForm = () => {
    setIdentifier('');
    setLookupData(null);
    setReceiptData(null);
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest font-mono">
            EXIT BOOM-BARRIER GATE & SETTLEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Vehicle Exit Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Scan visitor QR ticket, compute exact duration, collect fee, and release slot to Available.
          </p>
        </div>

        <button
          onClick={() => setQrModalOpen(true)}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          Camera QR Scanner
        </button>
      </div>

      {/* If Receipt is generated, show receipt view */}
      {receiptData ? (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center justify-between">
            <span>Boom-Barrier Opened! Slot has been released back into live inventory.</span>
            <button
              onClick={resetForm}
              className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Next Vehicle
            </button>
          </div>
          <ReceiptCard receipt={receiptData} onBack={resetForm} />
        </div>
      ) : (
        <>
          {/* Search Lookup Bar */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <span className="text-xs font-medium text-slate-300 block">
              Enter Ticket ID, Vehicle Registration Number, or QR Token:
            </span>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup();
              }}
              className="flex gap-2.5"
            >
              <input
                type="text"
                placeholder="e.g. SP-2026-000123 or DL01AB1234"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase tracking-wider"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Active Session Breakdown Card */}
          {lookupData && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    VERIFIED ACTIVE PARKING PASS
                  </span>
                  <h3 className="text-xl font-mono font-extrabold text-white mt-0.5">
                    {lookupData.ticket?.ticketId || lookupData.session?.ticketId}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400">Assigned Bay</span>
                  <div className="text-xl font-mono font-extrabold text-emerald-400">
                    {lookupData.slot?.slotNumber || 'Slot'}
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400">Vehicle</span>
                  <p className="text-sm font-mono font-bold text-white mt-1">
                    {lookupData.session?.vehicleNumber}
                  </p>
                  <p className="text-[10px] text-slate-500">{lookupData.session?.vehicleType}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400">Entry Time</span>
                  <p className="text-xs font-medium text-slate-200 mt-1">
                    {new Date(lookupData.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(lookupData.entryTime).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400">Exit Time</span>
                  <p className="text-xs font-medium text-slate-200 mt-1">
                    {new Date(lookupData.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-slate-500">Present</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400">Duration</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">
                    {lookupData.durationFormatted}
                  </p>
                  <p className="text-[10px] text-slate-500">{lookupData.durationMinutes} mins</p>
                </div>
              </div>

              {/* Fee Calculation Section */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Calculated Parking Fee
                    </span>
                    {lookupData.gracePeriodApplied && (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        ✓ 10-minute Free Grace Period Applied
                      </p>
                    )}
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    ₹{lookupData.fee}
                  </div>
                </div>

                {lookupData.rateConfig && (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex flex-wrap justify-between gap-2">
                    <span>First Hour: ₹{lookupData.rateConfig.firstHourRate}</span>
                    <span>Additional: ₹{lookupData.rateConfig.additionalHourRate}/hr</span>
                    <span>Max Daily: ₹{lookupData.rateConfig.maximumDailyRate}</span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector if fee > 0 and not paid */}
              {lookupData.fee > 0 && lookupData.paymentStatus !== 'paid' && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-300 block">
                    Select Collection Payment Method:
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['Cash', 'UPI', 'Card'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                          paymentMethod === method
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleProcessExit}
                disabled={processingExit}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-sm transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                {processingExit ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>
                      {lookupData.fee === 0
                        ? 'Approve Free Grace Exit & Open Gate'
                        : `Collect ₹${lookupData.fee} (${paymentMethod}) & Release Slot`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
