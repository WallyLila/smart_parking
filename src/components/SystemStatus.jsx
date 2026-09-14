import React from 'react';
import { SensorStatus } from './SensorStatus';

export const SystemStatus = ({ items = [] }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white tracking-tight">
        System Status
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
