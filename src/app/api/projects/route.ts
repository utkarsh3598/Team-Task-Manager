import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/projects - Fetch projects for the authenticated user
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let projects;

    if (role === 'ADMIN') {
      // Admins can see all projects in the system
      projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          members: {
            select: { id: true, name: true, email: true, role: true },
          },
          tasks: true,
        },
      });
    } else {
      // Members can only see projects they are added to
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { id: userId },
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          members: {
            select: { id: true, name: true, email: true, role: true },
          },
          tasks: true,
        },
      });
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    console.error('Fetch projects error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project (Admin only, verified by middleware)
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, members = [] } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Prepare connection array for members
    // Ensure the creator is also included in the project members automatically
    const uniqueMembers = Array.from(new Set([...members, userId]));
    const memberConnections = uniqueMembers.map((memberId: string) => ({ id: memberId }));

    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        createdById: userId,
        members: {
          connect: memberConnections,
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        members: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the project' },
      { status: 500 }
    );
  }
}
