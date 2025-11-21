import { NextRequest, NextResponse } from 'next/server';
import { feedbackService } from '@/lib/feedback-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const feedbackSchema = z.object({
  customerId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  category: z.string(),
});

const surveySchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    type: z.enum(['text', 'rating', 'multiple-choice', 'yes-no']),
    options: z.array(z.string()).optional(),
  })),
});

const surveyResponseSchema = z.object({
  surveyId: z.string(),
  answers: z.record(z.union([z.string(), z.number()])),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'feedback') {
      const status = searchParams.get('status');
      const feedback = await feedbackService.getFeedback(session.companyId, status || undefined);
      return NextResponse.json(feedback);
    } else if (action === 'surveys') {
      const surveys = await feedbackService.getSurveys(session.companyId);
      return NextResponse.json(surveys);
    } else if (action === 'metrics') {
      const metrics = await feedbackService.getFeedbackMetrics(session.companyId);
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

    if (action === 'submit-feedback') {
      const body = await request.json();
      const { customerId, rating, comment, category } = feedbackSchema.parse(body);

      const feedback = await feedbackService.submitFeedback(
        session.companyId,
        customerId,
        rating,
        comment,
        category
      );

      return NextResponse.json(feedback, { status: 201 });
    } else if (action === 'create-survey') {
      const body = await request.json();
      const { title, description, questions } = surveySchema.parse(body);

      const survey = await feedbackService.createSurvey(
        session.companyId,
        title,
        description,
        questions
      );

      return NextResponse.json(survey, { status: 201 });
    } else if (action === 'activate-survey') {
      const body = await request.json();
      const { surveyId } = z.object({ surveyId: z.string() }).parse(body);

      const survey = await feedbackService.activateSurvey(surveyId);
      if (!survey) {
        return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
      }

      return NextResponse.json(survey);
    } else if (action === 'submit-response') {
      const body = await request.json();
      const { surveyId, answers } = surveyResponseSchema.parse(body);

      const response = await feedbackService.submitSurveyResponse(
        surveyId,
        session.userId,
        answers
      );

      return NextResponse.json(response, { status: 201 });
    } else if (action === 'review-feedback') {
      const body = await request.json();
      const { feedbackId } = z.object({ feedbackId: z.string() }).parse(body);

      const feedback = await feedbackService.reviewFeedback(feedbackId);
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

