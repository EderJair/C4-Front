'use client';

import { Ring } from '@/types/ring';

interface RingCardProps {
  ring: Ring;
  onClick: () => void;
}

const statusColors = {
  planned: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  verified: 'bg-purple-100 text-purple-800'
};

const statusLabels = {
  planned: 'Planificado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  verified: 'Verificado'
};

export default function RingCard({ ring, onClick }: RingCardProps) {
  const progressPercentage = ring.sectorCount && ring.completedSectors 
    ? (ring.completedSectors / ring.sectorCount) * 100 
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
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{ring.name}</h3>
              <p className="text-sm text-gray-500">Posición #{ring.position}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[ring.status]}`}>
            {statusLabels[ring.status]}
          </span>
        </div>

        {/* Información técnica */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Diámetro</span>
            <span className="text-sm font-medium text-gray-900">{ring.diameter}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Profundidad</span>
            <span className="text-sm font-medium text-gray-900">{ring.depth}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Sectores</span>
            <span className="text-sm font-medium text-gray-900">
              {ring.completedSectors || 0}/{ring.sectorCount || 0}
            </span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progreso</span>
            <span className="text-xs font-medium text-gray-900">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Material y fecha */}
        <div className="space-y-2">
          {ring.materialType && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Material</span>
              <span className="text-xs font-medium text-gray-900">{ring.materialType}</span>
            </div>
          )}
          {ring.installationDate && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Instalación</span>
              <span className="text-xs font-medium text-gray-900">
                {new Date(ring.installationDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Notas */}
        {ring.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">{ring.notes}</p>
          </div>
        )}
      </div>

      {/* Footer con acción */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Creado: {new Date(ring.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1 text-blue-600">
            <span className="text-xs font-medium">Ver sectores</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
