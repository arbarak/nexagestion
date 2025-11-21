import { NextRequest, NextResponse } from 'next/server';
import { translationManagementService } from '@/lib/translation-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string(),
  sourceLanguage: z.string(),
  targetLanguages: z.array(z.string()),
  description: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['draft', 'in-progress', 'review', 'completed']),
});

const completionSchema = z.object({
  language: z.string(),
  percentage: z.number().min(0).max(100),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const projects = await translationManagementService.getProjects(
      session.companyId,
      status || undefined
    );

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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

    const body = await request.json();
    const { name, sourceLanguage, targetLanguages, description } = projectSchema.parse(body);

    const project = await translationManagementService.createProject(
      session.companyId,
      name,
      sourceLanguage,
      targetLanguages,
      description
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    const action = searchParams.get('action');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (action === 'status') {
      const { status } = statusSchema.parse(body);
      const project = await translationManagementService.updateProjectStatus(
        session.companyId,
        projectId,
        status
      );

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(project);
    } else if (action === 'completion') {
      const { language, percentage } = completionSchema.parse(body);
      const project = await translationManagementService.updateCompletionPercentage(
        session.companyId,
        projectId,
        language,
        percentage
      );

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(project);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await translationManagementService.deleteProject(session.companyId, projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}


