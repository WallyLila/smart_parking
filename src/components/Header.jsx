import React from 'react';
import { Home as House, BarChart3, Heart, User, Sun, Moon } from 'lucide-react';

export const Header = ({ 
  title = "Smart Parking", 
  subtitle = "Monitor your parking area",
  showStatus = true,
  activeTab,
  onSelectTab,
  darkMode,
  onToggleDarkMode,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: House },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 pt-1 mb-6 border-b border-neutral-200/70 dark:border-neutral-800/80 transition-colors duration-200">
      {/* Brand & Page Info */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-soft-sm shrink-0 transition-colors">
          <span className="font-bold text-base tracking-tighter">P</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white transition-colors">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium transition-colors">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Desktop Top Navigation (Visible on md and up) */}
      {onSelectTab && (
        <nav className="hidden md:flex items-center gap-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-full border border-neutral-200/80 dark:border-neutral-800 shadow-soft-sm transition-colors">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Controls: Dark Mode Toggle & Status Indicator */}
      <div className="flex items-center gap-2.5 self-start md:self-auto">
        {/* Quick Dark Mode Toggle Button */}
        {onToggleDarkMode && (
          <button
            type="button"
            onClick={() => onToggleDarkMode(!darkMode)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-soft-sm flex items-center gap-1.5 text-xs font-semibold transition-all"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-neutral-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        )}

        {/* Status indicator */}
        {showStatus && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 shadow-soft-sm transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-tight">System Online</span>
          </div>
        )}
      </div>
    </header>
  );
};
