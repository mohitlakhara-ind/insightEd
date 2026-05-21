import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { useFocusEffect } from 'expo-router';

interface AccessibilityContextType {
  voiceGuidance: boolean;
  setVoiceGuidance: (enabled: boolean) => Promise<void>;
  speak: (text: string) => void;
  stop: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [voiceGuidance, setVoiceGuidanceState] = useState(false);

  useEffect(() => {
    // Load saved accessibility preference on startup
    AsyncStorage.getItem('accessibility_voice_guidance')
      .then((val) => {
        if (val !== null) {
          setVoiceGuidanceState(val === 'true');
        }
      })
      .catch((err) => {
        console.warn('Failed to load accessibility preference:', err);
      });
  }, []);

  const setVoiceGuidance = async (enabled: boolean) => {
    try {
      setVoiceGuidanceState(enabled);
      await AsyncStorage.setItem('accessibility_voice_guidance', String(enabled));
      if (enabled) {
        // Give immediate audio feedback that mode is active
        Speech.stop();
        Speech.speak('Voice guidance mode is now enabled. App screen details will be read aloud.', {
          rate: 0.88,
          language: 'en-US',
        });
      } else {
        Speech.stop();
      }
    } catch (err) {
      console.warn('Failed to save accessibility preference:', err);
    }
  };

  const speak = useCallback((text: string) => {
    if (voiceGuidance) {
      Speech.stop();
      Speech.speak(text, {
        rate: 0.88,
        language: 'en-US',
      });
    }
  }, [voiceGuidance]);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return (
    <AccessibilityContext.Provider value={{ voiceGuidance, setVoiceGuidance, speak, stop }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * A custom hook to announce screen information when it gains focus.
 * Respects the user's voice guidance preference.
 */
export function useAccessibilityAnnouncement(text: string) {
  const { speak } = useAccessibility();

  useFocusEffect(
    useCallback(() => {
      // Short delay to avoid overlap with tab transition sounds or initial renders
      const timer = setTimeout(() => {
        speak(text);
      }, 350);

      return () => {
        clearTimeout(timer);
        Speech.stop();
      };
    }, [text, speak])
  );
}
