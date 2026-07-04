import { create } from 'zustand';
import { api } from '../api';

export interface User {
  id: number;
  nome: string;
  email: string;
  papel: string;
  saldo_moedas: number;
  plano: string;
}

export interface Historia {
  id: number;
  titulo: string;
  autor_id: number;
  genero: string;
  sinopse: string;
  capa_url?: string;
}

export interface Capitulo {
  id: number;
  historia_id: number;
  titulo: string;
  numero: number;
  conteudo: string;
  is_gratuito: boolean;
  custo_moedas: number;
}

export interface CreateCapituloData {
  historia_id: number;
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
  updateUsuario: (id: number, data: Partial<User>) => Promise<void>;
  createHistoria: (data: Partial<Historia>) => Promise<void>;
  fetchCapitulos: (historiaId: number) => Promise<void>;
  createCapitulo: (data: CreateCapituloData) => Promise<void>;
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
      // Assuming there is a /auth/me or similar, if not we'll handle the logic in login
      // For this step, if we have a token we assume logged in until a request fails with 401
      set({ isLoading: false });
    } catch (error) {
      logout();
      set({ isLoading: false });
    }
  },

  fetchUsuarios: async () => {
    try {
      const usuarios = await api.get<User[]>('/admin/usuarios');
      set({ usuarios });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },

  fetchHistorias: async () => {
    try {
      const historias = await api.get<Historia[]>('/admin/historias');
      set({ historias });
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  },

  updateUsuario: async (id, data) => {
    try {
      const updatedUser = await api.put<User>(`/admin/usuarios/${id}`, data);
      set((state) => ({
        usuarios: state.usuarios.map(u => u.id === id ? { ...u, ...updatedUser } : u)
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  createHistoria: async (data) => {
    try {
      const newHistoria = await api.post<Historia>('/admin/historias', data);
      set((state) => ({
        historias: [...state.historias, newHistoria]
      }));
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  },

  fetchCapitulos: async (historiaId) => {
    try {
      const capitulos = await api.get<Capitulo[]>(`/admin/historias/${historiaId}/capitulos`);
      set({ capitulos });
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  },

  createCapitulo: async (data) => {
    try {
      const newCapitulo = await api.post<Capitulo>('/admin/capitulos', data);
      set((state) => ({
        capitulos: [...state.capitulos, newCapitulo]
      }));
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  }
}));
