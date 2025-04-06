import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
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

    const results = sortedProjects.map(project => ({
      id: project.id,
      name: project.name,
      teamName: project.teamName,
      imageUrl: project.imageUrl,
      voteCount: project._count.votes
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { message: 'Failed to fetch results', error: error.message },
      { status: 500 }
    );
  }
}
