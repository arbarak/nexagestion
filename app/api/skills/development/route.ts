import { NextRequest, NextResponse } from 'next/server';
import { skillsDevelopmentService } from '@/lib/skills-development-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const skillSchema = z.object({
  skillName: z.string(),
  category: z.string(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  description: z.string(),
});

const employeeSkillSchema = z.object({
  employeeId: z.string(),
  skillId: z.string(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  yearsOfExperience: z.number(),
});

const skillGapSchema = z.object({
  employeeId: z.string(),
  requiredSkillId: z.string(),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  requiredLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
});

const developmentPlanSchema = z.object({
  employeeId: z.string(),
  planName: z.string(),
  objectives: z.array(z.string()),
  targetSkills: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'skills') {
      const skills = await skillsDevelopmentService.getSkills(session.companyId);
      return NextResponse.json(skills);
    } else if (action === 'employee-skills') {
      const employeeId = searchParams.get('employeeId');
      const skills = await skillsDevelopmentService.getEmployeeSkills(employeeId || undefined);
      return NextResponse.json(skills);
    } else if (action === 'skill-gaps') {
      const employeeId = searchParams.get('employeeId');
      const gaps = await skillsDevelopmentService.getSkillGaps(employeeId || undefined);
      return NextResponse.json(gaps);
    } else if (action === 'metrics') {
      const metrics = await skillsDevelopmentService.getSkillsMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching skills data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills data' },
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

    if (action === 'create-skill') {
      const body = await request.json();
      const { skillName, category, proficiencyLevel, description } = skillSchema.parse(body);

      const skill = await skillsDevelopmentService.createSkill(
        session.companyId,
        skillName,
        category,
        proficiencyLevel,
        description
      );

      return NextResponse.json(skill, { status: 201 });
    } else if (action === 'assign-employee-skill') {
      const body = await request.json();
      const { employeeId, skillId, proficiencyLevel, yearsOfExperience } =
        employeeSkillSchema.parse(body);

      const employeeSkill = await skillsDevelopmentService.assignEmployeeSkill(
        employeeId,
        skillId,
        proficiencyLevel,
        yearsOfExperience
      );

      return NextResponse.json(employeeSkill, { status: 201 });
    } else if (action === 'identify-skill-gap') {
      const body = await request.json();
      const { employeeId, requiredSkillId, currentLevel, requiredLevel } =
        skillGapSchema.parse(body);

      const gap = await skillsDevelopmentService.identifySkillGap(
        employeeId,
        requiredSkillId,
        currentLevel,
        requiredLevel
      );

      return NextResponse.json(gap, { status: 201 });
    } else if (action === 'create-development-plan') {
      const body = await request.json();
      const { employeeId, planName, objectives, targetSkills, startDate, endDate } =
        developmentPlanSchema.parse(body);

      const plan = await skillsDevelopmentService.createDevelopmentPlan(
        employeeId,
        planName,
        objectives,
        targetSkills,
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json(plan, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing skills action:', error);
    return NextResponse.json(
      { error: 'Failed to process skills action' },
      { status: 500 }
    );
  }
}


