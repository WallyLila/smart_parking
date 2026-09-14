import React from 'react';
import { Header } from '../components/Header';
import { ParkingSlotCard } from '../components/ParkingSlotCard';
import { Heart } from 'lucide-react';

export const Favorites = ({ slots, onToggleLight, onToggleStatus, activeTab, onSelectTab, darkMode, onToggleDarkMode }) => {
  return (
    <div className="space-y-8">
      <Header
        title="Favorites"
        subtitle="Quick access to your preferred parking spots"
        showStatus={false}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white px-1 transition-colors">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Pinned Parking Slots</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {slots.map((slot) => (
            <ParkingSlotCard
              key={slot.id}
              slot={slot}
              onToggleLight={onToggleLight}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
