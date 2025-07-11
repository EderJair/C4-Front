import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from "sonner";
import api from '@/lib/api';

// Esquema de validación para crear ingeniero
const createEngineerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos').max(15, 'Máximo 15 dígitos'),
  dni: z.string().min(8, 'El DNI debe tener al menos 8 dígitos').max(12, 'Máximo 12 dígitos'),
  address: z.string().optional(),
  companyName: z.string().optional(),
});

type CreateEngineerData = z.infer<typeof createEngineerSchema>;

export type { CreateEngineerData };

interface CreateEngineerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEngineerModal({ isOpen, onClose, onSuccess }: CreateEngineerModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateEngineerData>({
    resolver: zodResolver(createEngineerSchema),
  });

  const onSubmit = async (data: CreateEngineerData) => {
    try {
      const payload = {
        ...data,
        role: 'ingeniero',
        isActive: true,
      };

      console.log('Enviando datos del ingeniero:', payload);

      // Toast de carga
      toast.loading('Creando ingeniero...', {
        id: 'creating-engineer'
      });

      const result = await api.createEngineer(payload);
      console.log('Ingeniero creado exitosamente:', result);

      // Enviar email de bienvenida
      try {
        toast.loading('Enviando email de bienvenida...', {
          id: 'creating-engineer'
        });

        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            companyName: data.companyName,
          }),
        });

        if (emailResponse.ok) {
          console.log('Email enviado exitosamente');
          // Toast de éxito con email
          toast.success(`Ingeniero ${data.firstName} ${data.lastName} creado exitosamente`, {
            id: 'creating-engineer',
            description: 'El ingeniero ha sido agregado al sistema y se ha enviado el email de bienvenida',
            duration: 5000,
          });
        } else {
          console.error('Error enviando email, pero el ingeniero fue creado');
          // Toast de éxito parcial
          toast.success(`Ingeniero ${data.firstName} ${data.lastName} creado exitosamente`, {
            id: 'creating-engineer',
            description: 'El ingeniero ha sido agregado al sistema. Email no enviado automáticamente.',
            duration: 5000,
          });
        }
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
        // Toast de éxito parcial
        toast.success(`Ingeniero ${data.firstName} ${data.lastName} creado exitosamente`, {
          id: 'creating-engineer',
          description: 'El ingeniero ha sido agregado al sistema. Email no enviado automáticamente.',
          duration: 5000,
        });
      }

      onSuccess();
      onClose();
      reset();
    } catch (err) {
      console.error('Error al crear ingeniero:', err);
      
      // Toast de error
      toast.error('Error al crear el ingeniero', {
        id: 'creating-engineer',
        description: err instanceof Error ? err.message : 'Ocurrió un error inesperado',
        duration: 5000,
      });

      setError('root', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Error al crear el ingeniero'
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
            <h3 className="text-xl font-semibold text-gray-900">Agregar Nuevo Ingeniero</h3>
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
                placeholder="Carlos"
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
                placeholder="Rodríguez"
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
                placeholder="carlos.rodriguez@empresa.com"
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
                placeholder="987654322"
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
                placeholder="87654321"
              />
              {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni.message}</p>}
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                {...register('address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Av. Principal 123, Distrito"
              />
            </div>

            {/* Empresa */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <input
                {...register('companyName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre de la empresa (opcional)"
              />
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Información importante:</p>
                <ul className="mt-1 list-disc list-inside text-blue-700">
                  <li>El ingeniero será creado con rol "ingeniero" automáticamente</li>
                  <li>El estado inicial será "activo"</li>
                  <li>Se enviará un email de bienvenida con las credenciales</li>
                </ul>
              </div>
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
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear Ingeniero
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
