import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

export type TextSize = 'small' | 'medium' | 'large' | 'xlarge';
export const textSizeMultipliers: Record<TextSize, number> = { small: 0.85, medium: 1, large: 1.2, xlarge: 1.4 };

interface AccessibilityState {
  textSize: TextSize;
  textScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  showCaptions: boolean;
  setTextSize: (value: TextSize) => void;
  setHighContrast: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setShowCaptions: (value: boolean) => void;
}

const STORAGE_KEY = '@isl-translator/accessibility';
const AccessibilityContext = createContext<AccessibilityState | null>(null);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw) as Partial<AccessibilityState>;
        if (saved.textSize && saved.textSize in textSizeMultipliers) setTextSize(saved.textSize as TextSize);
        if (typeof saved.highContrast === 'boolean') setHighContrast(saved.highContrast);
        if (typeof saved.reducedMotion === 'boolean') setReducedMotion(saved.reducedMotion);
        if (typeof saved.showCaptions === 'boolean') setShowCaptions(saved.showCaptions);
      } catch { /* Ignore malformed local preferences. */ }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ textSize, highContrast, reducedMotion, showCaptions })).catch(() => undefined);
  }, [textSize, highContrast, reducedMotion, showCaptions]);

  const value = useMemo(() => ({ textSize, textScale: textSizeMultipliers[textSize], highContrast, reducedMotion, showCaptions, setTextSize, setHighContrast, setReducedMotion, setShowCaptions }), [textSize, highContrast, reducedMotion, showCaptions]);
  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): AccessibilityState {
  const value = useContext(AccessibilityContext);
  if (!value) throw new Error('useAccessibility must be used inside AccessibilityProvider');
  return value;
}
