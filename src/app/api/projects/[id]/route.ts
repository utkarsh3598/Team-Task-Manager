import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');
    const projectId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        members: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Authorization check: Admins can see any project; Members must be a member
    const isMember = project.members.some((m) => m.id === userId);
    if (role !== 'ADMIN' && !isMember) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this project' },
        { status: 403 }
      );
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error('Fetch project details error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching project details' },
      { status: 500 }
    );
  }
}
