import React from 'react';

export const ActivityList = ({ activities = [] }) => {
  return (
    <div className="bg-neutral-800 border border-neutral-700/60 rounded-3xl p-6 shadow-lg shadow-black/20">
      <h3 className="text-base font-semibold text-white tracking-tight mb-4">
        Recent Activity
      </h3>

      <div className="divide-y divide-neutral-700/50">
        {activities.map((item) => (
          <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
            <span
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                item.status === 'available'
                  ? 'bg-emerald-500'
                  : item.status === 'occupied'
                  ? 'bg-orange-500'
                  : 'bg-blue-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-200">
                {item.text}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
