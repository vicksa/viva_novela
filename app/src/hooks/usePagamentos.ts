import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export type Frequencia = 'mensal' | 'anual';

export interface Assinatura {
  id: string;
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';
  frequencia: Frequencia;
  valor_reais: number;
  proximo_pagamento_em: string | null;
  cancelado_em: string | null;
}

interface ApiResponse<T> {
  data: T;
}

export function useAssinaturaStatus() {
  return useQuery({
    queryKey: ['assinatura', 'status'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Assinatura | null>>('/api/pagamentos/status');
      return res.data;
    },
  });
}

export function useCriarAssinatura() {
  return useMutation({
    mutationFn: async (frequencia: Frequencia) => {
      const res = await api.post<ApiResponse<{ checkoutUrl: string }>>('/api/pagamentos/criar', { frequencia });
      return res.data;
    },
  });
}

export function useCancelarAssinatura() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<{ message: string }>>('/api/pagamentos/cancelar');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinatura', 'status'] });
    },
  });
}
