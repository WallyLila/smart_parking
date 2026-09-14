import React from 'react';
import { SensorStatus } from './SensorStatus';

export const SystemStatus = ({ items = [] }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
          System Status
        </h3>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Diagnostic
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <SensorStatus
            key={item.id}
            name={item.name}
            status={item.status}
            isLastUpdate={item.id === 'lastUpdate'}
          />
        ))}
      </div>
    </div>
  );
};
