import React from 'react';

export const SensorStatus = ({ name, status, isLastUpdate = false }) => {
  return (
    <div className="bg-[#f8f9fb] dark:bg-neutral-800/60 border border-neutral-150 dark:border-neutral-750 rounded-2xl p-3.5 hover:bg-white dark:hover:bg-neutral-800 hover:border-neutral-250 dark:hover:border-neutral-600 hover:shadow-soft-sm dark:hover:shadow-none transition-all duration-200">
      <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
        {name}
      </span>
      <div className="flex items-center gap-1.5 mt-1.5">
        {!isLastUpdate && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
        )}
        <span
          className={`text-xs font-bold ${
            isLastUpdate ? 'text-neutral-600 dark:text-neutral-300 font-mono' : 'text-neutral-900 dark:text-white'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};
