import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { paymentAPI, ticketAPI, parkingAPI } from '../../api/apiClient';
import { ReceiptCard } from '../../components/parking/ReceiptCard';
import { Loader } from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import {
  CreditCard,
  QrCode,
  Smartphone,
  Landmark,
  Banknote,
  CheckCircle,
  AlertCircle,
  Clock,
  Car,
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId');
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [ticketId, setTicketId] = useState(ticketIdParam || '');
  const [ticketDetails, setTicketDetails] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'Card', 'Net Banking', 'Cash'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  // Form states for methods
  const [upiId, setUpiId] = useState('');
  const [selectedUPIApp, setSelectedUPIApp] = useState('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  const initializePayment = async (targetTicketId) => {
    if (!targetTicketId) return;

    setLoading(true);
    setError('');

    try {
      const res = await paymentAPI.createOrder(targetTicketId);
      if (res.data.success) {
        setOrderData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketIdParam) {
      initializePayment(ticketIdParam);
    }
  }, [ticketIdParam]);

  const handleProcessPayment = async () => {
    if (!orderData) return;

    setSubmitting(true);
    setError('');

    try {
      // 1. If Razorpay is enabled
      if (orderData.mode === 'razorpay' && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: Math.round(orderData.amount * 100),
          currency: 'INR',
          name: 'SmartPark Mall Parking',
          description: `Parking Fee for Ticket ${orderData.ticketId}`,
          order_id: orderData.orderId,
          handler: async (response) => {
            try {
              const verifyRes = await paymentAPI.verifyPayment({
                ticketId: orderData.ticketId,
                paymentMethod: 'Razorpay',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.data.success) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                setReceipt(verifyRes.data.receipt);
                addToast('Payment Successful!', 'Receipt generated.', 'success');
              }
            } catch (vErr) {
              setError(vErr.message);
            }
          },
          prefill: {
            name: orderData.session?.customerName || 'Mall Visitor',
            contact: orderData.session?.customerPhone || '9876543210'
          },
          theme: { color: '#10b981' }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setSubmitting(false);
        return;
      }

      // 2. Interactive Demo Gateway Flow
      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const demoPayload = {
        ticketId: orderData.ticketId,
        paymentMethod: paymentMethod,
        demoTransactionId: `DEMO-PAY-${Date.now().toString(36).toUpperCase()}`
      };

      const res = await paymentAPI.verifyPayment(demoPayload);

      if (res.data.success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setReceipt(res.data.receipt);
        addToast('Payment Successful!', 'Thank you! Exit gate will release slot.', 'success');
      }
    } catch (err) {
      setError(err.message || 'Payment execution failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest font-mono">
          SECURE CASHLESS CHECKOUT
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Pay Parking Fee
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete contactless payment to open exit boom-barrier and release your parking slot.
        </p>
      </div>

      {/* If receipt generated, show receipt view */}
      {receipt ? (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center justify-between">
            <span>Payment Confirmed! Your exit pass has been authorized.</span>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Go to Dashboard
            </button>
          </div>
          <ReceiptCard receipt={receipt} onBack={() => navigate('/customer/dashboard')} />
        </div>
      ) : (
        <>
          {/* Ticket ID search input if not present in query */}
          {!ticketIdParam && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Enter your Ticket ID to initiate checkout:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SP-2026-000123"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={() => initializePayment(ticketId)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Fetch Bill
                </button>
              </div>
            </div>
          )}

          {loading && <Loader text="Calculating parking fee and order summary..." />}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {orderData && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Order Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                    PARKING PASS BILLING INVOICE
                  </span>
                  <h3 className="text-xl font-mono font-extrabold text-white mt-0.5">
                    {orderData.ticketId}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Vehicle: <span className="font-mono text-white font-bold">{orderData.session?.vehicleNumber}</span> ({orderData.session?.vehicleType})
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-right">
                  <span className="text-[10px] uppercase text-slate-400">Total Payable Fee</span>
                  <div className="text-3xl font-extrabold text-emerald-400">
                    ₹{orderData.amount}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">INR Tax Inclusive</span>
                </div>
              </div>

              {/* Free grace period handling */}
              {orderData.amount === 0 ? (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <div className="font-bold text-sm">🎉 Free Grace Period Applied!</div>
                  <p>
                    Your vehicle stayed within the complimentary 10-minute mall grace period. No payment is required.
                  </p>
                  <button
                    onClick={handleProcessPayment}
                    disabled={submitting}
                    className="w-full mt-3 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    Confirm Free Exit & Open Barrier
                  </button>
                </div>
              ) : (
                <>
                  {/* Payment Method Tabs */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                      Select Payment Method
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                        { id: 'Card', label: 'Credit / Debit', icon: CreditCard },
                        { id: 'Net Banking', label: 'Net Banking', icon: Landmark },
                        { id: 'Cash', label: 'Cash at Gate', icon: Banknote }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = paymentMethod === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPaymentMethod(item.id)}
                            className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-semibold">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method Forms */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    {paymentMethod === 'UPI' && (
                      <div className="space-y-4">
                        <span className="text-xs font-medium text-slate-300 block">
                          Instant UPI Apps & QR Scan
                        </span>

                        <div className="grid grid-cols-4 gap-2 text-center">
                          {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                            <button
                              key={app}
                              type="button"
                              onClick={() => setSelectedUPIApp(app)}
                              className={`p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                                selectedUPIApp === app
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              {app}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Or Enter UPI Virtual Payment Address (VPA):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Card' && (
                      <div className="space-y-3">
                        <span className="text-xs font-medium text-slate-300 block">
                          Card Details (Visa, Mastercard, RuPay)
                        </span>

                        <div>
                          <input
                            type="text"
                            placeholder="Card Number: 4532 •••• •••• 8912"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            maxLength={5}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-center font-mono"
                          />
                          <input
                            type="password"
                            placeholder="CVV"
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value)}
                            maxLength={3}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-center font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-400" /> Card info is encrypted and never stored in MongoDB.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'Net Banking' && (
                      <div className="space-y-3">
                        <span className="text-xs font-medium text-slate-300 block">
                          Select Bank
                        </span>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="SBI">State Bank of India</option>
                          <option value="Axis">Axis Bank</option>
                          <option value="Kotak">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    )}

                    {paymentMethod === 'Cash' && (
                      <div className="text-xs text-slate-300 space-y-1">
                        <span className="font-semibold text-emerald-400">Cash Payment at Exit Gate</span>
                        <p className="text-[11px] text-slate-400">
                          Please hand over exactly ₹{orderData.amount} in cash to the parking booth attendant at the boom-barrier.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mode Badge */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      256-Bit SSL Encrypted Mall Checkout
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      MODE: {orderData.mode?.toUpperCase()} GATEWAY
                    </span>
                  </div>

                  {/* Submit Checkout Button */}
                  <button
                    onClick={handleProcessPayment}
                    disabled={submitting}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-sm transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Authorize Payment of ₹{orderData.amount}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
