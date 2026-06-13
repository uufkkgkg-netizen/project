"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: '0.6 0.18 345', // Default OKLCH Rose
  setPrimaryColor: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<string>('0.6 0.18 345');

  useEffect(() => {
    // Load saved color from localStorage
    const savedColor = localStorage.getItem('theme_primary_color');
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
  }, []);

  useEffect(() => {
    if (!primaryColor) return;
    
    // Apply OKLCH to root document
    document.documentElement.style.setProperty('--primary', `oklch(${primaryColor})`);
    
    // Extract chroma and hue to redefine Tailwind's rose palette dynamically
    const parts = primaryColor.split(' ');
    if (parts.length === 3) {
       document.documentElement.style.setProperty('--theme-chroma', parts[1]);
       document.documentElement.style.setProperty('--theme-hue', parts[2]);
    }
    
    // Also save to localStorage
    localStorage.setItem('theme_primary_color', primaryColor);
  }, [primaryColor]);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
