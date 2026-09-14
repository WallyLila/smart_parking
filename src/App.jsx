import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Usage } from './pages/Usage';
import { Favorites } from './pages/Favorites';
import { Account } from './pages/Account';
import { initialParkingSlots, initialSystemStatus, initialActivities } from './data/mockData';
import { 
  getParkingSlots, 
  getRecentActivities, 
  toggleSlotLight, 
  updateSlotStatusInDb, 
  subscribeToSlotChanges, 
  subscribeToActivityChanges 
} from './services/parkingService';
import { isSupabaseConfigured } from './services/supabase';

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [slots, setSlots] = useState(initialParkingSlots);
  const [systemStatus, setSystemStatus] = useState(initialSystemStatus);
  const [activities, setActivities] = useState(initialActivities);
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
        if (isSupabaseConfigured) {
          setSystemStatus((prev) =>
            prev.map((item) =>
              item.id === 'esp32' ? { ...item, status: 'Supabase Online' } : item
            )
          );
        }
      }
    };

    loadData();

    // Subscribe to real-time slot changes from Supabase (e.g. from ESP32)
    const slotChannel = subscribeToSlotChanges((updatedSlot) => {
      setSlots((prev) =>
        prev.map((s) => (s.id === updatedSlot.id ? { ...s, ...updatedSlot } : s))
      );
    });

    // Subscribe to real-time activity log inserts
    const actChannel = subscribeToActivityChanges((newAct) => {
      setActivities((prev) => [newAct, ...prev.slice(0, 5)]);
    });

    return () => {
      isMounted = false;
      if (slotChannel) slotChannel.unsubscribe();
      if (actChannel) actChannel.unsubscribe();
    };
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
    const targetSlot = slots.find((s) => s.id === slotId);
    if (!targetSlot) return;

    // Optimistic UI update
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, light: !s.light } : s))
    );

    // Sync to Supabase
    await toggleSlotLight(slotId, targetSlot.light);
  };

  // Toggle slot status between available and occupied (updates Supabase for testing/simulation)
  const handleToggleStatus = async (slotId) => {
    const targetSlot = slots.find((s) => s.id === slotId);
    if (!targetSlot) return;

    const newStatus = targetSlot.status === 'available' ? 'occupied' : 'available';
    const newDistance = newStatus === 'available' ? 185 : 42;

    // Optimistic UI update
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
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

  return (
    <Layout activeTab={activeTab} onSelectTab={setActiveTab}>
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
        />
      )}

      {activeTab === 'usage' && (
        <Usage
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      )}

      {activeTab === 'favorites' && (
        <Favorites
          slots={slots}
          onToggleLight={handleToggleLight}
          onToggleStatus={handleToggleStatus}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
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
    </Layout>
  );
};
