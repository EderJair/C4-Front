// src/lib/api.ts
import { LoginRequest, AuthResponse, User } from '@/types/auth';
import apiClient from '@/lib/api-client';

class ApiService {
  // Autenticación
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Llamada real al backend para login
      const response = await apiClient.post('/auth/login', credentials);
      
      // Adaptar la respuesta del backend al formato esperado
      return {
        user: response.user,
        token: response.accessToken || response.token, // El backend devuelve accessToken
        message: response.message || 'Login exitoso'
      };
    } catch (error: any) {
      console.error('Error durante el login:', error);
      
      // Manejar errores específicos del backend
      if (error.message.includes('401') || error.message.includes('Credenciales inválidas')) {
        throw new Error('Credenciales inválidas');
      }
      
      throw new Error('Error del servidor durante el login');
    }
  }

  // Proyectos
  async getProjects(): Promise<any[]> {
    return apiClient.get<any[]>('/projects');
  }

  async getProject(id: number): Promise<any> {
    return apiClient.get<any>(`/projects/${id}`);
  }

  async createProject(data: any): Promise<any> {
    return apiClient.post<any>('/projects', data);
  }

  async updateProject(id: number, data: any): Promise<any> {
    return apiClient.patch<any>(`/projects/${id}`, data);
  }

  async deleteProject(id: number): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  }

  // Excavaciones
  async getExcavations(): Promise<any[]> {
    return apiClient.get<any[]>('/excavations');
  }

  async getProjectExcavations(projectId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/projects/${projectId}/excavations`);
  }

  async createExcavation(data: any): Promise<any> {
    return apiClient.post<any>('/excavations', data);
  }

  async updateExcavation(id: number, data: any): Promise<any> {
    return apiClient.patch<any>(`/excavations/${id}`, data);
  }

  async deleteExcavation(id: number): Promise<void> {
    return apiClient.delete<void>(`/excavations/${id}`);
  }

  // Ingenieros
  async getEngineers(): Promise<any[]> {
    return apiClient.get<any[]>('/users?role=ingeniero');
  }

  async createEngineer(data: any): Promise<any> {
    return apiClient.post<any>('/users', data);
  }

  async updateEngineer(id: number, data: any): Promise<any> {
    return apiClient.patch<any>(`/users/${id}`, data);
  }

  async deleteEngineer(id: number): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  }

  // Usuarios
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  }

  async createUser(data: any): Promise<User> {
    return apiClient.post<User>('/users', data);
  }

  async updateUser(id: number, data: any): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  }
}

export const api = new ApiService();
export default api;