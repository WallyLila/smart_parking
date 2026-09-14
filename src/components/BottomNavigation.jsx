import React from 'react';
import { Home as House, BarChart3, Heart, User } from 'lucide-react';

export const BottomNavigation = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: House },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-neutral-800 px-4 py-2 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center gap-1 group transition-all duration-200 py-1"
            >
              <div
                className={`p-2 rounded-2xl transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-blue-glow'
                    : 'text-neutral-400 group-hover:text-white group-hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-neutral-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
