import React, { useState } from 'react';
import { parkingAPI } from '../../api/apiClient';
import { DigitalTicket } from '../../components/parking/DigitalTicket';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Car,
  Bike,
  PlusCircle,
  Zap,
  Accessibility,
  ArrowRight,
  Printer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const VehicleEntry = () => {
  const { addToast } = useNotification();
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Car',
    customerName: '',
    customerPhone: '',
    preferredFloor: '',
    isEV: false,
    isAccessible: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.vehicleNumber.trim()) {
      setError('Please provide a valid vehicle registration number');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        vehicleType: formData.vehicleType,
        customerName: formData.customerName.trim() || 'Mall Visitor',
        customerPhone: formData.customerPhone.trim() || '',
        preferredFloor: formData.preferredFloor ? Number(formData.preferredFloor) : null,
        isEV: formData.isEV,
        isAccessible: formData.isAccessible
      };

      const res = await parkingAPI.vehicleEntry(payload);

      if (res.data.success) {
        setCreatedTicket(res.data.data.ticket);
        setTicketModalOpen(true);
        addToast(
          'Vehicle Parked Successfully',
          `Slot ${res.data.data.slot.slotNumber} allocated for ${formData.vehicleNumber}`,
          'success'
        );
        // Reset form
        setFormData({
          vehicleNumber: '',
          vehicleType: 'Car',
          customerName: '',
          customerPhone: '',
          preferredFloor: '',
          isEV: false,
          isAccessible: false
        });
      }
    } catch (err) {
      setError(err.message || 'Vehicle entry processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest font-mono">
          ENTRANCE BOOM-BARRIER GATE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Process Vehicle Entry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Register incoming vehicles at the mall entrance and issue instant QR-coded passes.
        </p>
      </div>

      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vehicle Registration Number *
              </label>
              <input
                type="text"
                required
                name="vehicleNumber"
                placeholder="e.g. UP16AB1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vehicle Category *
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Car">Car (Hatchback / Sedan)</option>
                <option value="Bike">Motorbike / 2-Wheeler</option>
                <option value="SUV">SUV (Large Four-Wheeler)</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Driver / Customer Name (Optional)
              </label>
              <input
                type="text"
                name="customerName"
                placeholder="Mall Visitor"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Driver Contact Phone (Optional)
              </label>
              <input
                type="tel"
                name="customerPhone"
                placeholder="+91 9876543210"
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Floor Preference
            </label>
            <select
              name="preferredFloor"
              value={formData.preferredFloor}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Dynamic Auto-Allocation (Recommended Nearest)</option>
              <option value="1">Floor 1 (Ground Level)</option>
              <option value="2">Floor 2 (Mezzanine Deck)</option>
              <option value="3">Floor 3 (Upper Terrace)</option>
            </select>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                name="isEV"
                checked={formData.isEV}
                onChange={handleChange}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>EV Fast Charging Required</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                name="isAccessible"
                checked={formData.isAccessible}
                onChange={handleChange}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <Accessibility className="w-3.5 h-3.5 text-blue-400" />
              <span>Accessible / Handicap Bay</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Allocate Slot & Print Digital Ticket</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Ticket Modal */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Vehicle Entry Complete — Digital Pass"
        maxWidth="max-w-md"
      >
        {createdTicket && (
          <DigitalTicket ticket={createdTicket} showActions={true} />
        )}
      </Modal>
    </div>
  );
};
