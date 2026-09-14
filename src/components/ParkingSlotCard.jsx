import React from 'react';
import { Car, Radio } from 'lucide-react';
import { Toggle } from './Toggle';

export const ParkingSlotCard = ({ slot, onToggleLight, onToggleStatus }) => {
  const isAvailable = slot.status === 'available';

  return (
    <div
      className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-soft hover:shadow-soft-lg dark:shadow-none transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Top: Slot Title & Status Dot */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-white transition-colors">
            {slot.name}
          </span>
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(slot.id)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200/60 dark:border-neutral-700"
            title="Click to test toggle state"
          >
            Switch state
          </button>
        </div>

        {/* State Pill Badge */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${
              isAvailable
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200/80 dark:border-neutral-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAvailable ? 'bg-emerald-500' : 'bg-neutral-800 dark:bg-neutral-300'
              }`}
            />
            {slot.status}
          </span>
        </div>
      </div>

      {/* Center: Visual Parking Space Representation */}
      <div className="my-5 p-5 rounded-2xl bg-[#f8f9fb] dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center min-h-[130px] relative transition-colors">
        {/* Minimal Parking Space Bay Markings */}
        <div className="w-full max-w-[180px] h-20 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl flex items-center justify-center relative bg-white/60 dark:bg-neutral-800/60 transition-colors">
          {isAvailable ? (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                P
              </span>
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
                Bay Empty
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <Car className="w-8 h-8 text-neutral-800 dark:text-neutral-200" />
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mt-1">
                Vehicle Parked
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ultrasonic Sensor Information */}
      <div className="space-y-3.5 border-t border-neutral-100 dark:border-neutral-800 pt-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-neutral-400 block uppercase tracking-wider">Distance</span>
            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono mt-0.5 block transition-colors">
              {slot.distance} cm
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-neutral-400 block uppercase tracking-wider">Sensor</span>
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide flex items-center justify-end gap-1.5 mt-0.5 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {slot.sensor || 'ONLINE'}
            </span>
          </div>
        </div>

        {/* Parking Light Status & Toggle */}
        <div className="flex items-center justify-between bg-[#f8f9fb] dark:bg-neutral-800/60 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-750 transition-colors">
          <div>
            <span className="text-xs text-neutral-700 dark:text-neutral-300 block font-semibold transition-colors">
              Parking Light
            </span>
            <span
              className={`text-xs font-bold block mt-0.5 ${
                slot.light ? 'text-neutral-900 dark:text-emerald-400' : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              {slot.light ? 'ON' : 'OFF'}
            </span>
          </div>
          <Toggle
            checked={slot.light}
            onChange={() => onToggleLight && onToggleLight(slot.id)}
            activeColor={slot.light ? 'green' : 'neutral'}
          />
        </div>
      </div>
    </div>
  );
};
