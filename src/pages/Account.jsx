import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Toggle } from '../components/Toggle';
import { Cpu, Radio, LayoutGrid, CheckCircle2, Bell, RefreshCw, Moon, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export const Account = ({ activeTab, onSelectTab, darkMode: darkModeProp, onToggleDarkMode }) => {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof darkModeProp === 'boolean') return darkModeProp;
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Sync with prop if it changes
  React.useEffect(() => {
    if (typeof darkModeProp === 'boolean') {
      setDarkMode(darkModeProp);
    }
  }, [darkModeProp]);

  const handleDarkModeToggle = (val) => {
    setDarkMode(val);
    if (onToggleDarkMode) {
      onToggleDarkMode(val);
    } else {
      if (val) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Header
        title="System & Settings"
        subtitle="Hardware specifications, system diagnostic status, and preferences"
        showStatus={false}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        darkMode={darkMode}
        onToggleDarkMode={handleDarkModeToggle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* System Information Card (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-soft dark:shadow-none space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
              System Information
            </h3>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* ESP32 Controller */}
            <div className="p-4 rounded-2xl bg-[#f8f9fb] dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 shadow-soft-sm transition-colors">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Controller</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white transition-colors">ESP32 Controller</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Online
              </span>
            </div>

            {/* Ultrasonic Sensors */}
            <div className="p-4 rounded-2xl bg-[#f8f9fb] dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 shadow-soft-sm transition-colors">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Sensors</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white transition-colors">Ultrasonic Sensors</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                2 / 2 Online
              </span>
            </div>

            {/* Parking Slots */}
            <div className="p-4 rounded-2xl bg-[#f8f9fb] dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 shadow-soft-sm transition-colors">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Capacity</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white transition-colors">Parking Slots</span>
                </div>
              </div>
              <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono transition-colors">
                2 Slots
              </span>
            </div>

            {/* System Status */}
            <div className="p-4 rounded-2xl bg-[#f8f9fb] dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 shadow-soft-sm transition-colors">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Overall State</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white transition-colors">System Status</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition-colors">
                Operational
              </span>
            </div>

            {/* Supabase Database Status */}
            <div className="p-4 rounded-2xl bg-[#f8f9fb] dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between transition-colors sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 shadow-soft-sm transition-colors">
                  <Database className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Cloud Database</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white transition-colors">
                    Supabase Realtime
                  </span>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {isSupabaseConfigured ? 'Connected' : 'Waiting for .env'}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Card (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-soft dark:shadow-none space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
              Settings
            </h3>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Preferences
            </span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 transition-colors">
            {/* Notifications */}
            <div className="py-4 first:pt-1 last:pb-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#f8f9fb] dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white block transition-colors">
                    Notifications
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium transition-colors">
                    {notifications ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <Toggle
                checked={notifications}
                onChange={setNotifications}
                activeColor="green"
              />
            </div>

            {/* Auto Refresh */}
            <div className="py-4 first:pt-1 last:pb-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#f8f9fb] dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white block transition-colors">
                    Auto Refresh
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium transition-colors">
                    {autoRefresh ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <Toggle
                checked={autoRefresh}
                onChange={setAutoRefresh}
                activeColor="green"
              />
            </div>

            {/* Dark Mode */}
            <div className="py-4 first:pt-1 last:pb-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#f8f9fb] dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white block transition-colors">
                    Dark Mode
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium transition-colors">
                    {darkMode ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              <Toggle
                checked={darkMode}
                onChange={handleDarkModeToggle}
                activeColor="green"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
