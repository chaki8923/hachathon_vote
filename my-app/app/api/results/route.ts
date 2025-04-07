import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

type Project = {
  id: string;
  name: string;
  teamName: string;
  imageUrl: string | null;
  votes: {
    planningScore: number;
    technicalScore: number;
    uiUxScore: number;
    processScore: number;
    aiUtilizationScore: number;
  }[];
  _count: {
    votes: number;
  };
};

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        votes: {
          select: {
            planningScore: true,
            technicalScore: true,
            uiUxScore: true,
            processScore: true,
            aiUtilizationScore: true,
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    const results = projects.map((project: Project) => {
      const voteCount = project._count.votes;
      
      let planningScore = 0;
      let technicalScore = 0;
      let uiUxScore = 0;
      let processScore = 0;
      let aiUtilizationScore = 0;
      
      if (voteCount > 0) {
        project.votes.forEach(vote => {
          planningScore += vote.planningScore;
          technicalScore += vote.technicalScore;
          uiUxScore += vote.uiUxScore;
          processScore += vote.processScore;
          aiUtilizationScore += vote.aiUtilizationScore;
        });
        
        planningScore = planningScore / voteCount;
        technicalScore = technicalScore / voteCount;
        uiUxScore = uiUxScore / voteCount;
        processScore = processScore / voteCount;
        aiUtilizationScore = aiUtilizationScore / voteCount;
      }
      
      const totalScore = planningScore + technicalScore + uiUxScore + processScore + aiUtilizationScore;
      
      return {
        id: project.id,
        name: project.name,
        teamName: project.teamName,
        imageUrl: project.imageUrl,
        voteCount,
        planningScore,
        technicalScore,
        uiUxScore,
        processScore,
        aiUtilizationScore,
        totalScore
      };
    });
    
    type ProjectResult = {
      id: string;
      name: string;
      teamName: string;
      imageUrl: string | null;
      voteCount: number;
      planningScore: number;
      technicalScore: number;
      uiUxScore: number;
      processScore: number;
      aiUtilizationScore: number;
      totalScore: number;
    };
    
    const sortedResults = results.sort((a: ProjectResult, b: ProjectResult) => b.totalScore - a.totalScore);

    return NextResponse.json(sortedResults);
  } catch (error: unknown) {
    console.error('Error fetching results:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to fetch results', error: errorMessage },
      { status: 500 }
    );
  }
}
