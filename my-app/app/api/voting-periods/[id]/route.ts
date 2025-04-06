import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { supabase } from '../../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const votingPeriod = await prisma.votingPeriod.findUnique({
      where: { id: params.id },
    });
    
    if (!votingPeriod) {
      return NextResponse.json(
        { message: 'Voting period not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(votingPeriod);
  } catch (error: any) {
    console.error('Error fetching voting period:', error);
    return NextResponse.json(
      { message: 'Failed to fetch voting period', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const isAdmin = sessionData.session.user.email?.includes('admin') || false;
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const existingVotingPeriod = await prisma.votingPeriod.findUnique({
      where: { id: params.id },
    });
    
    if (!existingVotingPeriod) {
      return NextResponse.json(
        { message: 'Voting period not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    if (!data.startTime || !data.endTime) {
      return NextResponse.json(
        { message: 'Start time and end time are required' },
        { status: 400 }
      );
    }
    
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (startTime >= endTime) {
      return NextResponse.json(
        { message: 'End time must be after start time' },
        { status: 400 }
      );
    }
    
    if (data.isActive) {
      await prisma.votingPeriod.updateMany({
        where: { 
          id: { not: params.id },
          isActive: true 
        },
        data: { isActive: false },
      });
    }
    
    const updatedVotingPeriod = await prisma.votingPeriod.update({
      where: { id: params.id },
      data: {
        startTime,
        endTime,
        isActive: data.isActive ?? existingVotingPeriod.isActive,
      },
    });
    
    return NextResponse.json(updatedVotingPeriod);
  } catch (error: any) {
    console.error('Error updating voting period:', error);
    return NextResponse.json(
      { message: 'Failed to update voting period', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const isAdmin = sessionData.session.user.email?.includes('admin') || false;
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const existingVotingPeriod = await prisma.votingPeriod.findUnique({
      where: { id: params.id },
    });
    
    if (!existingVotingPeriod) {
      return NextResponse.json(
        { message: 'Voting period not found' },
        { status: 404 }
      );
    }
    
    await prisma.votingPeriod.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Voting period deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting voting period:', error);
    return NextResponse.json(
      { message: 'Failed to delete voting period', error: error.message },
      { status: 500 }
    );
  }
}
