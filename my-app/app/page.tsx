import Image from "next/image";
import Link from "next/link";
import { prisma } from "../lib/prisma";

export const dynamic = 'force-dynamic';

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        name: 'asc',
      },
      take: 3, // Only get 3 projects for the homepage preview
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
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

export default async function Home() {
  const projects = await getProjects();
  const votingPeriod = await getVotingPeriod();
  
  const now = new Date();
  const votingActive = votingPeriod && 
    new Date(votingPeriod.startTime) <= now && 
    new Date(votingPeriod.endTime) >= now;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            ハッカソン投票プラットフォーム
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            革新的なプロジェクトに投票して、次世代のテクノロジーをサポートしよう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/projects" 
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-400/40"
            >
              プロジェクト一覧を見る
            </Link>
            {votingActive ? (
              <Link 
                href="/auth" 
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-full text-white font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-400/40"
              >
                投票する
              </Link>
            ) : (
              <button 
                className="px-6 py-3 bg-gray-500 rounded-full text-white font-semibold cursor-not-allowed opacity-70"
                disabled
              >
                {!votingPeriod 
                  ? "投票期間は設定されていません" 
                  : now < new Date(votingPeriod.startTime)
                    ? "投票はまだ始まっていません"
                    : "投票期間は終了しました"}
              </button>
            )}
          </div>
        </div>
        
        {/* Featured Projects */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">注目のプロジェクト</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-10 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-xl text-gray-300">まだプロジェクトがありません。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    <p className="text-sm text-gray-300 mb-2">Team: {project.teamName}</p>
                    <p className="text-gray-400 line-clamp-3">{project.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link 
              href="/projects" 
              className="inline-block px-6 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 rounded-full transition-colors"
            >
              すべてのプロジェクトを見る →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
