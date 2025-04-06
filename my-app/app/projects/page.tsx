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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">ハッカソンプロジェクト</h1>
        
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-xl">
            <p className="text-xl text-gray-300">まだプロジェクトはありません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/projects/${project.id}`}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-cyan-400/20 transition-all transform hover:scale-105 hover:bg-white/15"
              >
                <div className="h-48 bg-gray-800 relative">
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      alt={project.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-r from-gray-700 to-gray-800">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  
                  <div className="absolute top-0 right-0 bg-cyan-500 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
                    投票する
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                  <p className="text-sm text-gray-300 mb-2">Team: {project.teamName}</p>
                  <p className="text-gray-400 line-clamp-3">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
