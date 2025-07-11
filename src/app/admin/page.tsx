'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/navbar';
import WelcomeHeader from '@/components/dashboard/welcome-header';
import AdminStatsGrid from '@/components/dashboard/admin-stats-grid';
import AdminProjectsList from '@/components/projects/admin-projects-list';
import CreateProjectModal from '@/components/modals/create-project-modal';
import type { CreateProjectData } from '@/components/modals/create-project-modal';
import api from '@/lib/api';

interface Project {
  id: number;
  name: string;
  address: string;
  clientName: string;
  status: string;
  totalBudget: string;
  assignedEngineer?: {
    firstName: string;
    lastName: string;
  };
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    loadProjects();
  }, [isAuthenticated, router, user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projects = await api.getProjects();
      setProjects(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProjectSuccess = () => {
    loadProjects();
    setIsModalOpen(false);
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
        <WelcomeHeader 
          firstName={user.firstName}
          description={`${user.role === 'admin' ? 'Panel de administración' : 'Panel de ingeniero'} - ${user.companyName || 'C4 Construction'}`}
        />

        <AdminStatsGrid 
          projectsCount={projects.length}
          userRole={user.role}
        />

        {/* Sección de acciones rápidas - Solo para administradores */}
        {user.role === 'admin' && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/admin/ingenieros')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.25" />
                  </svg>
                  Mis Ingenieros
                </button>
                
                <button
                  onClick={() => router.push('/admin/reportes')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Reportes
                </button>
              </div>
            </div>
          </div>
        )}

        <AdminProjectsList 
          projects={projects}
          loading={loading}
          title={user.role === 'admin' ? 'Todos los Proyectos' : 'Mis Proyectos Asignados'}
          onCreateProject={() => setIsModalOpen(true)}
          showCreateButton={user.role === 'admin'}
        />
      </main>

      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateProjectSuccess}
        userId={user?.id || 0}
      />
    </div>
  );
}