// Tipos para la jerarquía: Excavación → Anillos → Sectores → Paneles

export interface Panel {
  id: number;
  name: string;
  sectorId: number;
  description?: string;
  width: number;
  height: number;
  thickness: number;
  position: number;
  status: 'active' | 'inactive' | 'completed';
  material: string;
  weight: number;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sector {
  id: number;
  name: string;
  ringId: number;
  description?: string;
  angle: number;
  position: number;
  status: 'active' | 'inactive' | 'completed';
  material: string;
  area: number;
  cost: number;
  panels?: Panel[];
  panelCount?: number;
  completedPanels?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ring {
  id: number;
  name: string;
  excavationDataId: number;
  description?: string;
  depth: number;
  diameter: number;
  position: number;
  status: 'active' | 'inactive' | 'completed';
  material: string;
  thickness: number;
  volume: number;
  cost: number;
  sectors?: Sector[];
  sectorCount?: number;
  completedSectors?: number;
  createdAt: string;
  updatedAt: string;
}

// Tipos para crear nuevos elementos

export interface CreateRingData {
  excavationDataId: number;
  name: string;
  description?: string;
  depth: number;
  diameter: number;
  position: number;
  status: 'active' | 'inactive' | 'completed';
  material: string;
  thickness: number;
  volume: number;
  cost: number;
}

export interface CreateSectorData {
  ringId: number;
  name: string;
  description?: string;
  angle: number;
  position: number;
  status: 'active' | 'inactive' | 'completed';
  material: string;
  area: number;
  cost: number;
}

export interface CreatePanelData {
  sectorId: number;
  name: string;
  description?: string;
  width: number;
  height: number;
  thickness: number;
  position: number;
  status: 'active' | 'inactive' | 'completed';
  material: string;
  weight: number;
  cost: number;
}
