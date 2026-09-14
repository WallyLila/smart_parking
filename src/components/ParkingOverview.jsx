import React from 'react';

export const ParkingOverview = ({ slots = [] }) => {
  const total = slots.length;
  const available = slots.filter((s) => s.status === 'available').length;
  const occupied = slots.filter((s) => s.status === 'occupied').length;

  const availablePct = total > 0 ? (available / total) * 100 : 0;
  const occupiedPct = total > 0 ? (occupied / total) * 100 : 0;

  return (
    <div className="bg-neutral-800 border border-neutral-700/60 rounded-3xl p-6 shadow-lg shadow-black/20">
      <h2 className="text-base font-semibold text-white tracking-tight">
        Parking Overview
      </h2>

      {/* Numerical Indicators */}
      <div className="grid grid-cols-3 gap-4 my-5 text-center sm:text-left">
        {/* Total */}
        <div>
          <span className="text-xs font-medium text-neutral-400 block uppercase tracking-wider">
            Total
          </span>
          <span className="text-3xl sm:text-4xl font-bold text-blue-500 mt-1 block">
            {total}
          </span>
          <span className="text-xs text-neutral-500 mt-0.5 block">Slots</span>
        </div>

        {/* Free / Available */}
        <div>
          <span className="text-xs font-medium text-neutral-400 block uppercase tracking-wider">
            Free
          </span>
          <span className="text-3xl sm:text-4xl font-bold text-emerald-500 mt-1 block">
            {available}
          </span>
          <span className="text-xs text-neutral-500 mt-0.5 block">Available</span>
        </div>

        {/* Occupied */}
        <div>
          <span className="text-xs font-medium text-neutral-400 block uppercase tracking-wider">
            Occupied
          </span>
          <span className="text-3xl sm:text-4xl font-bold text-orange-500 mt-1 block">
            {occupied}
          </span>
          <span className="text-xs text-neutral-500 mt-0.5 block">Slots</span>
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div className="space-y-2 pt-2">
        <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden flex border border-neutral-700/50">
          <div
            style={{ width: `${availablePct}%` }}
            className="bg-emerald-500 h-full transition-all duration-300"
            title={`${available} Available`}
          />
          <div
            style={{ width: `${occupiedPct}%` }}
            className="bg-orange-500 h-full transition-all duration-300"
            title={`${occupied} Occupied`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Available ({available})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
            Occupied ({occupied})
          </span>
        </div>
      </div>
    </div>
  );
};
