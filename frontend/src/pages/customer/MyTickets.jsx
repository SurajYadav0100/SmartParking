import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../../api/apiClient';
import { DigitalTicket } from '../../components/parking/DigitalTicket';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import {
  QrCode,
  CreditCard,
  Clock,
  Car,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const res = await ticketAPI.getMyTickets();
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'active') return t.status === 'active';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            DIGITAL PARKING TICKETS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            My Parking Tickets & Passes
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Access encrypted QR codes for contactless exit gate scans and view parking history.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'active'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({tickets.filter((t) => t.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'completed'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({tickets.filter((t) => t.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <Loader text="Loading your parking passes..." />
      ) : filteredTickets.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Tickets Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have any tickets matching this category right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((t) => (
            <div
              key={t._id}
              className={`bg-slate-900 border rounded-3xl p-6 shadow-xl transition flex flex-col justify-between ${
                t.status === 'active'
                  ? 'border-emerald-500/40 hover:border-emerald-400'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {t.ticketId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      t.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="my-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      Slot Assigned
                    </span>
                    <div className="text-xl font-mono font-extrabold text-emerald-400">
                      {t.slotNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      Floor
                    </span>
                    <div className="text-sm font-bold text-white">
                      {t.floorName || 'Floor 1'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span className="font-mono text-white">{t.vehicleNumber} ({t.vehicleType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entry:</span>
                    <span className="text-slate-300">
                      {new Date(t.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => openTicketModal(t)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  View QR
                </button>

                {t.status === 'active' && (
                  <button
                    onClick={() => navigate(`/payment?ticketId=${t.ticketId}`)}
                    className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Pay & Exit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket QR Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Digital Parking Pass"
        maxWidth="max-w-md"
      >
        {selectedTicket && (
          <DigitalTicket
            ticket={selectedTicket}
            session={selectedTicket.session}
            showActions={true}
          />
        )}
      </Modal>
    </div>
  );
};
