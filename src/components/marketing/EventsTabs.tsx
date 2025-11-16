/**
 * Events Tabs Component
 * 
 * Onglets pour basculer entre événements à venir, en cours et passés
 * 
 * @version 1.0
 * @date 2025-11-08
 */

'use client';

import { CalendarIcon, ClockIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { ScrollReveal } from '@/components/common';

export type EventTimeFilter = 'upcoming' | 'current' | 'past';

interface EventsTabsProps {
  activeTab: EventTimeFilter;
  onTabChange: (tab: EventTimeFilter) => void;
  counts: {
    upcoming: number;
    current: number;
    past: number;
  };
}

export function EventsTabs({ activeTab, onTabChange, counts }: EventsTabsProps) {
  const tabs = [
    {
      value: 'upcoming' as EventTimeFilter,
      label: 'À venir',
      icon: CalendarIcon,
      count: counts.upcoming,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      value: 'current' as EventTimeFilter,
      label: 'En cours',
      icon: ClockIcon,
      count: counts.current,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      value: 'past' as EventTimeFilter,
      label: 'Passés',
      icon: ArchiveBoxIcon,
      count: counts.past,
      color: 'text-gray-600 dark:text-gray-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="down" delay={0}>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              
              return (
                <ScrollReveal key={tab.value} direction="up" delay={index * 50}>
                  <button
                    onClick={() => onTabChange(tab.value)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">{tab.label}</span>
                    <span className={`text-xs md:text-sm px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

