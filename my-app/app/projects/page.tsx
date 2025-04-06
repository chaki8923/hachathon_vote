import { prisma } from '../../lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Hackathon Projects</h1>
      
      {projects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 dark:text-gray-400">No projects available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/projects/${project.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                {project.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt={project.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-300 dark:bg-gray-600">
                    <span className="text-gray-500 dark:text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Team: {project.teamName}</p>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{project.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
