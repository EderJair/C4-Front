'use client';

import { useState } from 'react';
import { CreateExcavationData } from '@/types/excavation';

interface ExcavationFormProps {
  projectPhaseId: number;
  onSubmit: (data: CreateExcavationData) => void;
  onCancel: () => void;
  initialData?: Partial<CreateExcavationData>;
  isEditing?: boolean;
}

const soilTypes = [
  { value: 'clay', label: 'Arcilla' },
  { value: 'sand', label: 'Arena' },
  { value: 'rock', label: 'Roca' },
  { value: 'mixed', label: 'Mixto' },
];

const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'paused', label: 'Pausado' },
];

export default function ExcavationForm({ 
  projectPhaseId, 
  onSubmit, 
  onCancel, 
  initialData, 
  isEditing = false 
}: ExcavationFormProps) {
  const [formData, setFormData] = useState<CreateExcavationData>({
    projectPhaseId,
    excavationDepth: initialData?.excavationDepth || 0,
    excavationArea: initialData?.excavationArea || 0,
    excavationVolume: initialData?.excavationVolume || 0,
    soilType: initialData?.soilType || 'clay',
    equipment: initialData?.equipment || [],
    laborHours: initialData?.laborHours || 0,
    materialCost: initialData?.materialCost || 0,
    equipmentCost: initialData?.equipmentCost || 0,
    laborCost: initialData?.laborCost || 0,
    notes: initialData?.notes || '',
    photos: initialData?.photos || [],
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    status: initialData?.status || 'pending',
  });

  const [equipmentInput, setEquipmentInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Cost') || name.includes('Hours') || name.includes('excavation') 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment: [...(prev.equipment || []), equipmentInput.trim()],
      }));
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const totalCost = (formData.materialCost || 0) + (formData.equipmentCost || 0) + (formData.laborCost || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Editar' : 'Agregar'} Datos de Excavación
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medidas de Excavación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profundidad (m)
              </label>
              <input
                type="number"
                name="excavationDepth"
                value={formData.excavationDepth}
                onChange={handleInputChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área (m²)
              </label>
              <input
                type="number"
                name="excavationArea"
                value={formData.excavationArea}
                onChange={handleInputChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volumen (m³)
              </label>
              <input
                type="number"
                name="excavationVolume"
                value={formData.excavationVolume}
                onChange={handleInputChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Tipo de Suelo y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Suelo
              </label>
              <select
                name="soilType"
                value={formData.soilType}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {soilTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Equipos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipos Utilizados
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                placeholder="Agregar equipo..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
              />
              <button
                type="button"
                onClick={addEquipment}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipment?.map((equipment, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {equipment}
                  <button
                    type="button"
                    onClick={() => removeEquipment(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Costos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas de Trabajo
              </label>
              <input
                type="number"
                name="laborHours"
                value={formData.laborHours}
                onChange={handleInputChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Materiales ($)
              </label>
              <input
                type="number"
                name="materialCost"
                value={formData.materialCost}
                onChange={handleInputChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Equipos ($)
              </label>
              <input
                type="number"
                name="equipmentCost"
                value={formData.equipmentCost}
                onChange={handleInputChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Mano de Obra ($)
              </label>
              <input
                type="number"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleInputChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-lg font-semibold">
              Costo Total: ${totalCost.toFixed(2)}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales sobre la excavación..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}