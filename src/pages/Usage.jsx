import React from 'react';
import { Header } from '../components/Header';
import { UsageChart } from '../components/UsageChart';
import { DeviceList } from '../components/DeviceList';

export const Usage = ({ activeTab, onSelectTab }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title="Usage"
        subtitle="See parking activity and sensor reports here"
        showStatus={false}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
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
