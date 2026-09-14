import React from 'react';
import { Home as House, BarChart3, Heart, User } from 'lucide-react';

export const Header = ({ 
  title = "Smart Parking", 
  subtitle = "Monitor your parking area",
  showStatus = true,
  activeTab,
  onSelectTab,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: House },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 pt-2 border-b border-neutral-800/80 mb-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          {subtitle}
        </p>
      </div>

      {/* Desktop Top Navigation (Visible on md and up) */}
      {onSelectTab && (
        <nav className="hidden md:flex items-center gap-1.5 bg-neutral-850 p-1.5 rounded-2xl border border-neutral-700/60 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-blue-glow'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Status indicator */}
      {showStatus && (
        <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-neutral-300">System Online</span>
        </div>
      )}
    </header>
  );
};
