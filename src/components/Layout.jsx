import React from 'react';
import { BottomNavigation } from './BottomNavigation';

export const Layout = ({ children, activeTab, onSelectTab }) => {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans">
      {/* Centered responsive container max-w-7xl with proper responsive bottom padding */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 pb-28 md:pb-12">
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
