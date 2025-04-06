import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = sessionData.session.user.id;
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    const votingPeriod = await prisma.votingPeriod.findFirst({
      where: { isActive: true },
    });

    if (!votingPeriod) {
      return NextResponse.json(
        { message: 'No active voting period' },
        { status: 403 }
      );
    }

    const now = new Date();
    if (now < votingPeriod.startTime || now > votingPeriod.endTime) {
      return NextResponse.json(
        { message: 'Voting is not currently active' },
        { status: 403 }
      );
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        projectId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { message: 'You have already voted for this project' },
        { status: 400 }
      );
    }

    const vote = await prisma.vote.create({
      data: {
        userId,
        projectId,
      },
    });

    return NextResponse.json({ vote }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating vote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to create vote', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = sessionData.session.user.id;
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    const votingPeriod = await prisma.votingPeriod.findFirst({
      where: { isActive: true },
    });

    if (!votingPeriod) {
      return NextResponse.json(
        { message: 'No active voting period' },
        { status: 403 }
      );
    }

    const now = new Date();
    if (now < votingPeriod.startTime || now > votingPeriod.endTime) {
      return NextResponse.json(
        { message: 'Voting is not currently active' },
        { status: 403 }
      );
    }

    await prisma.vote.deleteMany({
      where: {
        userId,
        projectId,
      },
    });

    return NextResponse.json({ message: 'Vote removed successfully' });
  } catch (error: unknown) {
    console.error('Error removing vote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to remove vote', error: errorMessage },
      { status: 500 }
    );
  }
}
