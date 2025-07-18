import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from "sonner";
import api from '@/lib/api';

// Esquema de validación para crear trabajador
const createWorkerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos').max(15, 'Máximo 15 dígitos'),
  dni: z.string().min(8, 'El DNI debe tener al menos 8 dígitos').max(12, 'Máximo 12 dígitos'),
  address: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
});

type CreateWorkerData = z.infer<typeof createWorkerSchema>;

export type { CreateWorkerData };

interface CreateWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateWorkerModal({ isOpen, onClose, onSuccess }: CreateWorkerModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateWorkerData>({
    resolver: zodResolver(createWorkerSchema),
  });

  const onSubmit = async (data: CreateWorkerData) => {
    try {
      const payload = {
        ...data,
        role: 'trabajador',    // 👈 Rol específico
        isActive: true,
      };

      console.log('📋 Enviando datos del trabajador:', payload);

      // Toast de carga
      toast.loading('Creando trabajador...', {
        id: 'creating-worker'
      });

      // 🚀 LLAMADA A LA API
      const result = await api.createWorker(payload);
      console.log('✅ Trabajador creado exitosamente:', result);

      // Toast de éxito
      toast.success(`Trabajador ${data.firstName} ${data.lastName} creado exitosamente`, {
        id: 'creating-worker',
        description: 'El trabajador ha sido agregado al sistema',
        duration: 5000,
      });

      onSuccess();
      onClose();
      reset();
    } catch (err) {
      console.error('❌ Error al crear trabajador:', err);
      
      // Toast de error
      toast.error('Error al crear el trabajador', {
        id: 'creating-worker',
        description: err instanceof Error ? err.message : 'Ocurrió un error inesperado',
        duration: 5000,
      });

      setError('root', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Error al crear el trabajador'
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-black">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Agregar Nuevo Trabajador</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                {...register('firstName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Juan"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                {...register('lastName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Pérez"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="juan.perez@empresa.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="987654321"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            {/* DNI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DNI *
              </label>
              <input
                {...register('dni')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12345678"
              />
              {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni.message}</p>}
            </div>

            {/* Especialización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialización
              </label>
              <input
                {...register('specialization')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Operador de maquinaria"
              />
              {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization.message}</p>}
            </div>

            {/* Experiencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experiencia
              </label>
              <input
                {...register('experience')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5 años"
              />
              {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                {...register('address')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Av. Construcción 123, Lima"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Error general */}
          {errors.root && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.root.message}
            </div>
          )}

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
              {isSubmitting ? 'Creando...' : 'Crear Trabajador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
