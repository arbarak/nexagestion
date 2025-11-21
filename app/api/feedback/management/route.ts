import { NextRequest, NextResponse } from 'next/server';
import { feedbackManagementService } from '@/lib/feedback-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const surveySchema = z.object({
  surveyCode: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  targetAudience: z.string(),
});

const questionSchema = z.object({
  surveyId: z.string(),
  questionText: z.string(),
  questionType: z.enum(['text', 'multiple-choice', 'rating', 'yes-no']),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  order: z.number(),
});

const responseSchema = z.object({
  surveyId: z.string(),
  respondentId: z.string(),
  responses: z.record(z.union([z.string(), z.number()])),
});

const feedbackSchema = z.object({
  feedbackCode: z.string(),
  customerId: z.string(),
  subject: z.string(),
  message: z.string(),
  category: z.string(),
  rating: z.number().min(1).max(5),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'surveys') {
      const status = searchParams.get('status');
      const surveys = await feedbackManagementService.getSurveys(session.companyId, status || undefined);
      return NextResponse.json(surveys);
    } else if (action === 'feedback') {
      const status = searchParams.get('status');
      const feedback = await feedbackManagementService.getFeedback(session.companyId, status || undefined);
      return NextResponse.json(feedback);
    } else if (action === 'metrics') {
      const metrics = await feedbackManagementService.getFeedbackMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-survey') {
      const body = await request.json();
      const { surveyCode, title, description, category, startDate, endDate, targetAudience } =
        surveySchema.parse(body);

      const survey = await feedbackManagementService.createSurvey(
        session.companyId,
        surveyCode,
        title,
        description,
        category,
        new Date(startDate),
        new Date(endDate),
        targetAudience
      );

      return NextResponse.json(survey, { status: 201 });
    } else if (action === 'add-question') {
      const body = await request.json();
      const { surveyId, questionText, questionType, options, required, order } =
        questionSchema.parse(body);

      const question = await feedbackManagementService.addSurveyQuestion(
        surveyId,
        questionText,
        questionType,
        options,
        required,
        order
      );

      return NextResponse.json(question, { status: 201 });
    } else if (action === 'submit-response') {
      const body = await request.json();
      const { surveyId, respondentId, responses } = responseSchema.parse(body);

      const response = await feedbackManagementService.submitSurveyResponse(
        surveyId,
        respondentId,
        new Map(Object.entries(responses))
      );

      return NextResponse.json(response, { status: 201 });
    } else if (action === 'submit-feedback') {
      const body = await request.json();
      const { feedbackCode, customerId, subject, message, category, rating, priority } =
        feedbackSchema.parse(body);

      const feedback = await feedbackManagementService.submitFeedback(
        session.companyId,
        feedbackCode,
        customerId,
        subject,
        message,
        category,
        rating,
        priority
      );

      return NextResponse.json(feedback, { status: 201 });
    } else if (action === 'update-feedback-status') {
      const body = await request.json();
      const { feedbackId, status } = z.object({
        feedbackId: z.string(),
        status: z.enum(['new', 'in-progress', 'resolved', 'closed']),
      }).parse(body);

      const feedback = await feedbackManagementService.updateFeedbackStatus(feedbackId, status);
      if (!feedback) {
        return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
      }

      return NextResponse.json(feedback);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing feedback action:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback action' },
      { status: 500 }
    );
  }
}

