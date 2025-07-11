import AdminProjectCard from './admin-project-card';

interface AdminProject {
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

interface AdminProjectsListProps {
  projects: AdminProject[];
  loading: boolean;
  title: string;
  onCreateProject: () => void;
  showCreateButton?: boolean;
}

export default function AdminProjectsList({ 
  projects, 
  loading, 
  title, 
  onCreateProject, 
  showCreateButton = true 
}: AdminProjectsListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
          </span>
          {showCreateButton && (
            <button
              onClick={onCreateProject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Proyecto
            </button>
          )}
        </div>
      </div>
      
      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <AdminProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 mt-2">No hay proyectos disponibles</p>
        </div>
      )}
    </div>
  );
}
