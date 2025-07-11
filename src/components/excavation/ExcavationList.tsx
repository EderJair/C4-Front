'use client';

import { useState, useEffect } from 'react';
import { ExcavationData } from '@/types/excavation';
import { excavationApi } from '@/lib/api/excavation';
import ExcavationForm from './ExcavationForm';

interface ExcavationListProps {
  projectPhaseId: number;
}

export default function ExcavationList({ projectPhaseId }: ExcavationListProps) {
  const [excavationData, setExcavationData] = useState<ExcavationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ExcavationData | null>(null);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    loadExcavationData();
    loadTotalCost();
  }, [projectPhaseId]);

  const loadExcavationData = async () => {
    try {
      setLoading(true);
      const data = await excavationApi.getByProjectPhase(projectPhaseId);
      setExcavationData(data);
    } catch (error) {
      console.error('Error cargando datos de excavación:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalCost = async () => {
    try {
      const cost = await excavationApi.getTotalCost(projectPhaseId);
      setTotalCost(cost);
    } catch (error) {
      console.error('Error calculando costo total:', error);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await excavationApi.create(data);
      setShowForm(false);
      loadExcavationData();
      loadTotalCost();
    } catch (error) {
      console.error('Error creando datos de excavación:', error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingItem) return;
    
    try {
      await excavationApi.update(editingItem.id, data);
      setEditingItem(null);
      loadExcavationData();
      loadTotalCost();
    } catch (error) {
      console.error('Error actualizando datos de excavación:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
    
    try {
      await excavationApi.delete(id);
      loadExcavationData();
      loadTotalCost();
    } catch (error) {
      console.error('Error eliminando datos de excavación:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'paused': return 'Pausado';
      default: return status;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando datos de excavación...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Datos de Excavación</h3>
          <p className="text-gray-600">Gestiona los datos específicos de la fase de excavación</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Agregar Datos
        </button>
      </div>

      {/* Total Cost Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-blue-800 font-medium">Costo Total de Excavación:</span>
          <span className="text-2xl font-bold text-blue-900">${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Data Grid */}
      {excavationData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No hay datos de excavación registrados</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Agregar Primer Registro
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {excavationData.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Profundidad:</span>
                  <p className="font-medium">{item.excavationDepth || 0}m</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Área:</span>
                  <p className="font-medium">{item.excavationArea || 0}m²</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Volumen:</span>
                  <p className="font-medium">{item.excavationVolume || 0}m³</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Materiales:</span>
                  <p className="font-medium">${item.materialCost || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Equipos:</span>
                  <p className="font-medium">${item.equipmentCost || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Mano de Obra:</span>
                  <p className="font-medium">${item.laborCost || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Total:</span>
                  <p className="font-bold text-lg">
                    ${((item.materialCost || 0) + (item.equipmentCost || 0) + (item.laborCost || 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              {item.equipment && item.equipment.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Equipos:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.equipment.map((equipment, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {equipment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.notes && (
                <div>
                  <span className="text-sm text-gray-500">Notas:</span>
                  <p className="text-gray-700 mt-1">{item.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Forms */}
      {showForm && (
        <ExcavationForm
          projectPhaseId={projectPhaseId}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingItem && (
        <ExcavationForm
          projectPhaseId={projectPhaseId}
          onSubmit={handleUpdate}
          onCancel={() => setEditingItem(null)}
          initialData={editingItem}
          isEditing={true}
        />
      )}
    </div>
  );
}