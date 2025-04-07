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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-800 text-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            href="/projects"
            className="text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
          >
            ← プロジェクト一覧に戻る
          </Link>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
          {project.imageUrl && (
            <div className="h-64 md:h-80 bg-gray-800">
              <img 
                src={project.imageUrl} 
                alt={project.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">{project.name}</h1>
              {votingActive && <VoteButton projectId={project.id} />}
            </div>
            
            <div className="mb-6 bg-white/5 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-cyan-400">チーム</h2>
              <p className="text-gray-300">{project.teamName}</p>
            </div>
            
            <div className="mb-6 bg-white/5 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-cyan-400">説明</h2>
              <p className="text-gray-300 whitespace-pre-line">{project.description}</p>
            </div>
            
            {project.appealPoint && (
              <div className="mb-6 bg-white/5 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-cyan-400">アピールポイント</h2>
                <p className="text-gray-300 whitespace-pre-line">{project.appealPoint}</p>
              </div>
            )}
            
            {project.demoUrl && (
              <div className="mb-6 bg-white/5 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-cyan-400">デモ</h2>
                <a 
                  href={project.demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  デモを見る
                </a>
              </div>
            )}
            
            {!votingActive && (
              <div className="mt-6 p-4 bg-yellow-900/30 backdrop-blur-sm rounded-lg border border-yellow-600/50">
                <p className="text-yellow-400">
                  {!votingPeriod 
                    ? "投票期間はまだ設定されていません。" 
                    : now < new Date(votingPeriod.startTime)
                      ? `投票は ${new Date(votingPeriod.startTime).toLocaleString()} から始まります。`
                      : `投票は ${new Date(votingPeriod.endTime).toLocaleString()} に終了しました。`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
