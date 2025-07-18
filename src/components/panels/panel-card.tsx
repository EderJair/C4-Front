'use client';

import { Panel } from '@/types/ring';

interface PanelCardProps {
  panel: Panel;
  onClick: () => void;
}

const getStatusColor = (status: Panel['status']) => {
  const colors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return colors[status] || colors.active;
};

const getStatusText = (status: Panel['status']) => {
  const texts = {
    active: 'Activo',
    inactive: 'Inactivo',
    completed: 'Completado'
  };
  return texts[status] || 'Activo';
};

export default function PanelCard({ panel, onClick }: PanelCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {panel.name}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(panel.status)}`}>
          {getStatusText(panel.status)}
        </span>
      </div>

      {/* Información técnica */}
      <div className="space-y-3">
        {/* Dimensiones */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Ancho</p>
            <p className="font-medium">{panel.width}m</p>
          </div>
          <div>
            <p className="text-gray-600">Alto</p>
            <p className="font-medium">{panel.height}m</p>
          </div>
          <div>
            <p className="text-gray-600">Espesor</p>
            <p className="font-medium">{panel.thickness}m</p>
          </div>
        </div>

        {/* Material */}
        <div className="text-sm">
          <p className="text-gray-600">Material</p>
          <p className="font-medium">{panel.material}</p>
        </div>

        {/* Peso */}
        <div className="text-sm">
          <p className="text-gray-600">Peso</p>
          <p className="font-medium">{panel.weight} kg</p>
        </div>

        {/* Costo */}
        <div className="text-sm">
          <p className="text-gray-600">Costo</p>
          <p className="font-medium">${panel.cost.toFixed(2)}</p>
        </div>

        {/* Descripción */}
        {panel.description && (
          <div className="text-sm">
            <p className="text-gray-600">Descripción</p>
            <p className="text-gray-800 text-xs bg-gray-50 p-2 rounded">
              {panel.description}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {panel.id}</span>
          <span>Actualizado: {new Date(panel.updatedAt).toLocaleDateString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
}
