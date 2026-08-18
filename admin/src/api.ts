const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const TOKEN_KEY = 'adminToken';
const REFRESH_TOKEN_KEY = 'adminRefreshToken';

interface FetchOptions extends RequestInit {
  data?: any;
}

export function setTokens(token: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

// Evita disparar várias renovações em paralelo quando várias requisições
// batem em 401 ao mesmo tempo — todas esperam a mesma promise de refresh.
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        return null;
      }

      const body = (await response.json()) as { data: { token: string; refreshToken: string } };
      setTokens(body.data.token, body.data.refreshToken);
      return body.data.token;
    } catch {
      return null;
    }
  })();

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

export const api = {
  async fetch<T>(endpoint: string, options: FetchOptions = {}, isRetry = false): Promise<T> {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.data) {
      headers.set('Content-Type', 'application/json');
      options.body = JSON.stringify(options.data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return this.fetch<T>(endpoint, options, true);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API Error');
    }

    return response.json();
  },

  get<T>(endpoint: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, data?: any, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: 'POST', data });
  },

  put<T>(endpoint: string, data?: any, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: 'PUT', data });
  },

  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  },

  async uploadFile<T>(endpoint: string, file: File, isRetry = false): Promise<T> {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // Não define Content-Type: o browser define o boundary do multipart sozinho.

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401 && !isRetry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return this.uploadFile<T>(endpoint, file, true);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha no upload.');
    }

    return response.json();
  },
};
