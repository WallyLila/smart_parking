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
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-3xl px-3 py-2 shadow-float transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center gap-1 group transition-all duration-200 py-1 px-3"
            >
              <div
                className={`p-2 rounded-2xl transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                    : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-semibold tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
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
