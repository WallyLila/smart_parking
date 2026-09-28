import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Usage } from './pages/Usage';
import { Account } from './pages/Account';
import { initialParkingSlots, initialSystemStatus, initialActivities } from './data/mockData';
import { 
  getParkingSlots, 
  getRecentActivities, 
  toggleSlotLight, 
  setSlotLight,
  setAllSlotLights,
  updateSlotSensorStatus,
  setAllSlotSensorStatus,
  updateSlotStatusInDb, 
  subscribeToSlotChanges, 
  subscribeToActivityChanges,
  unsubscribeChannel 
} from './services/parkingService';
import { isSupabaseConfigured } from './services/supabase';
import { AiAssistant } from './components/AiAssistant';

// Watchdog Timeout: 50s (ESP32 heartbeat is 30s + 20s network grace buffer)
const WATCHDOG_TIMEOUT_MS = 50000;

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [slots, setSlots] = useState(initialParkingSlots);
  const [systemStatus, setSystemStatus] = useState(initialSystemStatus);
  const [activities, setActivities] = useState(initialActivities);
  const [isHardwareOnline, setIsHardwareOnline] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState(0);

  const lastHeartbeatRef = useRef(0);
  const slotsRef = useRef(slots);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Sync dark mode class and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load initial Supabase data and set up Realtime listeners
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const dbSlots = await getParkingSlots();
      const dbActivities = await getRecentActivities();
      if (isMounted) {
        setSlots(dbSlots);
        setActivities(dbActivities);

        // Check most recent hardware activity timestamp
        const slotTimes = dbSlots
          .map((s) => s.updated_at ? new Date(s.updated_at).getTime() : 0)
          .filter((t) => !isNaN(t) && t > 0);
        const actTimes = dbActivities
          .map((a) => a.created_at ? new Date(a.created_at).getTime() : 0)
          .filter((t) => !isNaN(t) && t > 0);
        const latestActivity = Math.max(0, ...slotTimes, ...actTimes);

        if (latestActivity > 0) {
          lastHeartbeatRef.current = latestActivity;
          setLastHeartbeat(latestActivity);
          const isLive = Date.now() - latestActivity < WATCHDOG_TIMEOUT_MS;
          setIsHardwareOnline(isLive);
        }
      }
    };

    loadData();

    // Subscribe to real-time slot changes from Supabase (e.g. from ESP32 heartbeat / distance)
    const slotChannel = subscribeToSlotChanges((updatedSlot) => {
      const now = Date.now();
      lastHeartbeatRef.current = now;
      setLastHeartbeat(now);
      setIsHardwareOnline(true);

      setSlots((prev) => {
        const exists = prev.some((s) => String(s.id) === String(updatedSlot.id));
        if (exists) {
          return prev.map((s) =>
            String(s.id) === String(updatedSlot.id) ? { ...s, ...updatedSlot } : s
          );
        }
        return [...prev, updatedSlot].sort((a, b) => Number(a.id) - Number(b.id));
      });
    });

    // Subscribe to real-time activity log inserts
    const actChannel = subscribeToActivityChanges((newAct) => {
      const now = Date.now();
      lastHeartbeatRef.current = now;
      setLastHeartbeat(now);
      setIsHardwareOnline(true);

      setActivities((prev) => [newAct, ...prev.slice(0, 5)]);
    });

    return () => {
      isMounted = false;
      if (slotChannel) unsubscribeChannel(slotChannel);
      if (actChannel) unsubscribeChannel(actChannel);
    };
  }, []);

  // Heartbeat Watchdog Monitor: Periodic check every 1 second
  useEffect(() => {
    const checkWatchdog = () => {
      const lh = lastHeartbeatRef.current;
      const now = Date.now();
      const elapsed = lh > 0 ? now - lh : Infinity;
      const online = lh > 0 && elapsed < WATCHDOG_TIMEOUT_MS;

      setIsHardwareOnline((prev) => (prev !== online ? online : prev));

      let lastUpdateText = 'No Signal';
      if (lh > 0) {
        if (elapsed < 3000) lastUpdateText = 'Just now';
        else if (elapsed < 60000) lastUpdateText = `${Math.round(elapsed / 1000)}s ago`;
        else if (elapsed < 3600000) lastUpdateText = `${Math.floor(elapsed / 60000)}m ago`;
        else lastUpdateText = `${Math.floor(elapsed / 3600000)}h ago`;
      }

      const currentSlots = slotsRef.current;
      const slot1 = currentSlots.find((s) => String(s.id) === '1');
      const slot2 = currentSlots.find((s) => String(s.id) === '2');

      const s1Status = !online
        ? 'Offline'
        : slot1?.sensor === 'disabled'
        ? 'Paused'
        : 'Online';

      const s2Status = !online
        ? 'Offline'
        : slot2?.sensor === 'disabled'
        ? 'Paused'
        : 'Online';

      setSystemStatus([
        {
          id: 'esp32',
          name: 'ESP32 Controller',
          status: online ? 'Online' : 'Offline',
        },
        {
          id: 'sensor01',
          name: 'Ultrasonic Sensor 01',
          status: s1Status,
        },
        {
          id: 'sensor02',
          name: 'Ultrasonic Sensor 02',
          status: s2Status,
        },
        {
          id: 'lastUpdate',
          name: 'Last Update',
          status: lastUpdateText,
        },
      ]);
    };

    checkWatchdog();
    const intervalId = setInterval(checkWatchdog, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleToggleDarkMode = (val) => {
    if (typeof val === 'boolean') {
      setDarkMode(val);
    } else {
      setDarkMode((prev) => !prev);
    }
  };

  // Toggle parking light in state and Supabase
  const handleToggleLight = async (slotId) => {
    const targetSlot = slots.find((s) => String(s.id) === String(slotId));
    if (!targetSlot) return;

    // Optimistic UI update
    setSlots((prev) =>
      prev.map((s) => (String(s.id) === String(slotId) ? { ...s, light: !s.light } : s))
    );

    // Sync to Supabase
    await toggleSlotLight(slotId, targetSlot.light);
  };

  // Toggle slot status between available and occupied (updates Supabase for testing/simulation)
  const handleToggleStatus = async (slotId) => {
    const targetSlot = slots.find((s) => String(s.id) === String(slotId));
    if (!targetSlot) return;

    const newStatus = targetSlot.status === 'available' ? 'occupied' : 'available';
    const newDistance = newStatus === 'available' ? 185 : 42;

    // Optimistic UI update
    setSlots((prev) =>
      prev.map((s) => {
        if (String(s.id) !== String(slotId)) return s;
        return {
          ...s,
          status: newStatus,
          distance: newDistance,
        };
      })
    );

    // Add to activities locally
    const newActivity = {
      id: Date.now(),
      text: `${targetSlot.name} became ${newStatus}`,
      time: 'Just now',
      status: newStatus,
    };
    setActivities((act) => [newActivity, ...act.slice(0, 4)]);

    // Sync to Supabase
    await updateSlotStatusInDb(slotId, newStatus, newDistance);
  };

  // Explicitly set slot light (Slot 1, Slot 2, or All)
  const handleSetLight = async (slotId, newLight) => {
    if (slotId === 'all') {
      setSlots((prev) => prev.map((s) => ({ ...s, light: newLight })));
      await setAllSlotLights(newLight);
    } else {
      setSlots((prev) =>
        prev.map((s) => (String(s.id) === String(slotId) ? { ...s, light: newLight } : s))
      );
      await setSlotLight(slotId, newLight);
    }
  };

  // Explicitly set ultrasonic sensor state ('online' | 'disabled')
  const handleSetSensor = async (slotId, sensorStatus) => {
    if (slotId === 'all') {
      setSlots((prev) => prev.map((s) => ({ ...s, sensor: sensorStatus })));
      setSystemStatus((prev) =>
        prev.map((item) =>
          item.id.startsWith('sensor')
            ? { ...item, status: sensorStatus === 'online' ? 'Online' : 'Disabled' }
            : item
        )
      );
      await setAllSlotSensorStatus(sensorStatus);
    } else {
      setSlots((prev) =>
        prev.map((s) => (String(s.id) === String(slotId) ? { ...s, sensor: sensorStatus } : s))
      );
      const sensorKey = `sensor0${slotId}`;
      setSystemStatus((prev) =>
        prev.map((item) =>
          item.id === sensorKey
            ? { ...item, status: sensorStatus === 'online' ? 'Online' : 'Disabled' }
            : item
        )
      );
      await updateSlotSensorStatus(slotId, sensorStatus);
    }
  };

  return (
    <Layout activeTab={activeTab} onSelectTab={setActiveTab}>
      <ErrorBoundary>
        {activeTab === 'dashboard' && (
          <Dashboard
            slots={slots}
            systemStatus={systemStatus}
            activities={activities}
            onToggleLight={handleToggleLight}
            onToggleStatus={handleToggleStatus}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            isHardwareOnline={isHardwareOnline}
          />
        )}

        {activeTab === 'usage' && (
          <Usage
            slots={slots}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            isHardwareOnline={isHardwareOnline}
          />
        )}

        {activeTab === 'account' && (
          <Account
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        )}
      </ErrorBoundary>

      {/* Floating Modern AI Assistant with Voice & Hardware Controls */}
      <AiAssistant
        slots={slots}
        systemStatus={systemStatus}
        activities={activities}
        onSetLight={handleSetLight}
        onSetSensor={handleSetSensor}
        darkMode={darkMode}
      />
    </Layout>
  );
};
