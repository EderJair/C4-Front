// Tipos para la jerarquía: Excavación → Anillos → Sectores → Paneles

export interface Panel {
  id: number;
  name: string;
  sectorId: number;
  description?: string;
  width?: number;
  height?: number;
  thickness?: number;
  material?: string;
  position?: number;
  installationDate?: string; // Nuevo según backend
  status?: 'active' | 'inactive' | 'completed';
  // Removemos campos que no están en el backend
  // weight: number;
  // cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sector {
  id: number;
  name: string;
  ringId: number;
  description?: string;
  position?: number;
  status?: 'active' | 'inactive' | 'completed';
  // Campos técnicos que el backend aún no soporta:
  // angleStart?: number;
  // angleEnd?: number;
  // radiusInner?: number;
  // radiusOuter?: number;
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
  diameter?: number;
  depth?: number;
  height?: number; // Nuevo campo según backend
  position?: number;
  status?: 'active' | 'inactive' | 'completed';
  // Removemos campos que no están en el backend
  // material: string;
  // thickness: number;
  // volume: number;
  // cost: number;
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
  diameter?: number;
  depth?: number;
  height?: number;
  position?: number;
  status?: 'active' | 'inactive' | 'completed';
}

export interface CreateSectorData {
  ringId: number;
  name: string;
  description?: string;
  position?: number;
  status?: 'active' | 'inactive' | 'completed';
  // Campos técnicos que el backend aún no soporta:
  // angleStart?: number;
  // angleEnd?: number;
  // radiusInner?: number;
  // radiusOuter?: number;
}

export interface CreatePanelData {
  sectorId: number;
  name: string;
  description?: string;
  width?: number;
  height?: number;
  thickness?: number;
  material?: string;
  position?: number;
  installationDate?: string;
  status?: 'active' | 'inactive' | 'completed';
}
