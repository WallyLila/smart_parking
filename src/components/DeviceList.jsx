import React from 'react';
import { Radio, Cpu } from 'lucide-react';
import { deviceList } from '../data/mockData';

export const DeviceList = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-soft dark:shadow-none space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
          Detail Device
        </h3>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Telemetry
        </span>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800 transition-colors">
        {deviceList.map((device) => {
          const isEsp = device.name.includes('ESP32');

          return (
            <div
              key={device.id}
              className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Device Icon & Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#f8f9fb] dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 flex items-center justify-center shrink-0 text-neutral-800 dark:text-neutral-200 shadow-soft-sm transition-colors">
                  {isEsp ? (
                    <Cpu className="w-5 h-5" />
                  ) : (
                    <Radio className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white transition-colors">
                    {device.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {device.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Updates Count & Last Update */}
              <div className="flex items-center gap-6 self-end sm:self-auto text-right">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Updates</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono mt-0.5 block transition-colors">
                    {device.updates}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Last update</span>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-0.5 block transition-colors">
                    {device.lastUpdate}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
