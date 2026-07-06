import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface Historia {
  id: string;
  titulo: string;
  autor: string;
  sinopse: string;
  genero: string;
  capaUrl?: string;
  totalCapitulos: number;
  destaque?: boolean;
  criadoEm: string;
}

export interface Capitulo {
  id: string;
  historiaId: string;
  numero: number;
  titulo: string;
  conteudo?: string;
  gratuito: boolean;
  bloqueado: boolean;
  palavras: number;
}

export interface LeituraRecente {
  id: string;
  historia: Historia;
  capituloAtual: number;
  progresso: number;
  ultimaLeitura: string;
}

interface ApiResponse<T> {
  data: T;
  paginacao?: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export function useHistorias(genero?: string, busca?: string) {
  return useQuery({
    queryKey: ['historias', genero, busca],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Historia[]>>('/api/historias', { genero, busca });
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useHistoria(id: string) {
  return useQuery({
    queryKey: ['historia', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Historia>>(`/api/historias/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCapitulos(historiaId: string) {
  return useQuery({
    queryKey: ['capitulos', historiaId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Capitulo[]>>(`/api/historias/${historiaId}/capitulos`);
      return res.data;
    },
    enabled: !!historiaId,
  });
}

export interface CapituloAcessoResult {
  acesso: boolean;
  motivo?: string;
  custo?: number;
  saldo_atual?: number;
  capitulo?: Capitulo;
}

export function useCapitulo(capituloId: string) {
  return useQuery({
    queryKey: ['capitulo', capituloId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CapituloAcessoResult>>(`/api/capitulos/${capituloId}`);
      return res.data;
    },
    enabled: !!capituloId,
  });
}

export function useContinuarLendo() {
  return useQuery({
    queryKey: ['continuarLendo'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<LeituraRecente[]>>('/api/leituras/continuar');
      return res.data;
    },
  });
}

export function useHistoriasDestaque() {
  return useQuery({
    queryKey: ['historias', 'destaque'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Historia[]>>('/api/historias', { destaque: 1 });
      return res.data;
    },
  });
}

export function useHistoriasMaisLidas() {
  return useQuery({
    queryKey: ['historias', 'maisLidas'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Historia[]>>('/api/historias', { ordenar: 'maisLidas' });
      return res.data;
    },
  });
}

export function useHistoriasNovas() {
  return useQuery({
    queryKey: ['historias', 'novas'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Historia[]>>('/api/historias', { ordenar: 'recentes' });
      return res.data;
    },
  });
}
