import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSupabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(projects);
  } catch (error: unknown) {
    console.error('Error fetching projects:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to fetch projects', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { message: 'Authentication service unavailable' },
        { status: 503 }
      );
    }
    
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
    
    if (!data.name || !data.teamName || !data.description) {
      return NextResponse.json(
        { message: 'Name, team name, and description are required' },
        { status: 400 }
      );
    }
    
    const project = await prisma.project.create({
      data: {
        name: data.name,
        teamName: data.teamName,
        description: data.description,
        appealPoint: data.appealPoint || null,
        demoUrl: data.demoUrl || null,
        imageUrl: data.imageUrl || null,
      },
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to create project', error: errorMessage },
      { status: 500 }
    );
  }
}
