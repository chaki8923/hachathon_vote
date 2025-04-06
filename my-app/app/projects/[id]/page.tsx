import { prisma } from '../../../lib/prisma';
import { supabase } from '../../../lib/supabase';
import VoteButton from '../../components/projects/VoteButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });
    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

async function getVotingPeriod() {
  try {
    const votingPeriod = await prisma.votingPeriod.findFirst({
      where: { isActive: true },
    });
    return votingPeriod;
  } catch (error) {
    console.error('Error fetching voting period:', error);
    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  const votingPeriod = await getVotingPeriod();
  
  if (!project) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p className="mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Link 
          href="/projects"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const now = new Date();
  const votingActive = votingPeriod && 
    new Date(votingPeriod.startTime) <= now && 
    new Date(votingPeriod.endTime) >= now;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/projects"
          className="text-blue-600 hover:underline flex items-center"
        >
          ← Back to Projects
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        {project.imageUrl && (
          <div className="h-64 md:h-80 bg-gray-200 dark:bg-gray-700">
            <img 
              src={project.imageUrl} 
              alt={project.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {votingActive && <VoteButton projectId={project.id} />}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Team</h2>
            <p className="text-gray-700 dark:text-gray-300">{project.teamName}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{project.description}</p>
          </div>
          
          {project.appealPoint && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Appeal Points</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{project.appealPoint}</p>
            </div>
          )}
          
          {project.demoUrl && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Demo</h2>
              <a 
                href={project.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Demo
              </a>
            </div>
          )}
          
          {!votingActive && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200">
                {!votingPeriod 
                  ? "Voting period has not been set up yet." 
                  : now < new Date(votingPeriod.startTime)
                    ? `Voting will start on ${new Date(votingPeriod.startTime).toLocaleString()}.`
                    : `Voting has ended on ${new Date(votingPeriod.endTime).toLocaleString()}.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
