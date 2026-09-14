import React from 'react';
import { Header } from '../components/Header';
import { ParkingOverview } from '../components/ParkingOverview';
import { ParkingSlotCard } from '../components/ParkingSlotCard';
import { SystemStatus } from '../components/SystemStatus';
import { ActivityList } from '../components/ActivityList';

export const Dashboard = ({
  slots,
  systemStatus,
  activities,
  onToggleLight,
  onToggleStatus,
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Header with Desktop Navigation & System Status */}
      <Header
        title="Smart Parking"
        subtitle="Monitor your parking area"
        showStatus={true}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />

      {/* Main Multi-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols on lg): Overview & Parking Slots */}
        <div className="lg:col-span-8 space-y-6">
          {/* Parking Overview Card */}
          <ParkingOverview slots={slots} />

          {/* Parking Slots Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-semibold text-white tracking-tight">
                Parking Slots
              </h3>
              <span className="text-xs text-neutral-400">
                2 Slots Monitored
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

        {/* Right Column (4 cols on lg): System Status & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Status Card */}
          <div className="bg-neutral-850 border border-neutral-700/60 rounded-3xl p-6 shadow-lg shadow-black/20">
            <SystemStatus items={systemStatus} />
          </div>

          {/* Recent Activity Card */}
          <ActivityList activities={activities} />
        </div>
      </div>
    </div>
  );
};
