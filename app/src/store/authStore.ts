import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/services/api';

export interface User {
  id: string;
  email: string;
  nome: string;
  // Add other user fields as needed based on the backend profile
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isOnboarded: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setOnboarded: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isOnboarded: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post<{ data: { token: string; usuario: User } }>('/api/auth/login', { email, senha: password });
      const { token, usuario } = response.data;
      try {
        await SecureStore.setItemAsync('userToken', token);
      } catch (storageError) {
        console.error('Error persisting token', storageError);
      }

      set({ user: usuario, token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, nome: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post<{ data: { token: string; usuario: User } }>('/api/auth/registrar', { email, senha: password, nome });
      const { token, usuario } = response.data;
      try {
        await SecureStore.setItemAsync('userToken', token);
      } catch (storageError) {
        console.error('Error persisting token', storageError);
      }

      set({ user: usuario, token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await SecureStore.deleteItemAsync('userToken');
    } catch (error) {
      console.error('Error removing token', error);
    }
    set({ user: null, token: null, isLoading: false, isOnboarded: false });
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // Validate token by fetching profile
        const user = await api.get<User>('/api/perfil');
        set({ user, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      // If token is invalid or expired
      console.error('Session initialization error', error);
      try {
        await SecureStore.deleteItemAsync('userToken');
      } catch (cleanupError) {
        console.error('Error clearing token', cleanupError);
      }
      set({ user: null, token: null, isLoading: false });
    }
  },

  setOnboarded: (value: boolean) => {
    set({ isOnboarded: value });
  },
}));
