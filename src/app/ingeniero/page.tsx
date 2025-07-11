'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/navbar';
import WelcomeHeader from '@/components/dashboard/welcome-header';
import StatsGrid from '@/components/dashboard/stats-grid';
import ProjectsList from '@/components/projects/projects-list';
import api from '@/lib/api';

interface Project {
  id: number;
  name: string;
  address: string;
  clientName: string;
  status: string;
  totalBudget: string;
  phases?: any[];
}

export default function IngenieeroDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'ingeniero') {
      router.push('/admin');
      return;
    }

    loadMyProjects();
  }, [isAuthenticated, router, user]);

  const loadMyProjects = async () => {
    try {
      setLoading(true);
      // Proyectos del ingeniero logueado
      const projects = await api.getProjects(); // Después filtraremos por ingeniero
      setProjects(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
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
          description="Gestiona tus proyectos asignados y supervisa el progreso de las obras"
        />

        <StatsGrid projectsCount={projects.length} />

        <ProjectsList 
          projects={projects}
          loading={loading}
          title="Mis Proyectos Asignados"
        />
      </main>
    </div>
  );
}