import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { TaskStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');
    const taskId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Authorization check: Admins can update any task; Members can only update tasks assigned to them
    if (role !== 'ADMIN' && task.assigneeId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update status for tasks assigned to you' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status field is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!validStatuses.includes(status as TaskStatus)) {
      return NextResponse.json(
        { error: 'Invalid task status. Must be TODO, IN_PROGRESS, or DONE' },
        { status: 400 }
      );
    }

    // Update the task status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: status as TaskStatus,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: any) {
    console.error('Update task status error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating task status' },
      { status: 500 }
    );
  }
}
