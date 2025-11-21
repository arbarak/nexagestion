import { NextRequest, NextResponse } from 'next/server';
import { collaborationService } from '@/lib/collaboration-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const projectSchema = z.object({
  projectCode: z.string(),
  projectName: z.string(),
  projectDescription: z.string(),
  teamMembers: z.array(z.string()),
});

const taskSchema = z.object({
  projectId: z.string(),
  taskCode: z.string(),
  taskName: z.string(),
  taskDescription: z.string(),
  assignedTo: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

const commentSchema = z.object({
  taskId: z.string(),
  commentCode: z.string(),
  commentText: z.string(),
  author: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await collaborationService.getCollaborationMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching collaboration data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaboration data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-project') {
      const body = await request.json();
      const { projectCode, projectName, projectDescription, teamMembers } = projectSchema.parse(body);

      const project = await collaborationService.createProject(
        session.companyId,
        projectCode,
        projectName,
        projectDescription,
        teamMembers
      );

      return NextResponse.json(project, { status: 201 });
    } else if (action === 'create-task') {
      const body = await request.json();
      const { projectId, taskCode, taskName, taskDescription, assignedTo, priority } =
        taskSchema.parse(body);

      const task = await collaborationService.createTask(
        projectId,
        taskCode,
        taskName,
        taskDescription,
        assignedTo,
        priority
      );

      return NextResponse.json(task, { status: 201 });
    } else if (action === 'add-comment') {
      const body = await request.json();
      const { taskId, commentCode, commentText, author } = commentSchema.parse(body);

      const comment = await collaborationService.addComment(taskId, commentCode, commentText, author);

      return NextResponse.json(comment, { status: 201 });
    } else if (action === 'complete-task') {
      const body = await request.json();
      const { taskId } = z.object({ taskId: z.string() }).parse(body);

      const task = await collaborationService.completeTask(taskId);
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      return NextResponse.json(task);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing collaboration action:', error);
    return NextResponse.json(
      { error: 'Failed to process collaboration action' },
      { status: 500 }
    );
  }
}


