export interface SurveyAnalysis {
  id: string;
  surveyId: string;
  totalResponses: number;
  responseRate: number;
  completionRate: number;
  averageCompletionTime: number;
  sentimentScore: number;
  keyInsights: string[];
  createdAt: Date;
}

export interface QuestionAnalysis {
  id: string;
  questionId: string;
  totalResponses: number;
  responseDistribution: Map<string, number>;
  averageScore?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
}

export interface FeedbackTrend {
  id: string;
  companyId: string;
  period: string;
  totalFeedback: number;
  resolvedCount: number;
  averageResolutionTime: number;
  topCategories: string[];
  sentimentTrend: 'improving' | 'stable' | 'declining';
  createdAt: Date;
}

export interface SurveyReport {
  id: string;
  surveyId: string;
  reportName: string;
  generatedDate: Date;
  totalRespondents: number;
  demographics: Map<string, number>;
  keyFindings: string[];
  recommendations: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
}

export interface AnalyticsMetrics {
  totalAnalyses: number;
  averageSentimentScore: number;
  topInsights: string[];
  feedbackTrendDirection: string;
  reportCount: number;
  publishedReports: number;
}

export class SurveyAnalyticsService {
  private analyses: Map<string, SurveyAnalysis> = new Map();
  private questionAnalyses: Map<string, QuestionAnalysis> = new Map();
  private trends: Map<string, FeedbackTrend> = new Map();
  private reports: Map<string, SurveyReport> = new Map();

  async analyzeSurvey(
    surveyId: string,
    totalResponses: number,
    responseRate: number,
    completionRate: number,
    averageCompletionTime: number,
    sentimentScore: number,
    keyInsights: string[]
  ): Promise<SurveyAnalysis> {
    const analysis: SurveyAnalysis = {
      id: Math.random().toString(36).substr(2, 9),
      surveyId,
      totalResponses,
      responseRate,
      completionRate,
      averageCompletionTime,
      sentimentScore,
      keyInsights,
      createdAt: new Date(),
    };

    this.analyses.set(analysis.id, analysis);
    console.log(`Survey analyzed: ${surveyId}`);
    return analysis;
  }

  async analyzeQuestion(
    questionId: string,
    totalResponses: number,
    responseDistribution: Map<string, number>,
    averageScore?: number,
    sentiment?: 'positive' | 'neutral' | 'negative'
  ): Promise<QuestionAnalysis> {
    const analysis: QuestionAnalysis = {
      id: Math.random().toString(36).substr(2, 9),
      questionId,
      totalResponses,
      responseDistribution,
      averageScore,
      sentiment,
      createdAt: new Date(),
    };

    this.questionAnalyses.set(analysis.id, analysis);
    console.log(`Question analyzed: ${questionId}`);
    return analysis;
  }

  async trackFeedbackTrend(
    companyId: string,
    period: string,
    totalFeedback: number,
    resolvedCount: number,
    averageResolutionTime: number,
    topCategories: string[],
    sentimentTrend: 'improving' | 'stable' | 'declining'
  ): Promise<FeedbackTrend> {
    const trend: FeedbackTrend = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      period,
      totalFeedback,
      resolvedCount,
      averageResolutionTime,
      topCategories,
      sentimentTrend,
      createdAt: new Date(),
    };

    this.trends.set(trend.id, trend);
    console.log(`Feedback trend tracked: ${period}`);
    return trend;
  }

  async generateSurveyReport(
    surveyId: string,
    reportName: string,
    totalRespondents: number,
    demographics: Map<string, number>,
    keyFindings: string[],
    recommendations: string[]
  ): Promise<SurveyReport> {
    const report: SurveyReport = {
      id: Math.random().toString(36).substr(2, 9),
      surveyId,
      reportName,
      generatedDate: new Date(),
      totalRespondents,
      demographics,
      keyFindings,
      recommendations,
      status: 'draft',
      createdAt: new Date(),
    };

    this.reports.set(report.id, report);
    console.log(`Survey report generated: ${reportName}`);
    return report;
  }

  async publishReport(reportId: string): Promise<SurveyReport | null> {
    const report = this.reports.get(reportId);
    if (!report) return null;

    report.status = 'published';
    this.reports.set(reportId, report);
    console.log(`Report published: ${reportId}`);
    return report;
  }

  async getSurveyAnalyses(surveyId?: string): Promise<SurveyAnalysis[]> {
    let analyses = Array.from(this.analyses.values());

    if (surveyId) {
      analyses = analyses.filter((a) => a.surveyId === surveyId);
    }

    return analyses;
  }

  async getFeedbackTrends(companyId: string): Promise<FeedbackTrend[]> {
    return Array.from(this.trends.values()).filter((t) => t.companyId === companyId);
  }

  async getSurveyReports(surveyId?: string): Promise<SurveyReport[]> {
    let reports = Array.from(this.reports.values());

    if (surveyId) {
      reports = reports.filter((r) => r.surveyId === surveyId);
    }

    return reports;
  }

  async getAnalyticsMetrics(companyId: string): Promise<AnalyticsMetrics> {
    const analyses = Array.from(this.analyses.values());
    const averageSentimentScore = analyses.length > 0 ? analyses.reduce((sum, a) => sum + a.sentimentScore, 0) / analyses.length : 0;

    const trends = Array.from(this.trends.values()).filter((t) => t.companyId === companyId);
    const latestTrend = trends.length > 0 ? trends[trends.length - 1].sentimentTrend : 'stable';

    const reports = Array.from(this.reports.values());
    const publishedReports = reports.filter((r) => r.status === 'published').length;

    const allInsights = analyses.flatMap((a) => a.keyInsights);

    return {
      totalAnalyses: analyses.length,
      averageSentimentScore,
      topInsights: allInsights.slice(0, 5),
      feedbackTrendDirection: latestTrend,
      reportCount: reports.length,
      publishedReports,
    };
  }
}

export const surveyAnalyticsService = new SurveyAnalyticsService();

