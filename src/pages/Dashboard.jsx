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
  darkMode,
  onToggleDarkMode,
  isHardwareOnline = true,
}) => {
  return (
    <div className="space-y-6">
      {/* Header with Desktop Navigation & System Status */}
      <Header
        title="Smart Parking"
        subtitle="Intelligent parking management & IoT monitoring"
        showStatus={true}
        isHardwareOnline={isHardwareOnline}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      {/* Main Multi-Column Responsive Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols on lg): Overview & Parking Slots */}
        <div className="lg:col-span-8 space-y-6">
          {/* Parking Overview Card */}
          <ParkingOverview slots={slots} />

          {/* Parking Slots Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
                  Parking Slots
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Individual bay sensor readings and lighting control
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold border border-neutral-200/60 dark:border-neutral-700 transition-colors">
                2 Slots Monitored
              </span>
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

        {/* Right Column (4 cols on lg): System Status & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Status Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-soft dark:shadow-none transition-colors duration-200">
            <SystemStatus items={systemStatus} />
          </div>

          {/* Recent Activity Card */}
          <ActivityList activities={activities} />
        </div>
      </div>
    </div>
  );
};
