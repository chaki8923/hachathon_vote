import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const votingPeriod = await prisma.votingPeriod.findFirst({
      where: { isActive: true },
    });
    
    return NextResponse.json(votingPeriod);
  } catch (error: any) {
    console.error('Error fetching voting period:', error);
    return NextResponse.json(
      { message: 'Failed to fetch voting period', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    await prisma.votingPeriod.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    
    const votingPeriod = await prisma.votingPeriod.create({
      data: {
        startTime,
        endTime,
        isActive: true,
      },
    });
    
    return NextResponse.json(votingPeriod, { status: 201 });
  } catch (error: any) {
    console.error('Error creating voting period:', error);
    return NextResponse.json(
      { message: 'Failed to create voting period', error: error.message },
      { status: 500 }
    );
  }
}
