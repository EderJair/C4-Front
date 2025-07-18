'use client';

import { Sector } from '@/types/ring';

interface SectorCardProps {
  sector: Sector;
  onClick: () => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  active: 'Activo',
  inactive: 'Inactivo',
  completed: 'Completado'
};

export default function SectorCard({ sector, onClick }: SectorCardProps) {
  const progressPercentage = sector.panelCount && sector.completedPanels 
    ? (sector.completedPanels / sector.panelCount) * 100 
    : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{sector.name}</h3>
              <p className="text-sm text-gray-500">
                {sector.description || 'Sin descripción'}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[sector.status || 'active']}`}>
            {statusLabels[sector.status || 'active']}
          </span>
        </div>

        {/* Información técnica */}
        <div className="space-y-3">
          {/* Posición y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm">
              <p className="text-gray-600">Posición</p>
              <p className="font-medium">#{sector.position || 'No definido'}</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-600">Estado</p>
              <p className="font-medium capitalize">{sector.status || 'Activo'}</p>
            </div>
          </div>

          {/* Paneles */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Paneles</span>
            <span className="font-medium">
              {sector.completedPanels || 0} / {sector.panelCount || 0}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Descripción */}
          {sector.description && (
            <div className="text-sm">
              <p className="text-gray-600">Descripción</p>
              <p className="text-gray-800 text-xs bg-gray-50 p-2 rounded">
                {sector.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>ID: {sector.id}</span>
            <span>Actualizado: {new Date(sector.updatedAt).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
