'use client';

import { ExcavationData } from '@/types/excavation';
import { useState } from 'react';

interface ExcavationCardProps {
  excavation: ExcavationData;
  onUpdate: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  paused: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completada',
  paused: 'Pausada',
  cancelled: 'Cancelada'
};

const soilTypeLabels = {
  clay: 'Arcilla',
  sand: 'Arena',
  rock: 'Roca',
  mixed: 'Mixto',
  gravel: 'Grava',
  limestone: 'Caliza',
  other: 'Otro'
};

export default function ExcavationCard({ excavation, onUpdate }: ExcavationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const totalCost = (excavation.materialCost || 0) + (excavation.equipmentCost || 0) + (excavation.laborCost || 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Excavación #{excavation.id}</h3>
              <p className="text-sm text-gray-500">
                {excavation.createdAt ? formatDate(excavation.createdAt) : 'Fecha no disponible'}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[excavation.status]}`}>
            {statusLabels[excavation.status]}
          </span>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Volumen</p>
            <p className="text-lg font-semibold text-gray-900">
              {excavation.excavationVolume ? `${excavation.excavationVolume.toFixed(2)} m³` : 'N/A'}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Costo Total</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalCost > 0 ? formatCurrency(totalCost) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Información básica */}
        <div className="space-y-2 mb-4">
          {excavation.excavationDepth && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Profundidad:</span>
              <span className="font-medium">{excavation.excavationDepth.toFixed(2)} m</span>
            </div>
          )}
          {excavation.excavationArea && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Área:</span>
              <span className="font-medium">{excavation.excavationArea.toFixed(2)} m²</span>
            </div>
          )}
          {excavation.soilType && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tipo de suelo:</span>
              <span className="font-medium">{soilTypeLabels[excavation.soilType]}</span>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Detalles expandidos */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {/* Fechas */}
            {(excavation.startDate || excavation.endDate) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Fechas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {excavation.startDate && (
                    <div>
                      <span className="text-gray-500">Inicio:</span>
                      <p className="font-medium">{formatDate(excavation.startDate)}</p>
                    </div>
                  )}
                  {excavation.endDate && (
                    <div>
                      <span className="text-gray-500">Fin:</span>
                      <p className="font-medium">{formatDate(excavation.endDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Equipos */}
            {excavation.equipment && excavation.equipment.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Equipos</h4>
                <div className="flex flex-wrap gap-1">
                  {excavation.equipment.map((equipment, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {equipment}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Costos detallados */}
            {(excavation.materialCost || excavation.equipmentCost || excavation.laborCost || excavation.laborHours) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Costos y Recursos</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {excavation.laborHours && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Horas de trabajo:</span>
                      <span className="font-medium">{excavation.laborHours} hrs</span>
                    </div>
                  )}
                  {excavation.materialCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Materiales:</span>
                      <span className="font-medium">{formatCurrency(excavation.materialCost)}</span>
                    </div>
                  )}
                  {excavation.equipmentCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Equipos:</span>
                      <span className="font-medium">{formatCurrency(excavation.equipmentCost)}</span>
                    </div>
                  )}
                  {excavation.laborCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mano de obra:</span>
                      <span className="font-medium">{formatCurrency(excavation.laborCost)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notas */}
            {excavation.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {excavation.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
