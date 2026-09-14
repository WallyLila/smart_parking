import React from 'react';

export const ActivityList = ({ activities = [] }) => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-soft dark:shadow-none transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
          Recent Activity
        </h3>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Feed
        </span>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800 transition-colors">
        {activities.map((item) => (
          <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
            <span
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                item.status === 'available'
                  ? 'bg-emerald-500'
                  : item.status === 'occupied'
                  ? 'bg-neutral-800 dark:bg-neutral-300'
                  : 'bg-neutral-400'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 transition-colors">
                {item.text}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
