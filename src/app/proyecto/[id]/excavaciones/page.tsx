'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/layout/navbar';
import { ExcavationData } from '@/types/excavation';
import CreateExcavationModal from '@/components/excavation/create-excavation-modal';
import ExcavationCard from '@/components/excavation/excavation-card';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ProjectExcavationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [excavations, setExcavations] = useState<ExcavationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && id) {
      loadProjectData();
      loadExcavations();
    }
  }, [isAuthenticated, id]);

  const loadProjectData = async () => {
    try {
      const projectData = await api.getProject(Number(id));
      console.log('📋 Datos del proyecto:', projectData);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Error al cargar el proyecto');
    }
  };

  const loadExcavations = async () => {
    try {
      setLoading(true);
      // Usar el endpoint correcto según la documentación del backend
      const excavationsResponse = await api.getProjectExcavations(Number(id));
      console.log('📋 Respuesta del backend:', excavationsResponse);
      
      // Extraer el array de datos de la respuesta
      let excavationsData: ExcavationData[] = [];
      
      if (Array.isArray(excavationsResponse)) {
        excavationsData = excavationsResponse;
      } else if (excavationsResponse && (excavationsResponse as any).data) {
        excavationsData = Array.isArray((excavationsResponse as any).data) ? (excavationsResponse as any).data : [];
      } else {
        console.error('Formato de respuesta inesperado:', excavationsResponse);
        excavationsData = [];
      }
      
      // Mapear los datos del backend al formato del frontend si es necesario
      const mappedExcavations = excavationsData.map((exc: any) => ({
        id: exc.id,
        projectPhaseId: exc.projectPhaseId || exc.projectId,
        excavationDepth: exc.depth || exc.excavationDepth || 0,
        excavationArea: exc.width && exc.length ? exc.width * exc.length : exc.excavationArea || 0,
        excavationVolume: exc.volume || exc.excavationVolume || 0,
        soilType: exc.soilType ? exc.soilType.toLowerCase() : 'mixed',
        equipment: exc.equipmentUsed ? [exc.equipmentUsed] : [],
        laborHours: exc.hoursWorked || exc.laborHours || 0,
        materialCost: exc.totalCost ? exc.totalCost * 0.4 : exc.materialCost || 0, // Estimación
        equipmentCost: exc.totalCost ? exc.totalCost * 0.3 : exc.equipmentCost || 0, // Estimación
        laborCost: exc.totalCost ? exc.totalCost * 0.3 : exc.laborCost || 0, // Estimación
        notes: exc.notes || '',
        status: 'completed' as const, // Valor por defecto con tipo correcto
        createdAt: exc.date || exc.createdAt || new Date().toISOString(),
        updatedAt: exc.updatedAt || new Date().toISOString()
      }));
      
      setExcavations(mappedExcavations);
    } catch (error) {
      console.error('Error loading excavations:', error);
      toast.error('Error al cargar las excavaciones');
      setExcavations([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExcavation = async (excavationData: any) => {
    try {
      console.log('🚀 Creando excavación con datos originales:', excavationData);
      
      // Formatear fechas sin microsegundos para evitar problemas del backend
      const formatDate = (date: string | Date) => {
        const d = new Date(date);
        return d.toISOString().split('.')[0] + 'Z'; // Remover microsegundos
      };
      
      // Usar directamente la estructura CreateExcavationData
      const backendData = {
        // TODO: Implementar lógica para obtener projectPhaseId real del proyecto
        // Por ahora usar fase por defecto que existe en el backend (según patrón del código existente)
        projectPhaseId: 1, 
        excavationDepth: excavationData.excavationDepth || 0,
        excavationArea: excavationData.excavationArea || 0,
        excavationVolume: excavationData.excavationVolume || 0,
        soilType: excavationData.soilType || 'mixed', // Mantener en minúsculas según la interfaz
        equipment: excavationData.equipment || [],
        laborHours: excavationData.laborHours || 0,
        materialCost: excavationData.materialCost || 0,
        equipmentCost: excavationData.equipmentCost || 0,
        laborCost: excavationData.laborCost || 0,
        notes: excavationData.notes || '',
        startDate: excavationData.startDate ? formatDate(excavationData.startDate) : formatDate(new Date()),
        endDate: excavationData.endDate ? formatDate(excavationData.endDate) : formatDate(new Date()),
        status: excavationData.status || 'pending'
      };
      
      console.log('📡 Enviando datos completos (problema ya resuelto):', backendData);
      console.log('🌐 URL completa será:', `http://localhost:3001/api/excavation`);
      
      const result = await api.createExcavation(backendData);
      
      console.log('✅ Resultado del API:', result);
      
      // Quitar el toast duplicate - el modal ya maneja el toast de éxito
      // toast.success('Excavación creada exitosamente');       
      setIsModalOpen(false);
      loadExcavations();
    } catch (error: any) {
      console.error('❌ Error creating excavation:', error);
      console.error('❌ Error message:', error.message);
      
      // Mostrar mensaje de error más específico
      const errorMessage = error.message || 'Error desconocido al crear la excavación';
      toast.error(`Error al crear la excavación: ${errorMessage}`);
    }
  };

  const handleViewRings = (excavationId: number) => {
    router.push(`/excavacion/${excavationId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Acceso no autorizado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Excavaciones del Proyecto
              </h1>
              {project && (
                <p className="text-gray-600 mt-2">
                  {project.name} - {project.address}
                </p>
              )}
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Volver al Panel del Proyecto
              </button>
            </div>
            
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{excavations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {excavations.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {excavations.filter(e => e.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Volumen Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(excavations) ? 
                    excavations.reduce((acc, e) => acc + (Number(e.excavationVolume) || 0), 0).toFixed(2) : 
                    '0.00'
                  }m³
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Excavations List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : excavations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay excavaciones</h3>
            <p className="text-gray-500 mb-6">Comienza agregando la primera excavación para este proyecto.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              Agregar Primera Excavación
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {excavations.map((excavation) => (
              <ExcavationCard
                key={excavation.id}
                excavation={excavation}
                onUpdate={loadExcavations}
                onViewRings={() => handleViewRings(excavation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear excavación */}
      <CreateExcavationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateExcavation}
        projectId={Number(id)}
      />
    </div>
  );
}
