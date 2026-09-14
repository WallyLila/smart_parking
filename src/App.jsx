import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Usage } from './pages/Usage';
import { Favorites } from './pages/Favorites';
import { Account } from './pages/Account';
import { initialParkingSlots, initialSystemStatus, initialActivities } from './data/mockData';

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [slots, setSlots] = useState(initialParkingSlots);
  const [systemStatus] = useState(initialSystemStatus);
  const [activities, setActivities] = useState(initialActivities);

  // Toggle parking light
  const handleToggleLight = (slotId) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, light: !s.light } : s))
    );
  };

  // Toggle slot status between available and occupied (useful for simulation/testing)
  const handleToggleStatus = (slotId) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        const newStatus = s.status === 'available' ? 'occupied' : 'available';
        const newDistance = newStatus === 'available' ? 185 : 42;

        // Add to activities
        const newActivity = {
          id: Date.now(),
          text: `${s.name} became ${newStatus}`,
          time: 'Just now',
          status: newStatus,
        };
        setActivities((act) => [newActivity, ...act.slice(0, 4)]);

        return {
          ...s,
          status: newStatus,
          distance: newDistance,
        };
      })
    );
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
        />
      )}

      {activeTab === 'usage' && (
        <Usage
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {activeTab === 'favorites' && (
        <Favorites
          slots={slots}
          onToggleLight={handleToggleLight}
          onToggleStatus={handleToggleStatus}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {activeTab === 'account' && (
        <Account
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}
    </Layout>
  );
};
