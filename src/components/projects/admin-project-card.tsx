import Link from 'next/link';

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

interface AdminProjectCardProps {
  project: AdminProject;
}

export default function AdminProjectCard({ project }: AdminProjectCardProps) {
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
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.address}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Cliente</p>
          <p className="font-medium">{project.clientName}</p>
        </div>
        <div>
          <p className="text-gray-600">Ingeniero</p>
          <p className="font-medium">
            {project.assignedEngineer 
              ? `${project.assignedEngineer.firstName} ${project.assignedEngineer.lastName}`
              : 'Sin asignar'
            }
          </p>
        </div>
        <div>
          <p className="text-gray-600">Presupuesto</p>
          <p className="font-medium">${project.totalBudget}</p>
        </div>
      </div>
    </div>
    </Link>
  );
}
