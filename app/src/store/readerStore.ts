import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReaderState {
  fontSize: number;
  isDarkMode: boolean;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleDarkMode: () => void;
  loadSettings: () => Promise<void>;
}

const STORAGE_KEY = '@reader_settings';

export const useReaderStore = create<ReaderState>((set, get) => ({
  fontSize: 17,
  isDarkMode: true,

  increaseFontSize: () => {
    const newSize = Math.min(get().fontSize + 2, 28);
    set({ fontSize: newSize });
    persistSettings({ fontSize: newSize, isDarkMode: get().isDarkMode });
  },

  decreaseFontSize: () => {
    const newSize = Math.max(get().fontSize - 2, 12);
    set({ fontSize: newSize });
    persistSettings({ fontSize: newSize, isDarkMode: get().isDarkMode });
  },

  toggleDarkMode: () => {
    const newMode = !get().isDarkMode;
    set({ isDarkMode: newMode });
    persistSettings({ fontSize: get().fontSize, isDarkMode: newMode });
  },

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ fontSize: parsed.fontSize ?? 17, isDarkMode: parsed.isDarkMode ?? true });
      }
    } catch {
      // Use defaults
    }
  },
}));

async function persistSettings(settings: { fontSize: number; isDarkMode: boolean }) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Silent fail
  }
}
