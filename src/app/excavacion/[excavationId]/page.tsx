'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import api from '@/lib/api';
import { Ring } from '@/types/ring';
import { ExcavationData } from '@/types/excavation';
import RingCard from '@/components/rings/ring-card';
import CreateRingModal from '@/components/rings/create-ring-modal';
import { toast } from 'sonner';

export default function ExcavationDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const excavationId = parseInt(params.excavationId as string);

  const [excavation, setExcavation] = useState<ExcavationData | null>(null);
  const [rings, setRings] = useState<Ring[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (excavationId) {
      loadExcavationDetails();
      loadRings();
    }
  }, [isAuthenticated, excavationId]);

  const loadExcavationDetails = async () => {
    try {
      // Aquí asumimos que tienes un endpoint para obtener detalles de excavación
      // const excavationData = await api.getExcavation(excavationId);
      // setExcavation(excavationData);
      
      // Por ahora, simulamos datos de excavación
      setExcavation({
        id: excavationId,
        projectPhaseId: 1,
        excavationDepth: 15.5,
        excavationArea: 120.0,
        excavationVolume: 1860.0,
        soilType: 'mixed',
        equipment: ['Excavadora', 'Bulldozer'],
        laborHours: 48,
        materialCost: 25000,
        equipmentCost: 15000,
        laborCost: 12000,
        notes: 'Excavación principal para túnel',
        status: 'in_progress',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      });
    } catch (error) {
      console.error('Error loading excavation details:', error);
      toast.error('Error al cargar los detalles de la excavación');
    }
  };

  const loadRings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando anillos para excavación:', excavationId);
      const ringsData = await api.getExcavationRings(excavationId);
      console.log('📋 Anillos obtenidos:', ringsData);
      setRings(ringsData || []); // Asegurar que sea un array
    } catch (error) {
      console.error('Error loading rings:', error);
      toast.error('Error al cargar los anillos');
      setRings([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRing = async (data: any) => {
    try {
      console.log('🚀 Creando anillo con datos:', data);
      console.log('🎯 Excavación ID:', excavationId);
      
      const ringData = {
        ...data,
        excavationDataId: excavationId
      };
      
      console.log('📡 Enviando al backend:', ringData);
      
      await api.createRing(ringData);
      toast.success('Anillo creado exitosamente');
      setIsCreateModalOpen(false);
      loadRings();
    } catch (error) {
      console.error('Error creating ring:', error);
      toast.error('Error al crear el anillo');
    }
  };

  const handleRingClick = (ringId: number) => {
    router.push(`/excavacion/${excavationId}/anillo/${ringId}`);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="hover:text-blue-600 transition-colors"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            Excavación #{excavationId}
          </span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {/* Botón Volver */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver a la página anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Excavación #{excavationId}
              </h1>
              <p className="text-gray-600">
                Gestiona los anillos de esta excavación
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Anillo
          </button>
        </div>

        {/* Información de la excavación */}
        {excavation && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Información de la Excavación</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Profundidad</p>
                <p className="text-lg font-semibold">{excavation.excavationDepth} m</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Área</p>
                <p className="text-lg font-semibold">{excavation.excavationArea} m²</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Volumen</p>
                <p className="text-lg font-semibold">{excavation.excavationVolume} m³</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Anillos</p>
                <p className="text-2xl font-bold text-gray-900">{rings?.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {rings.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rings?.filter(r => r.status === 'active').length || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progreso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rings && rings.length > 0 ? Math.round((rings.filter(r => r.status === 'completed').length / rings.length) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Anillos Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : rings && rings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rings.map((ring) => (
              <RingCard
                key={ring.id}
                ring={ring}
                onClick={() => handleRingClick(ring.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay anillos</h3>
            <p className="text-gray-600 mb-4">
              Comienza creando el primer anillo para esta excavación.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Primer Anillo
            </button>
          </div>
        )}

        {/* Modal para crear anillo */}
        <CreateRingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateRing}
          excavationId={excavationId}
        />
      </main>
    </div>
  );
}
