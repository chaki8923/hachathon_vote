import { prisma } from '../../lib/prisma';
import ResultsDisplay from '../components/results/ResultsDisplay';

export const dynamic = 'force-dynamic';

async function getResults() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    const sortedProjects = projects.sort((a, b) => {
      return b._count.votes - a._count.votes;
    });

    return sortedProjects.map(project => ({
      id: project.id,
      name: project.name,
      teamName: project.teamName,
      imageUrl: project.imageUrl,
      voteCount: project._count.votes
    }));
  } catch (error) {
    console.error('Error fetching results:', error);
    return [];
  }
}

async function getVotingPeriod() {
  try {
    return await prisma.votingPeriod.findFirst({
      where: { isActive: true },
    });
  } catch (error) {
    console.error('Error fetching voting period:', error);
    return null;
  }
}

export default async function ResultsPage() {
  const results = await getResults();
  const votingPeriod = await getVotingPeriod();
  
  const now = new Date();
  const votingActive = votingPeriod && 
    new Date(votingPeriod.startTime) <= now && 
    new Date(votingPeriod.endTime) >= now;
  
  const votingEnded = votingPeriod && now > new Date(votingPeriod.endTime);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Hackathon Results</h1>
      
      {votingPeriod ? (
        <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
          {votingActive 
            ? `Voting is active until ${new Date(votingPeriod.endTime).toLocaleString()}`
            : votingEnded
              ? `Voting ended on ${new Date(votingPeriod.endTime).toLocaleString()}`
              : `Voting will start on ${new Date(votingPeriod.startTime).toLocaleString()}`
          }
        </p>
      ) : (
        <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
          No voting period has been set up yet
        </p>
      )}
      
      <ResultsDisplay initialResults={results} />
    </div>
  );
}
