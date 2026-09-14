import React from 'react';
import { BottomNavigation } from './BottomNavigation';

export const Layout = ({ children, activeTab, onSelectTab }) => {
  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0d0e11] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Centered responsive container max-w-7xl with proper responsive bottom padding */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 pb-28 md:pb-12">
        {children}
      </div>

      {/* Fixed bottom navigation on mobile */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />
    </div>
  );
};
