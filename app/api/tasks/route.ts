import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'completed']).default('todo'),
  relatedEntity: z.object({
    type: z.string(),
    id: z.string(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    const tasks = await prisma.task.findMany({
      where: {
        companyId: session.companyId,
        ...(status && { status }),
        ...(assignedTo && { assignedTo }),
      },
      include: { assignee: true },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, assignedTo, priority, dueDate, status, relatedEntity } = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedTo,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
        relatedEntity: relatedEntity || null,
        companyId: session.companyId,
        createdBy: session.userId,
      },
      include: { assignee: true },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}


