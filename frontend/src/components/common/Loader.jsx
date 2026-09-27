import React from 'react';

export const Loader = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-12 h-12 border-4' : 'w-8 h-8 border-3';

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeClasses} border-emerald-500 border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className="text-sm font-medium text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 animate-pulse space-y-4">
    <div className="h-4 bg-slate-800 rounded w-1/3"></div>
    <div className="h-8 bg-slate-800 rounded w-1/2"></div>
    <div className="h-3 bg-slate-800 rounded w-2/3"></div>
  </div>
);
