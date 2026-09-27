import React, { useState, useEffect } from 'react';
import { adminAPI, parkingAPI } from '../../api/apiClient';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  Zap,
  Accessibility,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SlotManagement = () => {
  const [slots, setSlots] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    floorNumber: 1,
    slotNumber: '',
    vehicleType: 'Car',
    status: 'Available',
    isEV: false,
    isAccessible: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useNotification();

  const fetchFloors = async () => {
    try {
      const res = await parkingAPI.getFloors();
      if (res.data.success) {
        setFloors(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching floors:', err.message);
    }
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedFloor !== 'All') params.floorNumber = selectedFloor;
      if (selectedType !== 'All') params.vehicleType = selectedType;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await parkingAPI.getSlots(params);
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
    fetchFloors();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedFloor, selectedType, selectedStatus]);

  const openAddModal = () => {
    setEditingSlot(null);
    setFormData({
      floorNumber: Number(selectedFloor === 'All' ? 1 : selectedFloor),
      slotNumber: '',
      vehicleType: 'Car',
      status: 'Available',
      isEV: false,
      isAccessible: false
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setFormData({
      floorNumber: slot.floorNumber,
      slotNumber: slot.slotNumber,
      vehicleType: slot.vehicleType,
      status: slot.status,
      isEV: slot.isEV || false,
      isAccessible: slot.isAccessible || false
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const matchedFloor = floors.find((f) => f.floorNumber === Number(formData.floorNumber));
      const floorId = matchedFloor ? matchedFloor._id : floors[0]?._id;

      if (editingSlot) {
        await adminAPI.updateSlot(editingSlot._id, formData);
        addToast('Slot Updated', `Slot ${formData.slotNumber} updated successfully.`, 'success');
      } else {
        await adminAPI.createSlot({
          ...formData,
          floorId
        });
        addToast('Slot Created', `Slot ${formData.slotNumber} created.`, 'success');
      }
      setModalOpen(false);
      fetchSlots();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slot) => {
    if (window.confirm(`Delete slot ${slot.slotNumber}?`)) {
      try {
        await adminAPI.deleteSlot(slot._id);
        addToast('Slot Deleted', `Slot ${slot.slotNumber} removed.`, 'info');
        fetchSlots();
      } catch (err) {
        addToast('Error', err.message, 'danger');
      }
    }
  };

  const filteredSlots = slots.filter((slot) => {
    return (
      searchQuery === '' ||
      slot.slotNumber.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest font-mono">
            BAY INVENTORY MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Parking Slot Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Audit, modify, and assign vehicle classifications or mark slots for maintenance across the 500-slot mall bay.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search slot (e.g. C001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Floor:</span>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Types</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="SUV">SUV</option>
            <option value="EV">EV</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Slots Table */}
      {loading ? (
        <Loader text="Filtering slot inventory..." />
      ) : filteredSlots.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No slots match the selected criteria.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 sticky top-0 border-b border-slate-800 text-slate-400 font-medium z-10">
                <tr>
                  <th className="py-3.5 px-4">Slot</th>
                  <th className="py-3.5 px-4">Floor</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Attributes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSlots.map((slot) => (
                  <tr key={slot._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {slot.slotNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      Floor {slot.floorNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {slot.vehicleType}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {slot.isEV && (
                          <span className="p-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20" title="EV Charging">
                            <Zap className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {slot.isAccessible && (
                          <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Accessible Bay">
                            <Accessibility className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {!slot.isEV && !slot.isAccessible && (
                          <span className="text-slate-500 text-[11px]">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          slot.status === 'Available'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : slot.status === 'Occupied'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : slot.status === 'Reserved'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {slot.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(slot)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Slot"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(slot)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlot ? `Edit Slot ${editingSlot.slotNumber}` : 'Create New Bay'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Floor Number
              </label>
              <input
                type="number"
                required
                value={formData.floorNumber}
                onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Slot Code (Number)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. F1-C001"
                value={formData.slotNumber}
                onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="SUV">SUV</option>
                <option value="EV">EV</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.isEV}
                onChange={(e) => setFormData({ ...formData, isEV: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>EV Charger Installed</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.isAccessible}
                onChange={(e) => setFormData({ ...formData, isAccessible: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <Accessibility className="w-3.5 h-3.5 text-blue-400" />
              <span>Accessible Bay</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 mt-4"
          >
            {submitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
