import React from 'react';
import { Car, Bike, Zap, Accessibility, ShieldAlert } from 'lucide-react';

export const SlotCard = ({ slot, onSelect, isSelected = false }) => {
  const { slotNumber, vehicleType, status, isEV, isAccessible } = slot;

  // Determine styles based on status and attributes
  let bgClass = 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700';
  let indicatorColor = 'bg-slate-500';

  if (status === 'Available') {
    if (isEV) {
      bgClass = 'bg-teal-950/40 border-teal-500/40 text-teal-200 hover:border-teal-400 hover:bg-teal-900/40';
      indicatorColor = 'bg-teal-400';
    } else {
      bgClass = 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-900/40';
      indicatorColor = 'bg-emerald-400';
    }
  } else if (status === 'Occupied') {
    bgClass = 'bg-rose-950/40 border-rose-500/30 text-rose-300 opacity-90';
    indicatorColor = 'bg-rose-500';
  } else if (status === 'Reserved') {
    bgClass = 'bg-amber-950/40 border-amber-500/30 text-amber-300';
    indicatorColor = 'bg-amber-400';
  } else if (status === 'Maintenance') {
    bgClass = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed';
    indicatorColor = 'bg-slate-600';
  }

  if (isSelected) {
    bgClass += ' ring-2 ring-emerald-400 border-transparent shadow-lg shadow-emerald-500/20';
  }

  const renderIcon = () => {
    if (vehicleType === 'Bike') return <Bike className="w-4 h-4" />;
    return <Car className="w-4 h-4" />;
  };

  return (
    <div
      onClick={() => status === 'Available' && onSelect && onSelect(slot)}
      className={`relative p-3 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
        status === 'Available' ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'
      } ${bgClass}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold tracking-tight text-white">{slotNumber}</span>
        <span className={`w-2 h-2 rounded-full ${indicatorColor} ${status === 'Available' ? 'animate-pulse' : ''}`}></span>
      </div>

      {/* Middle Type and Icons */}
      <div className="my-2 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {renderIcon()}
          <span className="text-[11px] font-medium">{vehicleType}</span>
        </div>

        <div className="flex items-center space-x-1">
          {isEV && (
            <span title="EV Charging" className="text-teal-400">
              <Zap className="w-3.5 h-3.5" />
            </span>
          )}
          {isAccessible && (
            <span title="Accessible Parking" className="text-blue-400">
              <Accessibility className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Bottom Status label */}
      <div className="text-[10px] uppercase font-mono font-semibold tracking-wider flex items-center justify-between">
        <span>{status}</span>
      </div>
    </div>
  );
};
