// src/lib/api/excavation.ts
import { ExcavationData, CreateExcavationData } from '@/types/excavation';
import api from '@/lib/api-client';

export const excavationApi = {
  async create(data: CreateExcavationData): Promise<ExcavationData> {
    return api.post<ExcavationData>('/api/excavation', data);
  },

  async getByProjectPhase(projectPhaseId: number): Promise<ExcavationData[]> {
    return api.get<ExcavationData[]>(`/api/excavation/project-phase/${projectPhaseId}`);
  },

  async update(id: number, data: Partial<CreateExcavationData>): Promise<ExcavationData> {
    return api.patch<ExcavationData>(`/api/excavation/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return api.delete<void>(`/api/excavation/${id}`);
  },

  async getTotalCost(projectPhaseId: number): Promise<number> {
    const result = await api.get<{ totalCost: number }>(`/api/excavation/costs/project-phase/${projectPhaseId}`);
    return result.totalCost;
  },
};