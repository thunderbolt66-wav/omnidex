import React from 'react';
import { Home, LayoutGrid, Plus, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';
import { getThemeClasses } from '../lib/themeStyles';

/**
 * BottomNavBar
 * Floating Crystalline Glass Dock inspired by Kimi AI mobile app.
 * Dynamically themed to perfectly match all 36 Omnidex atmospheres.
 * 
 * 5 Options (Symmetrical):
 * 1. Home: Library of all books
 * 2. Insights: Reading telemetry & activity
 * 3. Search & Add (+): Center action button for global search & custom volume creation
 * 4. Settings: Integrated at 4th position between (+) and Account
 * 5. Account: Multi-profile switching & vault backup
 */
export default function BottomNavBar({ activeTab, onTabChange }) {
  const theme = useSettingsStore((state) => state.theme);
  const themeStyles = getThemeClasses(theme);

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
      icon: LayoutGrid, // 4-square grid
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
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      hotkey: '4',
      title: 'Visual Ambience & Settings',
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      hotkey: '5',
      title: 'Switch Profile & Backup',
    },
  ];

  return (
    <nav
      aria-label="Omnidex Primary Navigation"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none"
    >
      <div
        className={`glass-dock rounded-full px-2 sm:px-2.5 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 max-w-[96vw] border ${themeStyles.dock}`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (isActive) {
            return (
              <motion.button
                key={tab.id}
                layoutId="active-tab-capsule"
                onClick={() => onTabChange(tab.id)}
                className={`glass-tab-capsule flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full font-medium text-xs sm:text-sm tracking-wide transition-all ${
                  themeStyles.dockActive
                } ${tab.isCenter ? 'ring-1 ring-current/40' : ''}`}
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
              className={`relative flex items-center justify-center p-2 sm:p-2.5 rounded-full transition-all duration-200 ${
                tab.isCenter
                  ? `glass-add-button !p-2 sm:!p-2.5 mx-0.5 ${themeStyles.dockAdd}`
                  : `${themeStyles.dockInactive}`
              }`}
              title={tab.title}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Icon
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                  tab.isCenter ? 'stroke-[2.5]' : 'stroke-2'
                }`}
              />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
