import React, { useState, useEffect } from 'react';
import { parkingAPI } from '../../api/apiClient';
import { SlotCard } from './SlotCard';
import { Loader } from '../common/Loader';
import { useSocket } from '../../context/SocketContext';
import { Layers, Filter, Search, RefreshCw, Zap, Accessibility } from 'lucide-react';

export const FloorMap = ({ onSelectSlot, selectedSlotId = null }) => {
  const [floors, setFloors] = useState([]);
  const [activeFloor, setActiveFloor] = useState(1);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { lastSlotUpdate } = useSocket();

  // Load floors
  const loadFloors = async () => {
    try {
      const res = await parkingAPI.getFloors();
      if (res.data.success) {
        setFloors(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching floors:', err.message);
    }
  };

  // Load slots for active floor
  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await parkingAPI.getSlots({ floorNumber: activeFloor });
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching slots:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloors();
  }, []);

  useEffect(() => {
    loadSlots();
  }, [activeFloor]);

  // Handle live socket slot updates dynamically in real-time
  useEffect(() => {
    if (lastSlotUpdate) {
      setSlots((prevSlots) =>
        prevSlots.map((s) => (s._id === lastSlotUpdate._id ? { ...s, ...lastSlotUpdate } : s))
      );
    }
  }, [lastSlotUpdate]);

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    const matchType = vehicleTypeFilter === 'All' || slot.vehicleType === vehicleTypeFilter;
    const matchStatus = statusFilter === 'All' || slot.status === statusFilter;
    const matchSearch =
      searchQuery === '' ||
      slot.slotNumber.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchType && matchStatus && matchSearch;
  });

  // Calculate live counts for legend on current floor
  const availableCount = slots.filter((s) => s.status === 'Available').length;
  const occupiedCount = slots.filter((s) => s.status === 'Occupied').length;
  const reservedCount = slots.filter((s) => s.status === 'Reserved').length;
  const evCount = slots.filter((s) => s.isEV).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Top Header: Floor Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Layers className="w-5 h-5 mr-2.5 text-emerald-400" />
            Interactive Mall Parking Floor Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual slot grid powered by WebSocket updates
          </p>
        </div>

        {/* Floor Selection Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[1, 2, 3].map((fNum) => (
            <button
              key={fNum}
              onClick={() => setActiveFloor(fNum)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeFloor === fNum
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Floor {fNum}
            </button>
          ))}
          <button
            onClick={loadSlots}
            title="Refresh floor"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search slot number (e.g. C001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Vehicle Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Type:</span>
          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Vehicle Types</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="SUV">SUV</option>
            <option value="EV">EV (Electric)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Only</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Visual Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl mb-6 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Available ({availableCount})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Occupied ({occupiedCount})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Reserved ({reservedCount})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-teal-400">
            <Zap className="w-3.5 h-3.5" />
            EV Charger ({evCount})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            Maintenance
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Showing {filteredSlots.length} of {slots.length} slots on Floor {activeFloor}
        </div>
      </div>

      {/* Slots Grid */}
      {loading ? (
        <Loader text={`Loading Floor ${activeFloor} slots...`} />
      ) : filteredSlots.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm font-medium">No parking slots match the selected filters.</p>
          <button
            onClick={() => {
              setVehicleTypeFilter('All');
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-emerald-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 max-h-[550px] overflow-y-auto pr-1">
          {filteredSlots.map((slot) => (
            <SlotCard
              key={slot._id}
              slot={slot}
              onSelect={onSelectSlot}
              isSelected={selectedSlotId === slot._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
