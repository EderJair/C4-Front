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
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'analyzing' | 'completed'>('idle');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [pdfType, setPdfType] = useState<string>('excavation_report');
  const [pdfDescription, setPdfDescription] = useState<string>('');
  const [pdfNotes, setPdfNotes] = useState<string>('');

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
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('El archivo no debe superar los 10MB');
        return;
      }
      setUploadedFile(file);
      toast.success(`Archivo subido correctamente: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const onSubmit = async (data: ExcavationFormData) => {
    try {
      const excavationData: CreateExcavationData = {
        projectPhaseId: 1, // Usar fase por defecto que existe en el backend
        ...data,
        equipment: selectedEquipment.length > 0 ? selectedEquipment : undefined
      };

      console.log('🚀 Creando excavación con datos:', excavationData);
      
      // Si los datos vienen del PDF, mostrar un mensaje diferente
      if (extractedData) {
        toast.loading('Creando excavación con datos reales del PDF...', {
          description: 'Guardando los datos verificados por el ingeniero'
        });
      } else {
        const loadingToastId = toast.loading('Creando excavación...', {
          description: 'Guardando los datos ingresados manualmente'
        });

        try {
          await onSuccess(excavationData);
          
          // Cerrar el toast de loading
          toast.dismiss(loadingToastId);
          
          // Mostrar toast de éxito
          toast.success('Excavación creada exitosamente');
          
          // Limpiar todo al finalizar
          reset();
          setSelectedEquipment([]);
          setUploadedFile(null);
          setUseFileData(false);
          setExtractedData(null);
          setProcessId(null);
          setProcessingStatus('idle');
          setProcessingProgress(0);
          setIsProcessingPDF(false);
          onClose();
        } catch (error) {
          // Cerrar el toast de loading en caso de error
          toast.dismiss(loadingToastId);
          // El error ya se maneja en la función onSuccess, pero aseguramos cerrar el loading
        }
      }
    } catch (error) {
      console.error('Error creating excavation:', error);
      toast.error('Error al crear la excavación');
    }
  };

  const processPDF = async () => {
    if (!uploadedFile) {
      toast.error('Por favor selecciona un archivo PDF');
      return;
    }

    try {
      setIsProcessingPDF(true);
      setProcessingStatus('processing');
      setProcessingProgress(0);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('pdf', uploadedFile);
      formData.append('projectPhaseId', '1');
      formData.append('pdfType', pdfType);
      formData.append('description', pdfDescription || 'Reporte de excavación procesado automáticamente');
      formData.append('notes', pdfNotes || 'Procesado desde el modal de excavación');

      // Toast de inicio del procesamiento
      toast.loading('Procesando PDF...', {
        id: 'processing-pdf',
        description: '📄 Extrayendo texto REAL del PDF y procesando con IA - esto puede tomar unos segundos'
      });

      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      // Enviar el PDF al backend
      const response = await fetch('/api/excavation/process-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // No agregar Content-Type, el navegador lo agrega automáticamente para FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar el PDF');
      }

      const result = await response.json();
      
      // Guardar el processId para consultar el estado
      setProcessId(result.data.processId);

      toast.success('PDF procesado exitosamente', {
        id: 'processing-pdf',
        description: '✅ Extracción REAL completada - consultando datos estructurados'
      });

      // Consultar el estado del procesamiento
      await checkProcessingStatus(result.data.processId);

    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Error al procesar el PDF', {
        id: 'processing-pdf',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsProcessingPDF(false);
      if (processingStatus !== 'completed') {
        setProcessingStatus('idle');
        setProcessingProgress(0);
      }
    }
  };

  const checkProcessingStatus = async (processId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }

      const response = await fetch(`/api/excavation/process-pdf/status/${processId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al consultar el estado del procesamiento');
      }

      const statusData = await response.json();
      console.log('Estado del procesamiento:', statusData);
      
      // Actualizar estado visual
      setProcessingStatus(statusData.data.status);
      setProcessingProgress(statusData.data.progress || 0);
      
      console.log('🔍 Estado recibido:', statusData.data.status);
      console.log('🔍 Success:', statusData.success);
      console.log('🔍 Extracted data:', statusData.data.extractedData);
      
      if (statusData.success && statusData.data.status === 'completed') {
        const extractedText = statusData.data.extractedText;
        
        console.log('📋 Texto extraído del PDF:', extractedText);
        
        toast.success('PDF procesado exitosamente', {
          description: `✅ TEXTO EXTRAÍDO Y ENVIADO A N8N: ${statusData.data.textLength} caracteres extraídos del PDF real y enviados a tu webhook.`,
          duration: 10000
        });
        
        // Mostrar el texto extraído en el modal
        setExtractedData({
          text: extractedText,
          length: statusData.data.textLength,
          fileInfo: statusData.data.fileInfo
        });
        
        // Resetear estados del procesamiento
        setProcessingStatus('completed');
        setProcessingProgress(100);
        setIsProcessingPDF(false);
        setProcessId(null);
        setUploadedFile(null);
        
      } else if (statusData.data.status === 'processing' || statusData.data.status === 'analyzing') {
        const progressMessage = statusData.data.status === 'processing' 
          ? 'Procesando PDF...' 
          : 'Analizando contenido...';
          
        toast.info(progressMessage, {
          description: `Progreso: ${statusData.data.progress}%`,
          duration: 2000
        });
        
        // Continuar consultando el estado cada 2 segundos
        setTimeout(() => {
          checkProcessingStatus(processId);
        }, 2000);
      } else {
        toast.error('Error en el procesamiento', {
          description: statusData.message || 'Estado desconocido'
        });
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Error al consultar el estado', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Función para limpiar todos los estados
  const handleModalClose = () => {
    reset();
    setSelectedEquipment([]);
    setUploadedFile(null);
    setUseFileData(false);
    setExtractedData(null);
    setProcessId(null);
    setProcessingStatus('idle');
    setProcessingProgress(0);
    setIsProcessingPDF(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="p-6 border-b border-gray-200/50 backdrop-blur-xl bg-white/80">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Nueva Excavación
            </h2>
            <button
              onClick={handleModalClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs simplificados */}
          <div className="mt-4 flex space-x-1 bg-gray-100/50 backdrop-blur-sm p-1 rounded-lg">
            <button
              onClick={() => setUseFileData(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                useFileData 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              � Extraer texto del PDF
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-gray-200/50 bg-gray-50/50 rounded-t-lg">
          <button
            onClick={() => setUseFileData(false)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              !useFileData
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📝 Formulario Manual
          </button>
          <button
            onClick={() => setUseFileData(true)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              useFileData
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📄 Subir PDF (Auto-llenar)
          </button>
        </div>

        <div className="p-6">
          {/* Subida de archivo */}
          {useFileData && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300/50 rounded-lg p-6 text-center bg-gray-50/50 backdrop-blur-sm">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-600">
                    Subir PDF de Excavación
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    El texto se extraerá y enviará a n8n para procesamiento
                  </span>
                </label>
              </div>

              {uploadedFile && (
                <div className="bg-green-50/70 backdrop-blur-sm rounded-lg p-4 border border-green-200/50">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-800 font-medium">
                      {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}

              {/* Botón de procesamiento */}
              <div className="flex justify-center">
                <button
                  onClick={processPDF}
                  disabled={!uploadedFile || isProcessingPDF}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    !uploadedFile || isProcessingPDF
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isProcessingPDF ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extrayendo texto...
                    </>
                  ) : (
                    '� Extraer texto y enviar a n8n'
                  )}
                </button>
              </div>

              {/* Indicador de progreso */}
              {isProcessingPDF && (
                <div className="space-y-2">
                  <div className="bg-blue-50/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                    <div className="flex items-center mb-2">
                      <svg className="animate-spin w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-blue-800 font-medium">
                        {processingStatus === 'processing' ? 'Extrayendo texto del PDF...' : 'Enviando a n8n...'}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200/50 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Progreso: {processingProgress}%
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar texto extraído y enviado a n8n */}
              {extractedData && (
                <div className="mb-6 p-4 bg-green-50/70 backdrop-blur-sm rounded-lg border border-green-200/50">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-green-800 flex-1">
                      <p className="font-medium">✅ PDF procesado y texto enviado a n8n</p>
                      <p className="text-green-700 mt-1">
                        <strong>Texto extraído:</strong> {extractedData.length} caracteres enviados al webhook
                      </p>
                      <div className="mt-2 text-xs text-green-600">
                        <p>📡 Webhook: https://n8n-jose.up.railway.app/webhook-test/pdfexca</p>
                        <p>📄 Archivo: {extractedData.fileInfo?.name} ({extractedData.fileInfo?.size} bytes)</p>
                      </div>
                      
                      {/* Mostrar preview del texto extraído */}
                      <div className="mt-3 p-3 bg-gray-100 rounded text-xs max-h-32 overflow-y-auto">
                        <p className="font-medium text-gray-700 mb-1">📝 Preview del texto:</p>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {extractedData.text?.substring(0, 300)}...
                        </p>
                      </div>
                      
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setExtractedData(null);
                            setProcessingStatus('idle');
                            setProcessingProgress(0);
                          }}
                          className="text-xs text-green-600 hover:text-green-800 underline"
                        >
                          Procesar otro PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                  />
                  {errors.excavationDepth && (
                    <span className="text-red-500 text-sm">{errors.excavationDepth.message}</span>
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
                  />
                  {errors.excavationArea && (
                    <span className="text-red-500 text-sm">{errors.excavationArea.message}</span>
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
                  />
                  {errors.excavationVolume && (
                    <span className="text-red-500 text-sm">{errors.excavationVolume.message}</span>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonEquipment.map(equipment => (
                    <label key={equipment} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(equipment)}
                        onChange={() => handleEquipmentChange(equipment)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{equipment}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Horas de trabajo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas de Trabajo
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('laborHours', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                />
                {errors.laborHours && (
                  <span className="text-red-500 text-sm">{errors.laborHours.message}</span>
                )}
              </div>

              {/* Costos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de Materiales ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('materialCost', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  />
                  {errors.materialCost && (
                    <span className="text-red-500 text-sm">{errors.materialCost.message}</span>
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
                  />
                  {errors.equipmentCost && (
                    <span className="text-red-500 text-sm">{errors.equipmentCost.message}</span>
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
                  />
                  {errors.laborCost && (
                    <span className="text-red-500 text-sm">{errors.laborCost.message}</span>
                  )}
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
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  placeholder="Notas adicionales sobre la excavación..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando...
                    </>
                  ) : (
                    'Crear Excavación'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
