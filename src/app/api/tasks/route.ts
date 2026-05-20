import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { TaskStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only ADMIN can create tasks
    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description = '', status = 'TODO', dueDate, projectId, assigneeId } = body;

    // Validate required fields
    if (!title || !dueDate || !projectId || !assigneeId) {
      return NextResponse.json(
        { error: 'Title, due date, project ID, and assignee ID are required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          select: { id: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify assignee is a member of the project
    const isAssigneeMember = project.members.some((member) => member.id === assigneeId);
    if (!isAssigneeMember) {
      return NextResponse.json(
        { error: 'Assignee must be a member of the project' },
        { status: 400 }
      );
    }

    // Validate task status
    const validStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!validStatuses.includes(status as TaskStatus)) {
      return NextResponse.json(
        { error: 'Invalid task status. Must be TODO, IN_PROGRESS, or DONE' },
        { status: 400 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status as TaskStatus,
        dueDate: new Date(dueDate),
        projectId,
        assigneeId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, role: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the task' },
      { status: 500 }
    );
  }
}
