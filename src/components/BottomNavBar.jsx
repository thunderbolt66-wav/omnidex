import React from 'react';
import { Home, LayoutGrid, Plus, User } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * BottomNavBar
 * Floating Crystalline Glass Dock inspired by Kimi AI mobile app.
 * 
 * 4 Options:
 * 1. Home: Shows all books in your library
 * 2. Insights: Reading statistics, goals, streak, and activity
 * 3. Add & Search (+): In the middle, dedicated to searching the global catalog & adding books
 * 4. Account: Instant reader profile switching and data management
 */
export default function BottomNavBar({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      hotkey: '1',
      title: 'Library (All Books)',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: LayoutGrid, // 4-square grid matching user's reference image
      hotkey: '2',
      title: 'Reading Stats & Activity',
    },
    {
      id: 'add',
      label: 'Search & Add',
      icon: Plus,
      isCenter: true,
      hotkey: '3',
      title: 'Search & Add Books (+)',
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      hotkey: '4',
      title: 'Switch Profile & Settings',
    },
  ];

  return (
    <nav
      aria-label="Omnidex Primary Navigation"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none"
    >
      <div className="glass-dock rounded-full px-2 sm:px-2.5 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 max-w-[94vw]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (isActive) {
            return (
              <motion.button
                key={tab.id}
                layoutId="active-tab-capsule"
                onClick={() => onTabChange(tab.id)}
                className={`glass-tab-capsule flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full font-medium text-xs sm:text-sm text-white tracking-wide transition-all shadow-md ${
                  tab.isCenter ? 'ring-1 ring-white/30' : ''
                }`}
                title={tab.title}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              >
                <Icon
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${
                    tab.isCenter ? 'stroke-[2.5]' : 'stroke-2'
                  }`}
                />
                <span className="font-semibold whitespace-nowrap text-xs sm:text-[13px]">
                  {tab.label}
                </span>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center p-2.5 sm:p-3 rounded-full text-white/60 hover:text-white transition-all duration-200 hover:bg-white/10 ${
                tab.isCenter
                  ? 'glass-add-button text-white/90 !p-2 sm:!p-2.5 mx-0.5'
                  : ''
              }`}
              title={tab.title}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  tab.isCenter ? 'stroke-[2.5] text-white' : 'stroke-2'
                }`}
              />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
