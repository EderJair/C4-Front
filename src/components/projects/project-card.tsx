import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  address: string;
  clientName: string;
  status: string;
  totalBudget: string;
  phases?: any[];
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planificado':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Link href={`/proyecto/${project.id}`} className="block">
      <div className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.address}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-600">Cliente</p>
            <p className="font-medium text-black">{project.clientName}</p>
          </div>
          <div>
            <p className="text-gray-600">Presupuesto</p>
            <p className="font-medium text-black">${project.totalBudget}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <span className="text-blue-600 text-sm font-medium">
              Ver Detalles
            </span>
            <span className="text-green-600 text-sm font-medium">
              Gestionar Fases
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Progreso general</p>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
