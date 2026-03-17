/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const isProd = import.meta.env.PROD;
const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();

if (isProd && !envApiUrl) {
  console.warn(
    '⚠️ VITE_API_URL is not defined in production environment. ' +
    'Falling back to same-origin `/api` requests. ' +
    'Ensure your host rewrites /api to the backend (e.g., Vercel rewrites).'
  );
}

const rawBaseUrl = envApiUrl;
// Remove trailing slash and any accidental /api suffix for the static base
export const STATIC_BASE_URL = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/i, '')
  : '';
// Consistently add /api for the API base (or same-origin /api if no base provided)
export const API_BASE_URL = STATIC_BASE_URL ? `${STATIC_BASE_URL}/api` : '/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Ensure endpoint starts with a slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${formattedEndpoint}`;

    // Get token from localStorage
    const token = localStorage.getItem('autofleet_token');

    // If body is FormData, do not set Content-Type (let browser set it)
    const isFormData = (typeof FormData !== 'undefined') && options.body instanceof FormData;
    let headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (
      options.headers &&
      typeof options.headers === 'object' &&
      !(options.headers instanceof Headers) &&
      !Array.isArray(options.headers)
    ) {
      Object.assign(headers, options.headers);
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    } else {
      // Remove Content-Type if present (shouldn't be, but just in case)
      if ('Content-Type' in headers) {
        delete headers['Content-Type'];
      }
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      console.log(`🌐 Making ${config.method || 'GET'} request to:`, url);

      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : null;
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          console.log('🔑 Authentication failed - clearing token');
          localStorage.removeItem('autofleet_token');
          localStorage.removeItem('autofleet_user');

          // Don't redirect here, let the component handle it
          throw {
            status: 401,
            message: data.message || 'Authentication failed',
          };
        }

        // Handle other HTTP errors
        throw {
          status: response.status,
          message: data.message || `HTTP ${response.status}`,
        };
      }

      console.log(`✅ ${config.method || 'GET'} ${endpoint} successful:`, data);
      return data;
    } catch (error: any) {
      console.error(`❌ ${config.method || 'GET'} ${endpoint} failed:`, error);

      // Network errors
      if (!error.status) {
        throw {
          status: 0,
          message: 'Network error - please check your connection',
        };
      }

      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    let body: any = undefined;
    if (data instanceof FormData) {
      body = data;
    } else if (data !== undefined) {
      body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);



