'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Sun, Leaf, Gem, type LucideIcon } from 'lucide-react';

export type VibeType = 'glow' | 'calm' | 'radiant';

export interface VibeConfig {
  label: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  bg: string;
  emoji: string;
}

export const vibeConfigs: Record<VibeType, VibeConfig> = {
  glow: { label: 'Glow', icon: Sun, accent: '#E06B8B', glow: 'rgba(224,107,139,0.3)', bg: '#FCEEF2', emoji: '✨' },
  calm: { label: 'Calm', icon: Leaf, accent: '#7CB9A8', glow: 'rgba(124,185,168,0.3)', bg: '#EDF7F5', emoji: '🌿' },
  radiant: { label: 'Radiant', icon: Gem, accent: '#D4AF37', glow: 'rgba(212,175,55,0.3)', bg: '#FBF7EC', emoji: '💎' },
};

interface VibeContextValue {
  vibe: VibeType;
  setVibe: (v: VibeType) => void;
  currentVibe: VibeConfig;
}

const VibeContext = createContext<VibeContextValue>({
  vibe: 'glow',
  setVibe: () => {},
  currentVibe: vibeConfigs.glow,
});

export function VibeProvider({ children }: { children: ReactNode }) {
  const [vibe, setVibeState] = useState<VibeType>('glow');

  useEffect(() => {
    const stored = localStorage.getItem('classik-vibe') as VibeType | null;
    if (stored && vibeConfigs[stored]) setVibeState(stored);
  }, []);

  // Apply CSS custom properties to :root whenever vibe changes
  useEffect(() => {
    const config = vibeConfigs[vibe];
    const root = document.documentElement;
    root.style.setProperty('--vibe-accent', config.accent);
    root.style.setProperty('--vibe-glow', config.glow);
    root.style.setProperty('--vibe-bg', config.bg);

    // Also set RGB values for use with rgba()
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };
    root.style.setProperty('--vibe-accent-rgb', hexToRgb(config.accent));
  }, [vibe]);

  const setVibe = useCallback((v: VibeType) => {
    setVibeState(v);
    localStorage.setItem('classik-vibe', v);
  }, []);

  return (
    <VibeContext.Provider value={{ vibe, setVibe, currentVibe: vibeConfigs[vibe] }}>
      {children}
    </VibeContext.Provider>
  );
}

export function useVibe() {
  return useContext(VibeContext);
}
