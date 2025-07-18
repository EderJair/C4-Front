'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import api from '@/lib/api';
import { Ring, Sector, Panel } from '@/types/ring';
import PanelCard from '@/components/panels/panel-card';
import CreatePanelModal from '@/components/panels/create-panel-modal';
import { toast } from 'sonner';

export default function SectorDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const excavationId = parseInt(params.excavationId as string);
  const ringId = parseInt(params.ringId as string);
  const sectorId = parseInt(params.sectorId as string);

  const [ring, setRing] = useState<Ring | null>(null);
  const [sector, setSector] = useState<Sector | null>(null);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener información del anillo
        const ringResponse = await api.getRingById(ringId);
        setRing(ringResponse);

        // Obtener información del sector
        const sectorResponse = await api.getSectorById(sectorId);
        setSector(sectorResponse);

        // Obtener paneles del sector
        const panelsResponse = await api.getSectorPanels(sectorId);
        setPanels(panelsResponse);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router, ringId, sectorId]);

  const handleCreatePanel = async (panelData: any) => {
    try {
      const newPanel = await api.createPanel(panelData);
      setPanels(prev => [...prev, newPanel]);
      toast.success('Panel creado exitosamente');
    } catch (error) {
      console.error('Error creating panel:', error);
      toast.error('Error al crear el panel');
    }
  };

  const handlePanelClick = (panelId: number) => {
    router.push(`/excavacion/${excavationId}/anillo/${ringId}/sector/${sectorId}/panel/${panelId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
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
          <button
            onClick={() => router.push(`/excavacion/${excavationId}`)}
            className="hover:text-blue-600 transition-colors"
          >
            Excavación #{excavationId}
          </button>
          <span>/</span>
          <button
            onClick={() => router.push(`/excavacion/${excavationId}/anillo/${ringId}`)}
            className="hover:text-blue-600 transition-colors"
          >
            {ring?.name || `Anillo ${ringId}`}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {sector?.name || `Sector ${sectorId}`}
          </span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {sector?.name || `Sector ${sectorId}`}
            </h1>
            <p className="text-gray-600">
              Paneles del sector • Ángulo: {sector?.angle}° • Área: {sector?.area} m²
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Panel
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Paneles</p>
                <p className="text-2xl font-bold text-gray-900">{panels.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Instalados</p>
                <p className="text-2xl font-bold text-green-600">
                  {panels.filter(p => p.status === 'completed').length}
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
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {panels.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  {panels.length > 0 ? Math.round((panels.filter(p => p.status === 'completed').length / panels.length) * 100) : 0}%
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

        {/* Paneles Grid */}
        {panels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {panels.map((panel) => (
              <PanelCard
                key={panel.id}
                panel={panel}
                onClick={() => handlePanelClick(panel.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay paneles</h3>
            <p className="text-gray-600 mb-4">
              Comienza creando el primer panel para este sector.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Crear Panel
            </button>
          </div>
        )}

        {/* Modal para crear panel */}
        <CreatePanelModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreatePanel}
          sectorId={sectorId}
        />
      </main>
    </div>
  );
}
