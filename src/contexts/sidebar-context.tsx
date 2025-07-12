'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  expandedItems: string[];
  toggleExpanded: (title: string) => void;
  setExpandedItems: (items: string[]) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <SidebarContext.Provider value={{
      expandedItems,
      toggleExpanded,
      setExpandedItems
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 