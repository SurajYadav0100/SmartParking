import React from 'react';

export const SlotStatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'Available':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Available
        </span>
      );
    case 'Occupied':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses}`}>
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          Occupied
        </span>
      );
    case 'Reserved':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses}`}>
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          Reserved
        </span>
      );
    case 'Maintenance':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600 ${sizeClasses}`}>
          <span className="h-2 w-2 rounded-full bg-slate-400"></span>
          Maintenance
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-800 text-slate-400 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const VehicleTypeBadge = ({ type }) => {
  let color = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (type === 'Bike') color = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  if (type === 'SUV') color = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  if (type === 'EV') color = 'bg-teal-500/10 text-teal-400 border-teal-500/20';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {type}
    </span>
  );
};
