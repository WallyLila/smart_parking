import React from 'react';

export const ParkingOverview = ({ slots = [] }) => {
  const total = slots.length;
  const available = slots.filter((s) => s.status === 'available').length;
  const occupied = slots.filter((s) => s.status === 'occupied').length;

  const availablePct = total > 0 ? (available / total) * 100 : 0;
  const occupiedPct = total > 0 ? (occupied / total) * 100 : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-soft dark:shadow-none transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
            Parking Overview
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium transition-colors">
            Real-time occupancy and capacity distribution
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold border border-neutral-200/60 dark:border-neutral-700 transition-colors">
          Live Status
        </span>
      </div>

      {/* Numerical Indicators - Apple Minimalist Stats Style */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6 my-6 py-4 border-y border-neutral-100 dark:border-neutral-800 transition-colors">
        {/* Total */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
            Total Slots
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mt-1.5 block tracking-tight transition-colors">
            {total}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block font-medium">Configured</span>
        </div>

        {/* Free / Available */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
            Available
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5 block tracking-tight transition-colors">
            {available}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block font-medium">Ready to park</span>
        </div>

        {/* Occupied */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
            Occupied
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold text-neutral-800 dark:text-neutral-200 mt-1.5 block tracking-tight transition-colors">
            {occupied}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block font-medium">Parked</span>
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div className="space-y-3">
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-3.5 rounded-full p-0.5 overflow-hidden flex border border-neutral-200/50 dark:border-neutral-700/50 transition-colors">
          <div
            style={{ width: `${availablePct}%` }}
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            title={`${available} Available`}
          />
          <div
            style={{ width: `${occupiedPct}%` }}
            className="bg-neutral-800 dark:bg-neutral-600 h-full rounded-full transition-all duration-500 ml-0.5"
            title={`${occupied} Occupied`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium pt-0.5 transition-colors">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
            Available ({available} {available === 1 ? 'slot' : 'slots'})
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 dark:bg-neutral-400 inline-block shadow-sm"></span>
            Occupied ({occupied} {occupied === 1 ? 'slot' : 'slots'})
          </span>
        </div>
      </div>
    </div>
  );
};
