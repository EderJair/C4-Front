'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';

interface Project {
  id: number;
  name: string;
  description?: string;
  address: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  totalBudget: number;
  startDate: string;
  estimatedEndDate?: string;
  actualEndDate?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  assignedEngineerId?: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  assignedEngineer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  startDate?: string;
  endDate?: string;
  estimatedDuration: string;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  assignedTo?: string;
}

export default function ProjectDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<string>('excavacion');

  // Datos de ejemplo para las fases del proyecto
  const projectPhases: ProjectPhase[] = [
    {
      id: 'excavacion',
      name: 'Excavación',
      description: 'Preparación del terreno y excavación de cimientos',
      icon: '⛏️',
      color: 'bg-orange-500',
      progress: 75,
      status: 'in_progress',
      startDate: '2024-01-15',
      estimatedDuration: '2 semanas',
      tasks: [
        { id: '1', name: 'Marcado del terreno', description: 'Delimitación del área de trabajo', completed: true },
        { id: '2', name: 'Excavación principal', description: 'Excavación para cimientos', completed: true },
        { id: '3', name: 'Nivelación', description: 'Nivelación del terreno excavado', completed: false, dueDate: '2024-02-01' },
        { id: '4', name: 'Compactación', description: 'Compactación del suelo', completed: false, dueDate: '2024-02-03' }
      ]
    },
    {
      id: 'demolicion',
      name: 'Demolición',
      description: 'Demolición de estructuras existentes',
      icon: '🔨',
      color: 'bg-red-500',
      progress: 100,
      status: 'completed',
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      estimatedDuration: '1 semana',
      tasks: [
        { id: '5', name: 'Desmantelamiento', description: 'Retiro de estructuras menores', completed: true },
        { id: '6', name: 'Demolición principal', description: 'Demolición de estructuras principales', completed: true },
        { id: '7', name: 'Limpieza de escombros', description: 'Retiro y disposición de escombros', completed: true }
      ]
    },
    {
      id: 'construccion',
      name: 'Construcción',
      description: 'Construcción de la estructura principal',
      icon: '🏗️',
      color: 'bg-blue-500',
      progress: 30,
      status: 'pending',
      estimatedDuration: '8 semanas',
      tasks: [
        { id: '8', name: 'Cimentación', description: 'Construcción de cimientos', completed: false, dueDate: '2024-02-15' },
        { id: '9', name: 'Estructura principal', description: 'Levantamiento de muros y columnas', completed: false, dueDate: '2024-03-01' },
        { id: '10', name: 'Techos', description: 'Construcción de techos', completed: false, dueDate: '2024-03-15' },
        { id: '11', name: 'Instalaciones', description: 'Instalaciones eléctricas y sanitarias', completed: false, dueDate: '2024-04-01' }
      ]
    },
    {
      id: 'acabados',
      name: 'Acabados',
      description: 'Terminaciones y acabados finales',
      icon: '🎨',
      color: 'bg-green-500',
      progress: 0,
      status: 'pending',
      estimatedDuration: '4 semanas',
      tasks: [
        { id: '12', name: 'Pintura', description: 'Pintura interior y exterior', completed: false, dueDate: '2024-04-15' },
        { id: '13', name: 'Pisos', description: 'Instalación de pisos', completed: false, dueDate: '2024-04-20' },
        { id: '14', name: 'Carpintería', description: 'Instalación de puertas y ventanas', completed: false, dueDate: '2024-04-25' },
        { id: '15', name: 'Limpieza final', description: 'Limpieza y entrega', completed: false, dueDate: '2024-05-01' }
      ]
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadProject();
  }, [isAuthenticated, router, projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        console.error('Error loading project');
        router.push('/admin'); // Redirigir si no se encuentra el proyecto
      }
    } catch (error) {
      console.error('Error loading project:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Proyecto no encontrado</h2>
            <p className="text-gray-600 mb-4">El proyecto que buscas no existe o no tienes permisos para verlo.</p>
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPhase = projectPhases.find(phase => phase.id === activePhase);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header del proyecto */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 font-medium mb-2 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-2">{project.address}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/proyecto/${project.id}/excavaciones`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Excavaciones
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500">Progreso General</div>
                <div className="text-2xl font-bold text-gray-900">{project.progress}%</div>
              </div>
            </div>
          </div>

          {/* Información del proyecto */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                <p className="text-lg font-medium text-gray-900">{project.clientName}</p>
                {project.clientEmail && (
                  <p className="text-sm text-gray-600">{project.clientEmail}</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Presupuesto</h3>
                <p className="text-lg font-medium text-gray-900">
                  ${project.totalBudget.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fecha de Inicio</h3>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación de fases */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {projectPhases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activePhase === phase.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <span className="text-lg">{phase.icon}</span>
                {phase.name}
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(phase.status)}`}>
                  {getStatusText(phase.status)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle de la fase activa */}
        {currentPhase && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de la fase */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${currentPhase.color} flex items-center justify-center text-white text-2xl`}>
                      {currentPhase.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentPhase.name}</h2>
                      <p className="text-gray-600">{currentPhase.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progreso</div>
                    <div className="text-2xl font-bold text-gray-900">{currentPhase.progress}%</div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progreso de la fase</span>
                    <span>{currentPhase.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${currentPhase.color}`}
                      style={{ width: `${currentPhase.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Información de fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Duración Estimada</h4>
                    <p className="text-gray-900">{currentPhase.estimatedDuration}</p>
                  </div>
                  {currentPhase.startDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Fecha de Inicio</h4>
                      <p className="text-gray-900">{new Date(currentPhase.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {currentPhase.endDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Fecha de Finalización</h4>
                      <p className="text-gray-900">{new Date(currentPhase.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de tareas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tareas de la Fase</h3>
                <div className="space-y-3">
                  {currentPhase.tasks.map((task) => (
                    <div key={task.id} className={`p-4 rounded-lg border ${task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            task.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {task.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h4 className={`font-medium ${task.completed ? 'text-green-900' : 'text-gray-900'}`}>
                              {task.name}
                            </h4>
                            <p className={`text-sm ${task.completed ? 'text-green-700' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          </div>
                        </div>
                        {task.dueDate && !task.completed && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Fecha límite</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección especial para Excavación */}
              {currentPhase.id === 'excavacion' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Información de Excavaciones</h3>
                    <button
                      onClick={() => router.push(`/proyecto/${project.id}/excavaciones`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Gestionar Excavaciones
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Agregar Datos</p>
                          <p className="text-xs text-blue-700">Registra información de excavación</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">Subir PDF</p>
                          <p className="text-xs text-green-700">Extracción automática (próximamente)</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-900">Ver Reportes</p>
                          <p className="text-xs text-purple-700">Historial y estadísticas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sidebar con resumen */}
              <div className="space-y-6">
                {/* Resumen de fases */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Fases</h3>
                  <div className="space-y-3">
                    {projectPhases.map((phase) => (
                      <div key={phase.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{phase.icon}</span>
                          <span className="text-sm font-medium text-gray-900">{phase.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{phase.progress}%</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(phase.status)}`}>
                            {getStatusText(phase.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fases Completadas</span>
                      <span className="text-sm font-medium text-gray-900">
                        {projectPhases.filter(p => p.status === 'completed').length} / {projectPhases.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tareas Completadas</span>
                      <span className="text-sm font-medium text-gray-900">
                        {projectPhases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.completed).length, 0)} / {projectPhases.reduce((acc, phase) => acc + phase.tasks.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Progreso Total</span>
                      <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
