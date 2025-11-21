import { NextRequest, NextResponse } from 'next/server';
import { surveyAnalyticsService } from '@/lib/survey-analytics-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const surveyAnalysisSchema = z.object({
  surveyId: z.string(),
  totalResponses: z.number(),
  responseRate: z.number(),
  completionRate: z.number(),
  averageCompletionTime: z.number(),
  sentimentScore: z.number(),
  keyInsights: z.array(z.string()),
});

const questionAnalysisSchema = z.object({
  questionId: z.string(),
  totalResponses: z.number(),
  responseDistribution: z.record(z.number()),
  averageScore: z.number().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
});

const feedbackTrendSchema = z.object({
  period: z.string(),
  totalFeedback: z.number(),
  resolvedCount: z.number(),
  averageResolutionTime: z.number(),
  topCategories: z.array(z.string()),
  sentimentTrend: z.enum(['improving', 'stable', 'declining']),
});

const reportSchema = z.object({
  surveyId: z.string(),
  reportName: z.string(),
  totalRespondents: z.number(),
  demographics: z.record(z.number()),
  keyFindings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'analyses') {
      const surveyId = searchParams.get('surveyId');
      const analyses = await surveyAnalyticsService.getSurveyAnalyses(surveyId || undefined);
      return NextResponse.json(analyses);
    } else if (action === 'trends') {
      const trends = await surveyAnalyticsService.getFeedbackTrends(session.companyId);
      return NextResponse.json(trends);
    } else if (action === 'reports') {
      const surveyId = searchParams.get('surveyId');
      const reports = await surveyAnalyticsService.getSurveyReports(surveyId || undefined);
      return NextResponse.json(reports);
    } else if (action === 'metrics') {
      const metrics = await surveyAnalyticsService.getAnalyticsMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
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

    if (action === 'analyze-survey') {
      const body = await request.json();
      const { surveyId, totalResponses, responseRate, completionRate, averageCompletionTime, sentimentScore, keyInsights } =
        surveyAnalysisSchema.parse(body);

      const analysis = await surveyAnalyticsService.analyzeSurvey(
        surveyId,
        totalResponses,
        responseRate,
        completionRate,
        averageCompletionTime,
        sentimentScore,
        keyInsights
      );

      return NextResponse.json(analysis, { status: 201 });
    } else if (action === 'analyze-question') {
      const body = await request.json();
      const { questionId, totalResponses, responseDistribution, averageScore, sentiment } =
        questionAnalysisSchema.parse(body);

      const analysis = await surveyAnalyticsService.analyzeQuestion(
        questionId,
        totalResponses,
        new Map(Object.entries(responseDistribution)),
        averageScore,
        sentiment
      );

      return NextResponse.json(analysis, { status: 201 });
    } else if (action === 'track-trend') {
      const body = await request.json();
      const { period, totalFeedback, resolvedCount, averageResolutionTime, topCategories, sentimentTrend } =
        feedbackTrendSchema.parse(body);

      const trend = await surveyAnalyticsService.trackFeedbackTrend(
        session.companyId,
        period,
        totalFeedback,
        resolvedCount,
        averageResolutionTime,
        topCategories,
        sentimentTrend
      );

      return NextResponse.json(trend, { status: 201 });
    } else if (action === 'generate-report') {
      const body = await request.json();
      const { surveyId, reportName, totalRespondents, demographics, keyFindings, recommendations } =
        reportSchema.parse(body);

      const report = await surveyAnalyticsService.generateSurveyReport(
        surveyId,
        reportName,
        totalRespondents,
        new Map(Object.entries(demographics)),
        keyFindings,
        recommendations
      );

      return NextResponse.json(report, { status: 201 });
    } else if (action === 'publish-report') {
      const body = await request.json();
      const { reportId } = z.object({ reportId: z.string() }).parse(body);

      const report = await surveyAnalyticsService.publishReport(reportId);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      return NextResponse.json(report);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing analytics action:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics action' },
      { status: 500 }
    );
  }
}


