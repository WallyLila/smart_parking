import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Toggle } from '../components/Toggle';
import { Cpu, Radio, LayoutGrid, CheckCircle2, Bell, RefreshCw, Moon } from 'lucide-react';

export const Account = ({ activeTab, onSelectTab }) => {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title="System"
        subtitle="Smart Parking system information"
        showStatus={false}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* System Information Card (7 cols on lg) */}
        <div className="lg:col-span-7 bg-neutral-800 border border-neutral-700/60 rounded-3xl p-6 shadow-lg shadow-black/20 space-y-4">
          <h3 className="text-base font-semibold text-white tracking-tight">
            System Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* ESP32 Controller */}
            <div className="p-4 rounded-2xl bg-neutral-850 border border-neutral-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500 border border-blue-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Controller</span>
                  <span className="text-sm font-semibold text-white">ESP32 Controller</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Online
              </span>
            </div>

            {/* Ultrasonic Sensors */}
            <div className="p-4 rounded-2xl bg-neutral-850 border border-neutral-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500 border border-blue-500/30">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Sensors</span>
                  <span className="text-sm font-semibold text-white">Ultrasonic Sensors</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                2 / 2 Online
              </span>
            </div>

            {/* Parking Slots */}
            <div className="p-4 rounded-2xl bg-neutral-850 border border-neutral-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500 border border-blue-500/30">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Capacity</span>
                  <span className="text-sm font-semibold text-white">Parking Slots</span>
                </div>
              </div>
              <span className="text-sm font-bold text-white font-mono">
                2 Slots
              </span>
            </div>

            {/* System Status */}
            <div className="p-4 rounded-2xl bg-neutral-850 border border-neutral-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500 border border-blue-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Overall State</span>
                  <span className="text-sm font-semibold text-white">System Status</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Settings Card (5 cols on lg) */}
        <div className="lg:col-span-5 bg-neutral-800 border border-neutral-700/60 rounded-3xl p-6 shadow-lg shadow-black/20 space-y-4">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Settings
          </h3>

          <div className="divide-y divide-neutral-700/50">
            {/* Notifications */}
            <div className="py-4 first:pt-1 last:pb-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neutral-850 border border-neutral-700/50 text-neutral-300">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-white block">
                    Notifications
                  </span>
                  <span className="text-xs text-neutral-400">
                    {notifications ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <Toggle
                checked={notifications}
                onChange={setNotifications}
                activeColor="blue"
              />
            </div>

            {/* Auto Refresh */}
            <div className="py-4 first:pt-1 last:pb-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neutral-850 border border-neutral-700/50 text-neutral-300">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-white block">
                    Auto Refresh
                  </span>
                  <span className="text-xs text-neutral-400">
                    {autoRefresh ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <Toggle
                checked={autoRefresh}
                onChange={setAutoRefresh}
                activeColor="blue"
              />
            </div>

            {/* Dark Mode */}
            <div className="py-4 first:pt-1 last:pb-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neutral-850 border border-neutral-700/50 text-neutral-300">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-white block">
                    Dark Mode
                  </span>
                  <span className="text-xs text-neutral-400">
                    {darkMode ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <Toggle
                checked={darkMode}
                onChange={setDarkMode}
                activeColor="blue"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
