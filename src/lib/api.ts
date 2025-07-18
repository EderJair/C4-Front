// src/lib/api.ts
import { LoginRequest, AuthResponse, User } from '@/types/auth';
import { Ring, Sector, Panel, CreateRingData, CreateSectorData, CreatePanelData } from '@/types/ring';
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

  async getEngineerProjects(engineerId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/projects/engineer/${engineerId}`);
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

  async assignEngineerToProject(projectId: number, engineerId: number): Promise<any> {
    return apiClient.put<any>(`/projects/${projectId}/assign-engineer/${engineerId}`, {});
  }

  async deleteProject(id: number): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  }

  // Excavaciones
  async getExcavations(): Promise<any[]> {
    return apiClient.get<any[]>('/excavation');
  }

  async getProjectExcavations(projectPhaseId: number): Promise<any[]> {
    // Usar el endpoint correcto: /api/excavation/project-phase/:projectPhaseId
    // Ya que creamos excavaciones con projectPhaseId, necesitamos buscar por ese mismo campo
    return apiClient.get<any[]>(`/excavation/project-phase/${projectPhaseId}`);
  }

  async createExcavation(data: any): Promise<any> {
    console.log('🔧 API Service - createExcavation llamado con:', data);
    try {
      const result = await apiClient.post<any>('/excavation', data);
      console.log('🔧 API Service - createExcavation resultado:', result);
      return result;
    } catch (error) {
      console.error('🔧 API Service - createExcavation error:', error);
      throw error;
    }
  }

  async updateExcavation(id: number, data: any): Promise<any> {
    return apiClient.patch<any>(`/excavation/${id}`, data);
  }

  async deleteExcavation(id: number): Promise<void> {
    return apiClient.delete<void>(`/excavation/${id}`);
  }

  async getProjectExcavationCosts(projectId: number): Promise<any> {
    return apiClient.get<any>(`/excavation/costs/project/${projectId}`);
  }

  async getProjectPhaseExcavationCosts(projectPhaseId: number): Promise<any> {
    return apiClient.get<any>(`/excavation/costs/project-phase/${projectPhaseId}`);
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

  // Trabajadores
  async getWorkers(): Promise<any[]> {
    return apiClient.get<any[]>('/users?role=trabajador');
  }

  async createWorker(data: any): Promise<any> {
    return apiClient.post<any>('/users', data);
  }

  async updateWorker(id: number, data: any): Promise<any> {
    return apiClient.patch<any>(`/users/${id}`, data);
  }

  async deleteWorker(id: number): Promise<void> {
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

  // Anillos
  async getExcavationRings(excavationId: number): Promise<Ring[]> {
    return apiClient.get(`/rings/excavation/${excavationId}`);
  }

  async createRing(data: CreateRingData): Promise<Ring> {
    return apiClient.post('/rings', data);
  }

  async updateRing(id: number, data: Partial<CreateRingData>): Promise<Ring> {
    return apiClient.patch(`/rings/${id}`, data);
  }

  async deleteRing(id: number): Promise<void> {
    await apiClient.delete(`/rings/${id}`);
  }

  async getRingById(ringId: number): Promise<Ring> {
    return apiClient.get(`/rings/${ringId}`);
  }

  // Sectores - Endpoints según backend
  async getRingSectors(ringId: number): Promise<Sector[]> {
    return apiClient.get(`/sectors/ring/${ringId}`);
  }

  async createSector(data: CreateSectorData): Promise<Sector> {
    return apiClient.post('/sectors', data);
  }

  async updateSector(id: number, data: Partial<CreateSectorData>): Promise<Sector> {
    return apiClient.patch(`/sectors/${id}`, data);
  }

  async deleteSector(id: number): Promise<void> {
    await apiClient.delete(`/sectors/${id}`);
  }

  async getSectorById(sectorId: number): Promise<Sector> {
    return apiClient.get(`/sectors/${sectorId}`);
  }

  // Paneles - Endpoints según backend
  async getSectorPanels(sectorId: number): Promise<Panel[]> {
    return apiClient.get(`/panels/sector/${sectorId}`);
  }

  async createPanel(data: CreatePanelData): Promise<Panel> {
    return apiClient.post('/panels', data);
  }

  async updatePanel(id: number, data: Partial<CreatePanelData>): Promise<Panel> {
    return apiClient.patch(`/panels/${id}`, data);
  }

  async deletePanel(id: number): Promise<void> {
    await apiClient.delete(`/panels/${id}`);
  }

  async getPanelById(panelId: number): Promise<Panel> {
    return apiClient.get(`/panels/${panelId}`);
  }
}

export const api = new ApiService();
export default api;