import { create } from 'zustand';
import { api } from '@/services/api';

interface UserProfile {
  saldoMoedas: number;
  plano: 'free' | 'vip';
  vipExpiraEm: string | null;
  nome: string;
}

interface UserState extends UserProfile {
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  saldoMoedas: 0,
  plano: 'free',
  vipExpiraEm: null,
  nome: '',
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await api.get<UserProfile>('/api/perfil');
      set({ ...profile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
