import { NextRequest, NextResponse } from 'next/server';
import { projectManagementService } from '@/lib/project-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const projectSchema = z.object({
  projectCode: z.string(),
  projectName: z.string(),
  description: z.string(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  budget: z.number(),
  manager: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

const taskSchema = z.object({
  projectId: z.string(),
  taskCode: z.string(),
  taskName: z.string(),
  description: z.string(),
  assignedTo: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.string().transform((s) => new Date(s)),
  dueDate: z.string().transform((s) => new Date(s)),
});

const milestoneSchema = z.object({
  projectId: z.string(),
  milestoneCode: z.string(),
  milestoneName: z.string(),
  description: z.string(),
  targetDate: z.string().transform((s) => new Date(s)),
  deliverables: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'projects') {
      const status = searchParams.get('status');
      const projects = await projectManagementService.getProjects(
        session.companyId,
        status || undefined
      );
      return NextResponse.json(projects);
    } else if (action === 'tasks') {
      const projectId = searchParams.get('projectId');
      const tasks = await projectManagementService.getProjectTasks(projectId || undefined);
      return NextResponse.json(tasks);
    } else if (action === 'metrics') {
      const metrics = await projectManagementService.getProjectMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching project data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project data' },
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
      const { projectCode, projectName, description, startDate, endDate, budget, manager, priority } =
        projectSchema.parse(body);

      const project = await projectManagementService.createProject(
        session.companyId,
        projectCode,
        projectName,
        description,
        startDate,
        endDate,
        budget,
        manager,
        priority
      );

      return NextResponse.json(project, { status: 201 });
    } else if (action === 'create-task') {
      const body = await request.json();
      const { projectId, taskCode, taskName, description, assignedTo, priority, startDate, dueDate } =
        taskSchema.parse(body);

      const task = await projectManagementService.createTask(
        projectId,
        taskCode,
        taskName,
        description,
        assignedTo,
        priority,
        startDate,
        dueDate
      );

      return NextResponse.json(task, { status: 201 });
    } else if (action === 'update-task-progress') {
      const body = await request.json();
      const { taskId, completionPercentage } = z
        .object({ taskId: z.string(), completionPercentage: z.number() })
        .parse(body);

      const task = await projectManagementService.updateTaskProgress(taskId, completionPercentage);
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      return NextResponse.json(task);
    } else if (action === 'create-milestone') {
      const body = await request.json();
      const { projectId, milestoneCode, milestoneName, description, targetDate, deliverables } =
        milestoneSchema.parse(body);

      const milestone = await projectManagementService.createMilestone(
        projectId,
        milestoneCode,
        milestoneName,
        description,
        targetDate,
        deliverables
      );

      return NextResponse.json(milestone, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing project action:', error);
    return NextResponse.json(
      { error: 'Failed to process project action' },
      { status: 500 }
    );
  }
}


