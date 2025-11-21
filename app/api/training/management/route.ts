import { NextRequest, NextResponse } from 'next/server';
import { trainingManagementService } from '@/lib/training-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const programSchema = z.object({
  programCode: z.string(),
  programName: z.string(),
  description: z.string(),
  category: z.string(),
  duration: z.number(),
  maxParticipants: z.number(),
  startDate: z.string(),
  endDate: z.string(),
});

const sessionSchema = z.object({
  programId: z.string(),
  sessionCode: z.string(),
  instructor: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

const enrollmentSchema = z.object({
  employeeId: z.string(),
  sessionId: z.string(),
});

const completionSchema = z.object({
  enrollmentId: z.string(),
  score: z.number().min(0).max(100),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'programs') {
      const status = searchParams.get('status');
      const programs = await trainingManagementService.getTrainingPrograms(
        session.companyId,
        status || undefined
      );
      return NextResponse.json(programs);
    } else if (action === 'sessions') {
      const programId = searchParams.get('programId');
      const sessions = await trainingManagementService.getTrainingSessions(programId || undefined);
      return NextResponse.json(sessions);
    } else if (action === 'enrollments') {
      const employeeId = searchParams.get('employeeId');
      const enrollments = await trainingManagementService.getEmployeeEnrollments(
        employeeId || undefined
      );
      return NextResponse.json(enrollments);
    } else if (action === 'metrics') {
      const metrics = await trainingManagementService.getTrainingMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching training data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training data' },
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

    if (action === 'create-program') {
      const body = await request.json();
      const { programCode, programName, description, category, duration, maxParticipants, startDate, endDate } =
        programSchema.parse(body);

      const program = await trainingManagementService.createTrainingProgram(
        session.companyId,
        programCode,
        programName,
        description,
        category,
        duration,
        maxParticipants,
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json(program, { status: 201 });
    } else if (action === 'create-session') {
      const body = await request.json();
      const { programId, sessionCode, instructor, location, startDate, endDate } =
        sessionSchema.parse(body);

      const trainingSession = await trainingManagementService.createTrainingSession(
        programId,
        sessionCode,
        instructor,
        location,
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json(trainingSession, { status: 201 });
    } else if (action === 'enroll-employee') {
      const body = await request.json();
      const { employeeId, sessionId } = enrollmentSchema.parse(body);

      const enrollment = await trainingManagementService.enrollEmployee(employeeId, sessionId);
      return NextResponse.json(enrollment, { status: 201 });
    } else if (action === 'complete-training') {
      const body = await request.json();
      const { enrollmentId, score } = completionSchema.parse(body);

      const enrollment = await trainingManagementService.completeTraining(enrollmentId, score);
      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
      }

      return NextResponse.json(enrollment);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing training action:', error);
    return NextResponse.json(
      { error: 'Failed to process training action' },
      { status: 500 }
    );
  }
}


