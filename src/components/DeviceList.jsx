import React from 'react';
import { Radio, Cpu } from 'lucide-react';
import { deviceList } from '../data/mockData';

export const DeviceList = () => {
  return (
    <div className="bg-neutral-800 border border-neutral-700/60 rounded-3xl p-6 shadow-lg shadow-black/20 space-y-4">
      <h3 className="text-base font-semibold text-white tracking-tight">
        Detail Device
      </h3>

      <div className="divide-y divide-neutral-700/50">
        {deviceList.map((device) => {
          const isEsp = device.name.includes('ESP32');

          return (
            <div
              key={device.id}
              className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Device Icon & Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-500 shadow-blue-glow-sm">
                  {isEsp ? (
                    <Cpu className="w-5 h-5" />
                  ) : (
                    <Radio className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {device.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-xs font-medium text-emerald-400">
                      {device.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Updates Count & Last Update */}
              <div className="flex items-center gap-6 self-end sm:self-auto text-right">
                <div>
                  <span className="text-xs text-neutral-400 block">Updates</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                    {device.updates}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Last update</span>
                  <span className="text-xs text-neutral-300 font-medium mt-0.5 block">
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
