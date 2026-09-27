import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiClient';
import { Loader } from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import {
  DollarSign,
  Save,
  Car,
  Bike,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

export const RateManagement = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);
  const { addToast } = useNotification();

  const fetchRates = async () => {
    try {
      const res = await adminAPI.getRates();
      if (res.data.success) {
        setRates(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching rates:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleRateChange = (index, field, value) => {
    const updated = [...rates];
    updated[index][field] = Number(value);
    setRates(updated);
  };

  const handleSaveRate = async (rate, index) => {
    setSavingIndex(index);
    try {
      const res = await adminAPI.updateRate({
        vehicleType: rate.vehicleType,
        firstHourRate: rate.firstHourRate,
        additionalHourRate: rate.additionalHourRate,
        maximumDailyRate: rate.maximumDailyRate,
        gracePeriod: rate.gracePeriod
      });

      if (res.data.success) {
        addToast('Tariffs Saved', `Rates for ${rate.vehicleType} updated successfully.`, 'success');
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to update rates', 'danger');
    } finally {
      setSavingIndex(null);
    }
  };

  const getVehicleIcon = (type) => {
    if (type === 'Bike') return <Bike className="w-5 h-5 text-orange-400" />;
    if (type === 'EV') return <Zap className="w-5 h-5 text-teal-400" />;
    return <Car className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest font-mono">
          TARIFF ENGINE & PRICING RULES
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Parking Rate Management
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Configure initial hourly fees, tiered incremental rates, daily caps, and grace period thresholds per vehicle class.
        </p>
      </div>

      {loading ? (
        <Loader text="Loading tariff configurations..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rates.map((rate, index) => (
            <div
              key={rate._id || rate.vehicleType}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {getVehicleIcon(rate.vehicleType)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{rate.vehicleType}</h3>
                    <p className="text-[11px] text-slate-400">Class Tariff Plan</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveRate(rate, index)}
                  disabled={savingIndex === index}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                >
                  {savingIndex === index ? (
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">
                    First Hour Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={rate.firstHourRate}
                    onChange={(e) => handleRateChange(index, 'firstHourRate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Additional Hour (₹)
                  </label>
                  <input
                    type="number"
                    value={rate.additionalHourRate}
                    onChange={(e) => handleRateChange(index, 'additionalHourRate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Maximum Daily Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={rate.maximumDailyRate}
                    onChange={(e) => handleRateChange(index, 'maximumDailyRate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Grace Period (Mins)
                  </label>
                  <input
                    type="number"
                    value={rate.gracePeriod}
                    onChange={(e) => handleRateChange(index, 'gracePeriod', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Free exit threshold:</span>
                <span className="text-emerald-400 font-semibold">{rate.gracePeriod} minutes complimentary</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
