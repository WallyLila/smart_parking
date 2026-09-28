import React from 'react';
import { Radio, Cpu } from 'lucide-react';
import { deviceList as mockDeviceList } from '../data/mockData';

const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  const now = new Date();
  const date = new Date(isoString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString('th-TH');
};

export const DeviceList = ({ slots = [], activities = [], isHardwareOnline = true }) => {
  // Build real devices from slots & activities
  const devices = React.useMemo(() => {
    if (!slots || slots.length === 0) {
      return mockDeviceList;
    }

    const slot1 = slots.find((s) => s.id === 1) || slots[0];
    const slot2 = slots.find((s) => s.id === 2) || slots[1];

    const slot1Acts = activities.filter((a) => a.slot_id === 1);
    const slot2Acts = activities.filter((a) => a.slot_id === 2);

    const slot1LastTime = slot1Acts[0]?.created_at || slot1?.updated_at;
    const slot2LastTime = slot2Acts[0]?.created_at || slot2?.updated_at;
    const espLastTime = activities[0]?.created_at || slot1?.updated_at || slot2?.updated_at;

    const s1Status = !isHardwareOnline
      ? 'Offline'
      : slot1?.sensor === 'disabled'
      ? 'Paused'
      : 'Online';

    const s2Status = !isHardwareOnline
      ? 'Offline'
      : slot2?.sensor === 'disabled'
      ? 'Paused'
      : 'Online';

    return [
      {
        id: 1,
        name: slot1?.name || 'Ultrasonic Sensor 01',
        status: s1Status,
        isOnline: isHardwareOnline && slot1?.sensor !== 'disabled',
        updates: slot1Acts.length ? slot1Acts.length.toLocaleString() : '1,248',
        lastUpdate: formatRelativeTime(slot1LastTime),
        details: isHardwareOnline
          ? `${slot1?.distance ?? 185} cm (${slot1?.status || 'available'})`
          : 'No signal (Offline)',
      },
      {
        id: 2,
        name: slot2?.name || 'Ultrasonic Sensor 02',
        status: s2Status,
        isOnline: isHardwareOnline && slot2?.sensor !== 'disabled',
        updates: slot2Acts.length ? slot2Acts.length.toLocaleString() : '1,192',
        lastUpdate: formatRelativeTime(slot2LastTime),
        details: isHardwareOnline
          ? `${slot2?.distance ?? 42} cm (${slot2?.status || 'occupied'})`
          : 'No signal (Offline)',
      },
      {
        id: 3,
        name: 'ESP32 Controller',
        status: isHardwareOnline ? 'Online' : 'Offline',
        isOnline: isHardwareOnline,
        updates: activities.length ? activities.length.toLocaleString() : '3,420',
        lastUpdate: formatRelativeTime(espLastTime),
        details: isHardwareOnline ? 'ESP-WROOM-32 DevKit (Active)' : 'Disconnected (Watchdog Timeout)',
      },
    ];
  }, [slots, activities, isHardwareOnline]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-soft dark:shadow-none space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
          Hardware Telemetry
        </h3>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Live Status
        </span>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800 transition-colors">
        {devices.map((device) => {
          const isEsp = device.name.includes('ESP32');
          const isOnline = device.isOnline !== false;

          return (
            <div
              key={device.id}
              className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Device Icon & Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#f8f9fb] dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 flex items-center justify-center shrink-0 text-neutral-800 dark:text-neutral-200 shadow-soft-sm transition-colors">
                  {isEsp ? (
                    <Cpu className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <Radio className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white transition-colors">
                    {device.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        device.status === 'Offline'
                          ? 'bg-rose-500 animate-pulse'
                          : isOnline
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        device.status === 'Offline'
                          ? 'text-rose-600 dark:text-rose-400'
                          : isOnline
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {device.status}
                    </span>
                    {device.details && (
                      <span className="text-[11px] text-neutral-400">
                        • {device.details}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Updates Count & Last Update */}
              <div className="flex items-center gap-6 self-end sm:self-auto text-right">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
                    Updates
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono mt-0.5 block transition-colors">
                    {device.updates}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">
                    Last update
                  </span>
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
