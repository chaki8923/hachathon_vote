import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

type Project = {
  id: string;
  name: string;
  teamName: string;
  imageUrl: string | null;
  _count: {
    votes: number;
  };
};

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    const sortedProjects = projects.sort((a: Project, b: Project) => {
      return b._count.votes - a._count.votes;
    });

    const results = sortedProjects.map((project: Project) => ({
      id: project.id,
      name: project.name,
      teamName: project.teamName,
      imageUrl: project.imageUrl,
      voteCount: project._count.votes
    }));

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error('Error fetching results:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to fetch results', error: errorMessage },
      { status: 500 }
    );
  }
}
