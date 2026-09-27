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
  CheckCircle2,
  AlertCircle,
  Building
} from 'lucide-react';

export const FloorManagement = () => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [formData, setFormData] = useState({
    floorNumber: '',
    name: '',
    totalSlots: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useNotification();

  const fetchFloors = async () => {
    try {
      const res = await parkingAPI.getAvailability();
      if (res.data.success) {
        setFloors(res.data.floors);
      }
    } catch (err) {
      console.error('Error fetching floors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const openAddModal = () => {
    setEditingFloor(null);
    setFormData({
      floorNumber: floors.length + 1,
      name: `Floor ${floors.length + 1}`,
      totalSlots: 150
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (floor) => {
    setEditingFloor(floor);
    setFormData({
      floorNumber: floor.floorNumber,
      name: floor.name,
      totalSlots: floor.total
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingFloor) {
        await adminAPI.updateFloor(editingFloor.floorId, formData);
        addToast('Floor Updated', `${formData.name} updated successfully.`, 'success');
      } else {
        await adminAPI.createFloor(formData);
        addToast('Floor Added', `${formData.name} added to database.`, 'success');
      }
      setModalOpen(false);
      fetchFloors();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (floor) => {
    if (window.confirm(`Delete ${floor.name} and all associated parking slots?`)) {
      try {
        await adminAPI.deleteFloor(floor.floorId);
        addToast('Floor Removed', `${floor.name} deleted.`, 'info');
        fetchFloors();
      } catch (err) {
        addToast('Error', err.message, 'danger');
      }
    }
  };

  const totalMallSlots = floors.reduce((acc, f) => acc + (f.total || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest font-mono">
            STRUCTURE & CAPACITY CONTROLS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Floor Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure multi-level parking decks, track capacity utilization, and manage floor limits.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Parking Floor
        </button>
      </div>

      {/* Floors Cards */}
      {loading ? (
        <Loader text="Loading floor configurations..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {floors.map((floor) => (
            <div
              key={floor.floorId}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Floor {floor.floorNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(floor)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(floor)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-white">{floor.name}</h3>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {floor.total}{' '}
                    <span className="text-xs font-normal text-slate-400">Total Bays</span>
                  </div>
                </div>

                {/* Occupancy Progress */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Occupancy Rate</span>
                    <span className="font-bold text-emerald-400">{floor.occupancyPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${floor.occupancyPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950 rounded-xl">
                    <span className="text-[10px] text-emerald-400">Available</span>
                    <div className="font-bold text-white mt-0.5">{floor.available}</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl">
                    <span className="text-[10px] text-rose-400">Occupied</span>
                    <div className="font-bold text-white mt-0.5">{floor.occupied}</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl">
                    <span className="text-[10px] text-amber-400">Reserved</span>
                    <div className="font-bold text-white mt-0.5">{floor.reserved}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFloor ? 'Edit Floor Capacity' : 'Add Parking Floor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Floor Number
            </label>
            <input
              type="number"
              required
              value={formData.floorNumber}
              onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Floor Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Floor 1 — Ground Level"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Total Slot Capacity
            </label>
            <input
              type="number"
              required
              value={formData.totalSlots}
              onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 mt-4"
          >
            {submitting ? 'Saving...' : editingFloor ? 'Update Floor' : 'Create Floor'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
