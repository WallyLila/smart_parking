import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '../components/Header';
import { UsageChart } from '../components/UsageChart';
import { DeviceList } from '../components/DeviceList';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { getAllParkingActivities, subscribeToActivityChanges, unsubscribeChannel } from '../services/parkingService';
import { Car, Clock, TrendingUp, Activity as ActivityIcon } from 'lucide-react';

export const Usage = ({
  slots = [],
  activeTab,
  onSelectTab,
  darkMode,
  onToggleDarkMode,
  isHardwareOnline = true,
}) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch full activity history
  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllParkingActivities(500);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities in Usage page:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();

    // Subscribe to realtime activities insertion with unique channel name
    const channelName = `usage_realtime_acts_${Date.now()}`;
    const channel = subscribeToActivityChanges((newActivity) => {
      setActivities((prev) => [
        {
          ...newActivity,
          created_at: newActivity.created_at || new Date().toISOString(),
        },
        ...prev,
      ]);
    }, channelName);

    return () => {
      if (channel) {
        unsubscribeChannel(channel);
      }
    };
  }, [fetchActivities]);

  // Compute live KPI metrics from real activities
  const kpis = useMemo(() => {
    const occupiedEvents = activities.filter((a) => a.status === 'occupied');
    const totalOccupancies = occupiedEvents.length;

    // Slot 1 vs Slot 2 breakdown
    const slot1Count = occupiedEvents.filter((a) => a.slot_id === 1 || a.text?.includes('01')).length;
    const slot2Count = occupiedEvents.filter((a) => a.slot_id === 2 || a.text?.includes('02')).length;
    let mostActiveBay = 'Slot 01';
    let mostActivePct = 50;

    if (totalOccupancies > 0) {
      if (slot2Count > slot1Count) {
        mostActiveBay = 'Slot 02';
        mostActivePct = Math.round((slot2Count / totalOccupancies) * 100);
      } else {
        mostActiveBay = 'Slot 01';
        mostActivePct = Math.round((slot1Count / totalOccupancies) * 100);
      }
    }

    // Average parking stay duration calculation
    const sorted = [...activities].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const occupiedAt = {};
    const durations = [];

    sorted.forEach((item) => {
      const slotId = item.slot_id || (item.text?.includes('01') ? 1 : item.text?.includes('02') ? 2 : null);
      if (!slotId) return;

      if (item.status === 'occupied') {
        occupiedAt[slotId] = new Date(item.created_at);
      } else if (item.status === 'available' && occupiedAt[slotId]) {
        const diffSec = Math.round((new Date(item.created_at) - occupiedAt[slotId]) / 1000);
        if (diffSec > 0 && diffSec < 86400) {
          durations.push(diffSec);
        }
      }
    });

    const avgSeconds = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    let avgDurationStr = 'N/A';
    if (avgSeconds > 0) {
      if (avgSeconds >= 3600) {
        const h = Math.floor(avgSeconds / 3600);
        const m = Math.floor((avgSeconds % 3600) / 60);
        avgDurationStr = `~${h}h ${m}m`;
      } else if (avgSeconds >= 60) {
        avgDurationStr = `~${Math.round(avgSeconds / 60)} นาที`;
      } else {
        avgDurationStr = `~${avgSeconds} วิ`;
      }
    }

    // Today's parkings
    const today = new Date().toDateString();
    const todayParkings = occupiedEvents.filter((a) => {
      const d = a.created_at ? new Date(a.created_at) : null;
      return d && d.toDateString() === today;
    }).length;

    return {
      totalOccupancies,
      todayParkings,
      avgDurationStr,
      durationsCount: durations.length,
      mostActiveBay,
      mostActivePct,
      totalEvents: activities.length,
    };
  }, [activities]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <Header
        title="Usage & Telemetry"
        subtitle="Real-time occupancy trends, detailed parking history, and hardware metrics"
        showStatus={false}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Parkings */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-soft dark:shadow-none space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Parkings
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono tracking-tight">
              {kpis.totalOccupancies.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block mt-0.5">
              {kpis.todayParkings} entries today
            </span>
          </div>
        </div>

        {/* KPI 2: Average Duration */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-soft dark:shadow-none space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Avg. Stay Duration
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono tracking-tight">
              {kpis.avgDurationStr}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block mt-0.5">
              Across {kpis.durationsCount} recorded sessions
            </span>
          </div>
        </div>

        {/* KPI 3: Most Active Bay */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-soft dark:shadow-none space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Most Active Bay
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono tracking-tight">
              {kpis.mostActiveBay}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block mt-0.5">
              {kpis.mostActivePct}% of all entries
            </span>
          </div>
        </div>

        {/* KPI 4: Total Logged Activities */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-soft dark:shadow-none space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Logged Events
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ActivityIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono tracking-tight">
              {kpis.totalEvents.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block mt-0.5">
              Real-time DB audit trail
            </span>
          </div>
        </div>
      </div>

      {/* Responsive Grid: Real-data Usage Chart & Live Hardware Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <UsageChart activities={activities} />
        </div>
        <div className="lg:col-span-5">
          <DeviceList slots={slots} activities={activities} isHardwareOnline={isHardwareOnline} />
        </div>
      </div>

      {/* Full-width Section: Interactive Timeline, Search, Filters & Excel CSV Export */}
      <div>
        <ActivityTimeline 
          activities={activities} 
          onRefresh={fetchActivities} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};
