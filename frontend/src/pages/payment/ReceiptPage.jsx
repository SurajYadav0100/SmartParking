import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paymentAPI } from '../../api/apiClient';
import { ReceiptCard } from '../../components/parking/ReceiptCard';
import { Loader } from '../../components/common/Loader';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const ReceiptPage = () => {
  const { receiptId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await paymentAPI.getReceipt(receiptId);
        if (res.data.success) {
          setReceipt(res.data.receipt);
        }
      } catch (err) {
        setError(err.message || 'Receipt not found');
      } finally {
        setLoading(false);
      }
    };

    if (receiptId) {
      fetchReceipt();
    }
  }, [receiptId]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <div className="no-print">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to SmartPark Home
        </Link>
      </div>

      {loading ? (
        <Loader text="Retrieving digital invoice & tax receipt..." />
      ) : error ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Receipt Lookup Error</h3>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : (
        <ReceiptCard receipt={receipt} />
      )}
    </div>
  );
};
