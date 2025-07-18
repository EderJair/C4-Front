// src/lib/api-client.ts
import axios from 'axios';

// Configuración base del cliente API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use(
  (config: any) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log para debugging
    console.log('🌐 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers
    });
    
    // Log detallado de los datos enviados
    if (config.data) {
      console.log('📦 Request Data Details:', JSON.stringify(config.data, null, 2));
    }
    
    return config;
  },
  (error: any) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas
apiClient.interceptors.response.use(
  (response: any) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error: any) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
      requestData: error.config?.data
    });
    
    // Log detallado del error del backend
    if (error.response?.data) {
      console.error('🔍 Backend Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Manejo de errores globales
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    
    // Personalizar mensaje de error
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        'Ha ocurrido un error inesperado';
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Métodos HTTP centralizados
export const api = {
  // GET
  async get<T = any>(endpoint: string): Promise<T> {
    const response = await apiClient.get(endpoint);
    return (response.data as any)?.data || response.data;
  },

  // POST
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.post(endpoint, data);
    return (response.data as any)?.data || response.data;
  },

  // PUT
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.put(endpoint, data);
    return (response.data as any)?.data || response.data;
  },

  // PATCH
  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.patch(endpoint, data);
    return (response.data as any)?.data || response.data;
  },

  // DELETE
  async delete<T = any>(endpoint: string): Promise<T> {
    const response = await apiClient.delete(endpoint);
    return (response.data as any)?.data || response.data;
  },

  // Para casos especiales donde necesitamos la respuesta completa
  async request<T = any>(config: any): Promise<any> {
    return apiClient.request(config);
  }
};

export default api;
