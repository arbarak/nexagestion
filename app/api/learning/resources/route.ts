import { NextRequest, NextResponse } from 'next/server';
import { learningResourcesService } from '@/lib/learning-resources-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const resourceSchema = z.object({
  resourceCode: z.string(),
  resourceName: z.string(),
  resourceType: z.enum(['video', 'document', 'course', 'webinar', 'tutorial']),
  description: z.string(),
  url: z.string(),
  author: z.string(),
});

const pathSchema = z.object({
  pathCode: z.string(),
  pathName: z.string(),
  description: z.string(),
  resourceIds: z.array(z.string()),
  targetAudience: z.string(),
});

const enrollSchema = z.object({
  userId: z.string(),
  resourceId: z.string(),
  learningCode: z.string(),
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
      const metrics = await learningResourcesService.getLearningMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching learning data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning data' },
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

    if (action === 'create-resource') {
      const body = await request.json();
      const { resourceCode, resourceName, resourceType, description, url, author } =
        resourceSchema.parse(body);

      const resource = await learningResourcesService.createResource(
        session.companyId,
        resourceCode,
        resourceName,
        resourceType,
        description,
        url,
        author
      );

      return NextResponse.json(resource, { status: 201 });
    } else if (action === 'create-path') {
      const body = await request.json();
      const { pathCode, pathName, description, resourceIds, targetAudience } = pathSchema.parse(body);

      const path = await learningResourcesService.createPath(
        session.companyId,
        pathCode,
        pathName,
        description,
        resourceIds,
        targetAudience
      );

      return NextResponse.json(path, { status: 201 });
    } else if (action === 'enroll-user') {
      const body = await request.json();
      const { userId, resourceId, learningCode } = enrollSchema.parse(body);

      const userLearning = await learningResourcesService.enrollUserInResource(
        userId,
        resourceId,
        learningCode
      );

      return NextResponse.json(userLearning, { status: 201 });
    } else if (action === 'complete-learning') {
      const body = await request.json();
      const { learningId } = z.object({ learningId: z.string() }).parse(body);

      const learning = await learningResourcesService.completeUserLearning(learningId);
      if (!learning) {
        return NextResponse.json({ error: 'Learning not found' }, { status: 404 });
      }

      return NextResponse.json(learning);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing learning action:', error);
    return NextResponse.json(
      { error: 'Failed to process learning action' },
      { status: 500 }
    );
  }
}


