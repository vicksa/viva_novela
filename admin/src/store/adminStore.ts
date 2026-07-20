import { create } from 'zustand';
import { api } from '../api';

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: string;
  saldo_moedas: number;
  plano: string;
}

export interface Historia {
  id: string;
  titulo: string;
  autora: string;
  genero: string;
  sinopse: string;
  capa_url?: string;
}

export interface Capitulo {
  id: string;
  historia_id: string;
  titulo: string;
  numero: number;
  conteudo: string;
  is_gratuito: boolean;
  custo_moedas: number;
}

export interface CreateCapituloData {
  historia_id: string;
  titulo: string;
  numero: number;
  conteudo: string;
  is_gratuito: boolean;
  custo_moedas: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AdminState extends AuthState {
  usuarios: User[];
  historias: Historia[];
  capitulos: Capitulo[];

  // Auth Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Admin Actions
  fetchUsuarios: () => Promise<void>;
  fetchHistorias: () => Promise<void>;
  createUsuario: (data: { email: string; nome: string; senha: string; papel?: string }) => Promise<void>;
  updateUsuario: (id: string, data: Partial<User>) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;
  createHistoria: (data: Partial<Historia>) => Promise<void>;
  updateHistoria: (id: string, data: Partial<Historia>) => Promise<void>;
  deleteHistoria: (id: string) => Promise<void>;
  fetchCapitulos: (historiaId: string) => Promise<void>;
  createCapitulo: (data: CreateCapituloData) => Promise<void>;
  updateCapitulo: (id: string, historiaId: string, data: Partial<CreateCapituloData>) => Promise<void>;
  deleteCapitulo: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  user: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: !!localStorage.getItem('adminToken'),
  isLoading: true,
  usuarios: [],
  historias: [],
  capitulos: [],

  login: (token, user) => {
    localStorage.setItem('adminToken', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    set({ token: null, user: null, isAuthenticated: false, usuarios: [], historias: [], capitulos: [] });
  },

  checkAuth: async () => {
    const { token, logout } = get();
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      // Valida de verdade se o token ainda é aceito pela API antes de liberar a tela.
      await api.get('/perfil');
      set({ isLoading: false });
    } catch (error) {
      logout();
      set({ isLoading: false });
    }
  },

  fetchUsuarios: async () => {
    try {
      const response = await api.get<{ data: User[] }>('/admin/usuarios');
      set({ usuarios: response.data });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },

  fetchHistorias: async () => {
    try {
      const response = await api.get<{ data: Historia[] }>('/admin/historias');
      set({ historias: response.data });
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  },

  createUsuario: async (data) => {
    try {
      await api.post('/admin/usuarios', data);
      await get().fetchUsuarios();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUsuario: async (id, data) => {
    try {
      await api.put(`/admin/usuarios/${id}`, data);
      set((state) => ({
        usuarios: state.usuarios.map(u => u.id === id ? { ...u, ...data } : u)
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUsuario: async (id) => {
    try {
      await api.delete(`/admin/usuarios/${id}`);
      set((state) => ({
        usuarios: state.usuarios.filter(u => u.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  createHistoria: async (data) => {
    try {
      await api.post('/admin/historias', data);
      await get().fetchHistorias();
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  },

  updateHistoria: async (id, data) => {
    try {
      await api.put(`/admin/historias/${id}`, data);
      await get().fetchHistorias();
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  },

  deleteHistoria: async (id) => {
    try {
      await api.delete(`/admin/historias/${id}`);
      set((state) => ({
        historias: state.historias.filter(h => h.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  },

  fetchCapitulos: async (historiaId) => {
    try {
      const response = await api.get<{ data: Capitulo[] }>(`/admin/historias/${historiaId}/capitulos`);
      set({ capitulos: response.data });
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  },

  createCapitulo: async (data) => {
    try {
      await api.post('/admin/capitulos', data);
      await get().fetchCapitulos(data.historia_id);
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  },

  updateCapitulo: async (id, historiaId, data) => {
    try {
      await api.put(`/admin/capitulos/${id}`, data);
      await get().fetchCapitulos(historiaId);
    } catch (error) {
      console.error('Error updating chapter:', error);
      throw error;
    }
  },

  deleteCapitulo: async (id) => {
    try {
      await api.delete(`/admin/capitulos/${id}`);
      set((state) => ({
        capitulos: state.capitulos.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting chapter:', error);
      throw error;
    }
  }
}));
