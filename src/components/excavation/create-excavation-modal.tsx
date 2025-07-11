'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateExcavationData } from '@/types/excavation';
import { toast } from 'sonner';

const excavationSchema = z.object({
  excavationDepth: z.number().min(0.1, 'La profundidad debe ser mayor a 0').optional(),
  excavationArea: z.number().min(0.1, 'El área debe ser mayor a 0').optional(),
  excavationVolume: z.number().min(0.1, 'El volumen debe ser mayor a 0').optional(),
  soilType: z.enum(['clay', 'sand', 'rock', 'mixed', 'gravel', 'limestone', 'other']).optional(),
  equipment: z.array(z.string()).optional(),
  laborHours: z.number().min(0, 'Las horas de trabajo deben ser positivas').optional(),
  materialCost: z.number().min(0, 'El costo de materiales debe ser positivo').optional(),
  equipmentCost: z.number().min(0, 'El costo de equipos debe ser positivo').optional(),
  laborCost: z.number().min(0, 'El costo de mano de obra debe ser positivo').optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'paused', 'cancelled']).optional()
});

type ExcavationFormData = z.infer<typeof excavationSchema>;

interface CreateExcavationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreateExcavationData) => void;
  projectId: number;
}

const soilTypeOptions = [
  { value: 'clay', label: 'Arcilla' },
  { value: 'sand', label: 'Arena' },
  { value: 'rock', label: 'Roca' },
  { value: 'mixed', label: 'Mixto' },
  { value: 'gravel', label: 'Grava' },
  { value: 'limestone', label: 'Caliza' },
  { value: 'other', label: 'Otro' }
];

const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'paused', label: 'Pausada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const commonEquipment = [
  'Excavadora',
  'Bulldozer',
  'Retroexcavadora',
  'Cargador frontal',
  'Compactador',
  'Martillo hidráulico',
  'Camión volquete',
  'Otros'
];

export default function CreateExcavationModal({ isOpen, onClose, onSuccess, projectId }: CreateExcavationModalProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [useFileData, setUseFileData] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<ExcavationFormData>({
    resolver: zodResolver(excavationSchema),
    defaultValues: {
      status: 'pending'
    }
  });

  const watchArea = watch('excavationArea');
  const watchDepth = watch('excavationDepth');

  // Calcular volumen automáticamente
  const calculateVolume = () => {
    if (watchArea && watchDepth) {
      const volume = watchArea * watchDepth;
      setValue('excavationVolume', Number(volume.toFixed(2)));
    }
  };

  const handleEquipmentChange = (equipment: string) => {
    const newEquipment = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter(e => e !== equipment)
      : [...selectedEquipment, equipment];
    setSelectedEquipment(newEquipment);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success('Archivo subido correctamente');
    }
  };

  const onSubmit = async (data: ExcavationFormData) => {
    try {
      const excavationData: CreateExcavationData = {
        projectPhaseId: projectId,
        ...data,
        equipment: selectedEquipment.length > 0 ? selectedEquipment : undefined
      };

      await onSuccess(excavationData);
      reset();
      setSelectedEquipment([]);
      setUploadedFile(null);
      setUseFileData(false);
    } catch (error) {
      console.error('Error creating excavation:', error);
      toast.error('Error al crear la excavación');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="p-6 border-b border-gray-200/50 backdrop-blur-xl bg-white/80">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Agregar Información de Excavación</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors backdrop-blur-sm"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 bg-white/90 backdrop-blur-xl">
          {/* Opción de datos o archivo */}
          <div className="mb-6 p-4 bg-blue-50/70 backdrop-blur-sm rounded-lg border border-blue-200/50">
            <h3 className="font-semibold text-blue-900 mb-3">Método de entrada de datos</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dataMethod"
                  checked={!useFileData}
                  onChange={() => setUseFileData(false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ingresar datos manualmente</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dataMethod"
                  checked={useFileData}
                  onChange={() => setUseFileData(true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Subir archivo PDF (extracción automática - próximamente)</span>
              </label>
            </div>
          </div>

          {/* Subida de archivo */}
          {useFileData && (
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300/50 rounded-lg bg-gray-50/50 backdrop-blur-sm">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-500 mb-2">Arrastra y suelta tu archivo PDF aquí, o</p>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">selecciona un archivo</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Archivo subido: {uploadedFile.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Formulario manual */}
          {!useFileData && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Medidas y volumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profundidad de Excavación (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('excavationDepth', { valueAsNumber: true })}
                    onBlur={calculateVolume}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="0.00"
                  />
                  {errors.excavationDepth && (
                    <p className="text-red-500 text-sm mt-1">{errors.excavationDepth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área de Excavación (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('excavationArea', { valueAsNumber: true })}
                    onBlur={calculateVolume}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="0.00"
                  />
                  {errors.excavationArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.excavationArea.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volumen de Excavación (m³)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('excavationVolume', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="0.00"
                  />
                  {errors.excavationVolume && (
                    <p className="text-red-500 text-sm mt-1">{errors.excavationVolume.message}</p>
                  )}
                </div>
              </div>

              {/* Tipo de suelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Suelo
                </label>
                <select
                  {...register('soilType')}
                  className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Seleccionar tipo de suelo</option>
                  {soilTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipos Utilizados
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {commonEquipment.map(equipment => (
                    <label key={equipment} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(equipment)}
                        onChange={() => handleEquipmentChange(equipment)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{equipment}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Costos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas de Trabajo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('laborHours', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="0.0"
                  />
                  {errors.laborHours && (
                    <p className="text-red-500 text-sm mt-1">{errors.laborHours.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de Materiales ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('materialCost', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="0.00"
                  />
                  {errors.materialCost && (
                    <p className="text-red-500 text-sm mt-1">{errors.materialCost.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de Equipos ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('equipmentCost', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="0.00"
                  />
                  {errors.equipmentCost && (
                    <p className="text-red-500 text-sm mt-1">{errors.equipmentCost.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de Mano de Obra ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('laborCost', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="0.00"
                  />
                  {errors.laborCost && (
                    <p className="text-red-500 text-sm mt-1">{errors.laborCost.message}</p>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  placeholder="Observaciones, comentarios adicionales..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white/80 hover:bg-gray-50/80 rounded-lg transition-colors backdrop-blur-sm border border-gray-200/50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600/90 hover:bg-blue-700/90 text-white rounded-lg transition-colors disabled:opacity-50 backdrop-blur-sm"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Excavación'}
                </button>
              </div>
            </form>
          )}

          {/* Botón para archivo */}
          {useFileData && (
            <div className="flex justify-end space-x-3 pt-4 bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white/80 hover:bg-gray-50/80 rounded-lg transition-colors backdrop-blur-sm border border-gray-200/50"
              >
                Cancelar
              </button>
              <button
                onClick={() => toast.info('Funcionalidad de extracción automática próximamente disponible')}
                className="px-6 py-2 bg-purple-600/90 hover:bg-purple-700/90 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                Procesar Archivo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
