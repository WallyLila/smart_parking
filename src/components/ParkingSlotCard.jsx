import React from 'react';
import { Car, Radio } from 'lucide-react';
import { Toggle } from './Toggle';

export const ParkingSlotCard = ({ slot, onToggleLight, onToggleStatus }) => {
  const isAvailable = slot.status === 'available';

  return (
    <div
      className={`bg-neutral-800 border rounded-3xl p-6 transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
        isAvailable
          ? 'border-emerald-500/30 hover:border-emerald-500/50 shadow-green-glow-sm'
          : 'border-orange-500/30 hover:border-orange-500/50 shadow-orange-glow-sm'
      }`}
    >
      {/* Top: Slot Title & Status Dot */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-neutral-300">
            {slot.name}
          </span>
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(slot.id)}
            className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Click to test toggle state"
          >
            Switch state
          </button>
        </div>

        {/* Large State Typography */}
        <div className="mt-3 flex items-center gap-2.5">
          <span
            className={`w-3 h-3 rounded-full inline-block shrink-0 ${
              isAvailable ? 'bg-emerald-500' : 'bg-orange-500'
            }`}
          />
          <span
            className={`text-xl sm:text-2xl font-extrabold tracking-wider uppercase ${
              isAvailable ? 'text-emerald-400' : 'text-orange-400'
            }`}
          >
            {slot.status}
          </span>
        </div>
      </div>

      {/* Center: Visual Parking Space Representation */}
      <div className="my-6 p-4 rounded-2xl bg-neutral-850 border border-neutral-700/50 flex flex-col items-center justify-center min-h-[120px] relative">
        {/* Minimal Parking Space Bay Markings */}
        <div className="w-full max-w-[180px] h-20 border-2 border-dashed border-neutral-700 rounded-xl flex items-center justify-center relative">
          {isAvailable ? (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-emerald-500/90 tracking-tighter">
                P
              </span>
              <span className="text-[11px] font-medium text-neutral-400 mt-0.5">
                Bay Empty
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <Car className="w-9 h-9 text-orange-400" />
              <span className="text-[11px] font-medium text-neutral-400 mt-1">
                Vehicle Parked
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ultrasonic Sensor Information */}
      <div className="space-y-4 border-t border-neutral-700/60 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block">Distance</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">
              {slot.distance} cm
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 block">Ultrasonic Sensor</span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide flex items-center justify-end gap-1 mt-0.5">
              <Radio className="w-3 h-3 text-emerald-400" />
              {slot.sensor || 'ONLINE'}
            </span>
          </div>
        </div>

        {/* Parking Light Status & Toggle */}
        <div className="flex items-center justify-between bg-neutral-850 p-3 rounded-2xl border border-neutral-700/40">
          <div>
            <span className="text-xs text-neutral-300 block font-medium">
              Parking Light
            </span>
            <span
              className={`text-xs font-semibold block mt-0.5 ${
                slot.light ? 'text-blue-400' : 'text-neutral-400'
              }`}
            >
              {slot.light ? 'ON' : 'OFF'}
            </span>
          </div>
          <Toggle
            checked={slot.light}
            onChange={() => onToggleLight && onToggleLight(slot.id)}
            activeColor={slot.light ? 'blue' : 'neutral'}
          />
        </div>
      </div>
    </div>
  );
};
