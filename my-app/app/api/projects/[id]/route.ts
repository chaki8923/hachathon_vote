import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { supabase } from '../../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error: unknown) {
    console.error('Error fetching project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to fetch project', error: errorMessage },
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
    
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    if (!data.name || !data.teamName || !data.description) {
      return NextResponse.json(
        { message: 'Name, team name, and description are required' },
        { status: 400 }
      );
    }
    
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: data.name,
        teamName: data.teamName,
        description: data.description,
        appealPoint: data.appealPoint || null,
        demoUrl: data.demoUrl || null,
        imageUrl: data.imageUrl || null,
      },
    });
    
    return NextResponse.json(updatedProject);
  } catch (error: unknown) {
    console.error('Error updating project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to update project', error: errorMessage },
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
    
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });
    
    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    await prisma.vote.deleteMany({
      where: { projectId: params.id },
    });
    
    await prisma.project.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to delete project', error: errorMessage },
      { status: 500 }
    );
  }
}
