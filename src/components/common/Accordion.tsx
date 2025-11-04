/**
 * Accordion Component
 * 
 * Composant accordéon réutilisable pour FAQ et autres contenus repliables
 * 
 * @version 1.0
 * @date 2025-11-04 23:00
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({ 
  items, 
  allowMultiple = false, 
  defaultOpen = [],
  className 
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setOpenItems(prev => 
        prev.includes(id) ? [] : [id]
      );
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        
        return (
          <div 
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-primary/30"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-gray-900 pr-4">
                {item.question}
              </span>
              <ChevronDownIcon 
                className={cn(
                  'w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                isOpen ? 'max-h-96' : 'max-h-0'
              )}
            >
              <div className="px-6 py-4 bg-gray-50 text-gray-700 leading-relaxed border-t border-gray-200">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { AccordionItem, AccordionProps };

