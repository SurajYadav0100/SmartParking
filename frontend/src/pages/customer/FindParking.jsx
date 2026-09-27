import React, { useState, useEffect } from 'react';
import { FloorMap } from '../../components/parking/FloorMap';
import { DigitalTicket } from '../../components/parking/DigitalTicket';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { parkingAPI, vehicleAPI } from '../../api/apiClient';
import { useNotification } from '../../context/NotificationContext';
import {
  Sparkles,
  Car,
  Zap,
  Accessibility,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  QrCode
} from 'lucide-react';

export const FindParking = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const [vehicles, setVehicles] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Allocation form state
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [isEV, setIsEV] = useState(false);
  const [isAccessible, setIsAccessible] = useState(false);
  const [preferredFloor, setPreferredFloor] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      vehicleAPI
        .getVehicles()
        .then((res) => {
          if (res.data.success && res.data.data.length > 0) {
            setVehicles(res.data.data);
            setVehicleNumber(res.data.data[0].vehicleNumber);
            setVehicleType(res.data.data[0].vehicleType);
          }
        })
        .catch((err) => console.warn('Vehicles fetch error:', err.message));
    }
  }, [isAuthenticated]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setVehicleType(slot.vehicleType || 'Car');
    setIsEV(slot.isEV || false);
    setIsAccessible(slot.isAccessible || false);
    setError('');
    setBookingModalOpen(true);
  };

  const handleAutoAllocate = () => {
    setSelectedSlot(null); // Let backend algorithm decide
    setError('');
    setBookingModalOpen(true);
  };

  const handleVehicleSelectChange = (e) => {
    const selectedNum = e.target.value;
    setVehicleNumber(selectedNum);
    const found = vehicles.find((v) => v.vehicleNumber === selectedNum);
    if (found) {
      setVehicleType(found.vehicleType);
      if (found.vehicleType === 'EV') setIsEV(true);
    }
  };

  const handleConfirmParking = async (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleNumber.trim()) {
      setError('Please provide a vehicle registration number');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleType,
        slotId: selectedSlot ? selectedSlot._id : null,
        isEV,
        isAccessible,
        preferredFloor: preferredFloor ? Number(preferredFloor) : null,
        customerName: user?.name || 'Mall Guest',
        customerPhone: user?.phone || ''
      };

      const res = await parkingAPI.vehicleEntry(payload);

      if (res.data.success) {
        setGeneratedTicket(res.data.data.ticket);
        setBookingModalOpen(false);
        setTicketModalOpen(true);
        addToast(
          'Slot Allocated Successfully!',
          `Assigned to ${res.data.data.slot.slotNumber} on ${res.data.data.slot.floorName}`,
          'success'
        );
      }
    } catch (err) {
      setError(err.message || 'Slot allocation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            REAL-TIME PARKING DISCOVERY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Find & Reserve Mall Parking
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Pick your preferred floor bay directly or utilize the automated optimal slot algorithm for instant assignment.
          </p>
        </div>

        <button
          onClick={handleAutoAllocate}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-2xl text-xs transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          Auto-Allocate Best Slot
        </button>
      </div>

      {/* Interactive Floor Map */}
      <FloorMap onSelectSlot={handleSelectSlot} selectedSlotId={selectedSlot?._id} />

      {/* Booking / Allocation Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={selectedSlot ? `Reserve Slot ${selectedSlot.slotNumber}` : 'Automatic Slot Allocation'}
      >
        <form onSubmit={handleConfirmParking} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {selectedSlot ? (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400">Selected Bay:</span>
              <div className="text-base font-mono font-bold text-emerald-400">
                {selectedSlot.slotNumber} (Floor {selectedSlot.floorNumber})
              </div>
              <p className="text-[11px] text-slate-400">
                Designated for: {selectedSlot.vehicleType}
                {selectedSlot.isEV ? ' • High-Speed EV Charger' : ''}
                {selectedSlot.isAccessible ? ' • Accessible Parking' : ''}
              </p>
            </div>
          ) : (
            <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/20 text-xs text-emerald-300">
              ⚡ Smart Allocation Engine will inspect live occupancy and assign the closest available slot matching your vehicle.
            </div>
          )}

          {/* Vehicle Selection */}
          {vehicles.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select from Saved Vehicles
              </label>
              <select
                value={vehicleNumber}
                onChange={handleVehicleSelectChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {vehicles.map((v) => (
                  <option key={v._id} value={v.vehicleNumber}>
                    {v.vehicleNumber} — {v.model || v.vehicleType} ({v.vehicleType})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Vehicle Registration Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DL01AB1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase tracking-wider"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vehicle Category
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="SUV">SUV</option>
                <option value="EV">EV (Electric)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Floor
              </label>
              <select
                value={preferredFloor}
                onChange={(e) => setPreferredFloor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Any Active Floor</option>
                <option value="1">Floor 1 (Ground)</option>
                <option value="2">Floor 2 (Deck)</option>
                <option value="3">Floor 3 (Terrace)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isEV}
                onChange={(e) => setIsEV(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>EV Charging Station</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isAccessible}
                onChange={(e) => setIsAccessible(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <Accessibility className="w-3.5 h-3.5 text-blue-400" />
              <span>Accessible Parking</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Confirm & Generate Digital Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </Modal>

      {/* Success QR Ticket Modal */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Parking Pass Generated"
        maxWidth="max-w-md"
      >
        {generatedTicket && (
          <DigitalTicket ticket={generatedTicket} showActions={true} />
        )}
      </Modal>
    </div>
  );
};
