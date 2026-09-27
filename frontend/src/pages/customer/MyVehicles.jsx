import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../../api/apiClient';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import {
  Car,
  Bike,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  AlertCircle,
  Zap
} from 'lucide-react';

export const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Car',
    model: '',
    color: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useNotification();

  const fetchVehicles = async () => {
    try {
      const res = await vehicleAPI.getVehicles();
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleNumber: '',
      vehicleType: 'Car',
      model: '',
      color: ''
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      model: vehicle.model || '',
      color: vehicle.color || ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingVehicle) {
        await vehicleAPI.updateVehicle(editingVehicle._id, formData);
        addToast('Vehicle Updated', `${formData.vehicleNumber} updated successfully`, 'success');
      } else {
        await vehicleAPI.addVehicle(formData);
        addToast('Vehicle Added', `${formData.vehicleNumber} registered to your profile`, 'success');
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (window.confirm(`Are you sure you want to remove vehicle ${vehicle.vehicleNumber}?`)) {
      try {
        await vehicleAPI.deleteVehicle(vehicle._id);
        addToast('Vehicle Removed', `${vehicle.vehicleNumber} was removed.`, 'info');
        fetchVehicles();
      } catch (err) {
        addToast('Error', err.message, 'danger');
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            VEHICLE REGISTRATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            My Registered Vehicles
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Save your cars, bikes, SUVs, and electric vehicles for instantaneous one-tap parking slot allocation.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <Loader text="Loading your registered fleet..." />
      ) : vehicles.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Vehicles Registered</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Add your vehicle to enable automatic slot assignment and seamless entry at the mall barrier.
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition"
          >
            Add Vehicle Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <div
              key={v._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl transition relative flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400">
                    {v.vehicleType === 'Bike' ? (
                      <Bike className="w-6 h-6" />
                    ) : (
                      <Car className="w-6 h-6" />
                    )}
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {v.vehicleType}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-mono font-extrabold text-white tracking-wider">
                    {v.vehicleNumber}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {v.model || 'Standard Model'} {v.color ? `• ${v.color}` : ''}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Added {new Date(v.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(v)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(v)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}
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
              Registration Number
            </label>
            <input
              type="text"
              required
              disabled={!!editingVehicle}
              placeholder="e.g. DL01AB1234"
              value={formData.vehicleNumber}
              onChange={(e) =>
                setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase tracking-wider disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Vehicle Type
            </label>
            <select
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Car">Car (Hatchback / Sedan)</option>
              <option value="Bike">Motorbike / Scooter</option>
              <option value="SUV">SUV (Large Four-Wheeler)</option>
              <option value="EV">Electric Vehicle (EV)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Model Name
              </label>
              <input
                type="text"
                placeholder="e.g. Honda City"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Color
              </label>
              <input
                type="text"
                placeholder="e.g. Silver"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>{editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}</span>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};
