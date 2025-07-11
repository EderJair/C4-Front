'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import api from '@/lib/api';

// Esquema de validación
const createProjectSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'Máximo 200 caracteres'),
  address: z.string().min(1, 'La dirección es requerida'),
  clientName: z.string().min(1, 'El nombre del cliente es requerido'),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  totalBudget: z.number().min(1, 'El presupuesto debe ser mayor a 0'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  estimatedEndDate: z.string().optional(),
  description: z.string().optional(),
  assignedEngineerId: z.number().optional(), // ← NUEVO
});

type CreateProjectData = z.infer<typeof createProjectSchema>;

export type { CreateProjectData };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

interface Engineer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}




export default function CreateProjectModal({ isOpen, onClose, onSuccess, userId }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
  });

  const [engineers, setEngineers] = useState<Engineer[]>([]);


  useEffect(() => {
  if (isOpen) {
    loadEngineers();
  }
}, [isOpen]);

  const loadEngineers = async () => {
    try {
      const engineers = await api.getEngineers();
      setEngineers(engineers);
    } catch (error) {
      console.error('Error loading engineers:', error);
      toast.error('Error al cargar ingenieros', {
        description: 'No se pudo cargar la lista de ingenieros disponibles',
        duration: 3000,
      });
    }
  };

  const onSubmit = async (data: CreateProjectData) => {
    try {
      const payload = {
        ...data,
        totalBudget: Number(data.totalBudget), // Asegurar que sea número
        createdById: userId,
      };

      console.log('Enviando datos al backend:', payload); // Para debugging

      // Toast de carga
      toast.loading('Creando proyecto...', {
        id: 'creating-project'
      });

      const result = await api.createProject(payload);
      console.log('Proyecto creado exitosamente:', result); // Para debugging

      // Toast de éxito
      toast.success(`Proyecto "${data.name}" creado exitosamente`, {
        id: 'creating-project',
        description: 'El proyecto ha sido agregado al sistema',
        duration: 4000,
      });

      onSuccess();
      onClose();
      reset();
    } catch (err) {
      console.error('Error al crear proyecto:', err); // Para debugging
      
      // Toast de error
      toast.error('Error al crear el proyecto', {
        id: 'creating-project',
        description: err instanceof Error ? err.message : 'Ocurrió un error inesperado',
        duration: 5000,
      });

      setError('root', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Error al crear el proyecto'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Crear Nuevo Proyecto</h3>
            <button
              onClick={() => {
                onClose();
                reset();
              }}
              className="text-black hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del proyecto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proyecto *
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Construcción Casa Moderna"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                {...register('address')}
                className="w-full px-3 py-2 border  border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Av. Principal 123, Distrito"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente *
              </label>
              <input
                {...register('clientName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Juan Pérez"
              />
              {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>}
            </div>

            {/* Email del cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Cliente
              </label>
              <input
                {...register('clientEmail')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="cliente@email.com"
              />
              {errors.clientEmail && <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono del Cliente
              </label>
              <input
                {...register('clientPhone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="987654321"
              />
            </div>

            {/* Presupuesto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presupuesto Total (USD) *
              </label>
              <input
                {...register('totalBudget', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="150000"
              />
              {errors.totalBudget && <p className="text-red-500 text-sm mt-1">{errors.totalBudget.message}</p>}
            </div>

            {/* Fecha de inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                {...register('startDate')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
            </div>

            {/* Fecha estimada de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Estimada de Finalización
              </label>
              <input
                {...register('estimatedEndDate')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción opcional del proyecto..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignar Ingeniero
              </label>
              <select
                {...register('assignedEngineerId', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin asignar</option>
                {engineers.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.firstName} {engineer.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error general */}
          {errors.root && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errors.root.message}
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                onClose();
                reset();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}