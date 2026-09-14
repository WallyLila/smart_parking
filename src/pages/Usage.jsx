import React from 'react';
import { Header } from '../components/Header';
import { UsageChart } from '../components/UsageChart';
import { DeviceList } from '../components/DeviceList';

export const Usage = ({ activeTab, onSelectTab, darkMode, onToggleDarkMode }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Header
        title="Usage & Telemetry"
        subtitle="Comprehensive sensor activity, occupancy trends, and hardware telemetry"
        showStatus={false}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      {/* Responsive Grid for Usage: Side by side on large desktop, or stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <UsageChart />
        </div>
        <div className="lg:col-span-5">
          <DeviceList />
        </div>
      </div>
    </div>
  );
};
