import React from 'react';

export const SensorStatus = ({ name, status, isLastUpdate = false }) => {
  return (
    <div className="bg-neutral-800 border border-neutral-700/60 rounded-2xl p-3.5 hover:bg-neutral-700/60 transition-all duration-200">
      <span className="text-xs text-neutral-400 block font-medium">
        {name}
      </span>
      <div className="flex items-center gap-1.5 mt-1.5">
        {!isLastUpdate && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
        )}
        <span
          className={`text-sm font-semibold ${
            isLastUpdate ? 'text-neutral-300 font-mono text-xs' : 'text-emerald-400'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};
