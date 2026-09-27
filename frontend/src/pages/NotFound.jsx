import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ArrowLeft, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-emerald-400 mx-auto flex items-center justify-center shadow-xl">
          <Car className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Parking Bay Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The page or parking bay you are looking for has been moved, closed, or does not exist.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <Home className="w-4 h-4" />
            Return to Mall Home
          </Link>
        </div>
      </div>
    </div>
  );
};
