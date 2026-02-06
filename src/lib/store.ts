import { create } from 'zustand';
import { Theme, SajuInput, SajuProfile, ChatMessage } from '@/types';

interface AppStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  userId: string | null;
  setUserId: (id: string) => void;

  sajuInput: SajuInput | null;
  setSajuInput: (input: SajuInput) => void;

  sajuProfile: SajuProfile | null;
  setSajuProfile: (profile: SajuProfile) => void;

  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

export const useStore = create<AppStore>((set) => ({
  theme: 'dark',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') localStorage.setItem('saju_theme', theme);
    set({ theme });
  },
  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') localStorage.setItem('saju_theme', next);
    return { theme: next as Theme };
  }),

  userId: null,
  setUserId: (userId) => {
    if (typeof window !== 'undefined') localStorage.setItem('saju_uid', userId);
    set({ userId });
  },

  sajuInput: null,
  setSajuInput: (sajuInput) => set({ sajuInput }),

  sajuProfile: null,
  setSajuProfile: (sajuProfile) => set({ sajuProfile }),

  chatMessages: [],
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),
}));
