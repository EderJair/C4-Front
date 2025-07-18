'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import api from '@/lib/api';
import { Ring, Sector } from '@/types/ring';
import SectorCard from '@/components/sectors/sector-card';
import CreateSectorModal from '@/components/sectors/create-sector-modal';
import { toast } from 'sonner';

export default function RingDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const excavationId = parseInt(params.excavationId as string);
  const ringId = parseInt(params.ringId as string);

  const [ring, setRing] = useState<Ring | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (ringId) {
      loadRingDetails();
      loadSectors();
    }
  }, [isAuthenticated, ringId]);

  const loadRingDetails = async () => {
    try {
      // Por ahora, simulamos datos del anillo
      setRing({
        id: ringId,
        name: `Anillo ${ringId}`,
        excavationDataId: excavationId,
        diameter: 5.5,
        depth: 1.5,
        position: 1,
        status: 'active',
        sectorCount: 8,
        completedSectors: 3,
        material: 'Concreto',
        thickness: 0.3,
        volume: 25.5,
        cost: 15000.00,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      });
    } catch (error) {
      console.error('Error loading ring details:', error);
      toast.error('Error al cargar los detalles del anillo');
    }
  };

  const loadSectors = async () => {
    try {
      setLoading(true);
      const sectorsData = await api.getRingSectors(ringId);
      setSectors(sectorsData);
    } catch (error) {
      console.error('Error loading sectors:', error);
      toast.error('Error al cargar los sectores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSector = async (data: any) => {
    try {
      await api.createSector({
        ...data,
        ringId: ringId
      });
      toast.success('Sector creado exitosamente');
      loadSectors();
    } catch (error) {
      console.error('Error creating sector:', error);
      toast.error('Error al crear el sector');
    }
  };

  const handleSectorClick = (sectorId: number) => {
    router.push(`/excavacion/${excavationId}/anillo/${ringId}/sector/${sectorId}`);
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
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push(`/excavacion/${excavationId}`)}
            className="hover:text-blue-600 transition-colors"
          >
            Excavación #{excavationId}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {ring?.name || `Anillo ${ringId}`}
          </span>
        </div>

        {/* Header del anillo */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {ring?.name || `Anillo ${ringId}`}
            </h1>
          </div>

          {ring && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Dimensiones</p>
                  <p className="text-lg font-semibold">
                    ⌀ {ring.diameter}m
                  </p>
                  <p className="text-sm text-gray-600">
                    Profundidad: {ring.depth}m
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Posición</p>
                  <p className="text-lg font-semibold">#{ring.position}</p>
                  <p className="text-sm text-gray-600">
                    Material: {ring.material}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Progreso</p>
                  <p className="text-lg font-semibold">
                    {ring.completedSectors || 0}/{ring.sectorCount || 0} sectores
                  </p>
                  <p className="text-sm text-gray-600">
                    {Math.round(((ring.completedSectors || 0) / (ring.sectorCount || 1)) * 100)}% completado
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Estado</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    ring.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    ring.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ring.status === 'completed' ? 'Completado' :
                     ring.status === 'active' ? 'Activo' :
                     'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Header de sectores */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sectores del Anillo</h2>
            <p className="text-gray-600 mt-1">
              Gestiona los sectores de construcción para este anillo
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Sector
          </button>
        </div>

        {/* Grid de sectores */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : sectors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <SectorCard
                key={sector.id}
                sector={sector}
                onClick={() => handleSectorClick(sector.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay sectores registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza dividiendo este anillo en sectores de construcción
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Primer Sector
            </button>
          </div>
        )}

        {/* Modal para crear sector */}
        <CreateSectorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSector}
          ringId={ringId}
        />
      </main>
    </div>
  );
}
