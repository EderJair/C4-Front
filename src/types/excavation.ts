export interface ExcavationData {
  id: number;
  projectPhaseId: number;
  excavationDepth?: number;
  excavationArea?: number;
  excavationVolume?: number;
  soilType?: 'clay' | 'sand' | 'rock' | 'mixed' | 'gravel' | 'limestone' | 'other';
  equipment?: string[];
  laborHours?: number;
  materialCost?: number;
  equipmentCost?: number;
  laborCost?: number;
  notes?: string;
  photos?: string[];
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateExcavationData {
  projectPhaseId: number;
  excavationDepth?: number;
  excavationArea?: number;
  excavationVolume?: number;
  soilType?: 'clay' | 'sand' | 'rock' | 'mixed' | 'gravel' | 'limestone' | 'other';
  equipment?: string[];
  laborHours?: number;
  materialCost?: number;
  equipmentCost?: number;
  laborCost?: number;
  notes?: string;
  photos?: string[];
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
}

export interface ExcavationFile {
  id: number;
  excavationId: number;
  fileName: string;
  fileType: 'pdf' | 'image' | 'other';
  fileUrl: string;
  uploadedAt: string;
}