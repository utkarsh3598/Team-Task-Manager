import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    let totalProjects = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let recentTasks: any[] = [];

    if (role === 'ADMIN') {
      // Fetch stats for all projects and tasks
      totalProjects = await prisma.project.count();
      
      totalTasks = await prisma.task.count();
      
      completedTasks = await prisma.task.count({
        where: { status: 'DONE' },
      });
      
      inProgressTasks = await prisma.task.count({
        where: { status: 'IN_PROGRESS' },
      });
      
      pendingTasks = await prisma.task.count({
        where: { status: 'TODO' },
      });

      overdueTasks = await prisma.task.count({
        where: {
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      });

      recentTasks = await prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });
    } else {
      // Fetch stats specific to this member
      totalProjects = await prisma.project.count({
        where: {
          members: {
            some: { id: userId },
          },
        },
      });

      totalTasks = await prisma.task.count({
        where: { assigneeId: userId },
      });

      completedTasks = await prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'DONE',
        },
      });

      inProgressTasks = await prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'IN_PROGRESS',
        },
      });

      pendingTasks = await prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'TODO',
        },
      });

      overdueTasks = await prisma.task.count({
        where: {
          assigneeId: userId,
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      });

      recentTasks = await prisma.task.findMany({
        where: { assigneeId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });
    }

    return NextResponse.json(
      {
        metrics: {
          totalProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          overdueTasks,
        },
        recentTasks,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch dashboard data error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching dashboard metrics' },
      { status: 500 }
    );
  }
}
