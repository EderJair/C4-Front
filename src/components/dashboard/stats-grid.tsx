import StatsCard from './stats-card';

interface StatsGridProps {
  projectsCount: number;
  inProgressCount?: number;
  completedCount?: number;
}

export default function StatsGrid({ 
  projectsCount, 
  inProgressCount = 1, 
  completedCount = 0 
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Mis Proyectos"
        value={projectsCount}
        bgColor="bg-blue-100"
        iconColor="text-blue-600"
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />

      <StatsCard
        title="En Progreso"
        value={inProgressCount}
        bgColor="bg-yellow-100"
        iconColor="text-yellow-600"
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />

      <StatsCard
        title="Completados"
        value={completedCount}
        bgColor="bg-green-100"
        iconColor="text-green-600"
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
}
