'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CreateSectorData } from '@/types/ring';

const createSectorSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  angle: z.number().min(0, 'El ángulo debe ser mayor o igual a 0').max(360, 'El ángulo debe ser menor a 360'),
  position: z.number().min(1, 'La posición debe ser mayor a 0'),
  material: z.string().min(1, 'El material es requerido'),
  area: z.number().min(0.01, 'El área debe ser mayor a 0'),
  cost: z.number().min(0, 'El costo debe ser mayor o igual a 0'),
  status: z.enum(['active', 'inactive', 'completed'])
});

type CreateSectorFormData = z.infer<typeof createSectorSchema>;

interface CreateSectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreateSectorData) => void;
  ringId: number;
}

export default function CreateSectorModal({ isOpen, onClose, onSuccess, ringId }: CreateSectorModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateSectorFormData>({
    resolver: zodResolver(createSectorSchema),
    defaultValues: {
      status: 'active',
      position: 1
    }
  });

  const onSubmit = async (data: CreateSectorFormData) => {
    try {
      await onSuccess({
        ...data,
        ringId
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating sector:', error);
      toast.error('Error al crear el sector');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Crear Nuevo Sector</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Nombre del sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Sector *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Sector S1"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del sector..."
              />
            </div>

            {/* Ángulo y Posición */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ángulo (°) *
                </label>
                <input
                  {...register('angle', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="360"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="90"
                />
                {errors.angle && (
                  <p className="text-red-500 text-sm mt-1">{errors.angle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posición *
                </label>
                <input
                  {...register('position', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
                {errors.position && (
                  <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
                )}
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material *
              </label>
              <select
                {...register('material')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un material</option>
                <option value="Acero">Acero</option>
                <option value="Concreto">Concreto</option>
                <option value="Madera">Madera</option>
                <option value="Mixto">Mixto</option>
              </select>
              {errors.material && (
                <p className="text-red-500 text-sm mt-1">{errors.material.message}</p>
              )}
            </div>

            {/* Área y Costo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área (m²) *
                </label>
                <input
                  {...register('area', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12.5"
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo (USD) *
                </label>
                <input
                  {...register('cost', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8000.00"
                />
                {errors.cost && (
                  <p className="text-red-500 text-sm mt-1">{errors.cost.message}</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Información</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• El ángulo se mide en grados (0° - 360°)</li>
                <li>• La posición indica el orden del sector en el anillo</li>
                <li>• El área se calcula en metros cuadrados</li>
                <li>• Cada sector contendrá múltiples paneles</li>
              </ul>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creando...' : 'Crear Sector'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
