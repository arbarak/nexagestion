export interface Survey {
  id: string;
  companyId: string;
  surveyCode: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  startDate: Date;
  endDate: Date;
  targetAudience: string;
  createdAt: Date;
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  questionText: string;
  questionType: 'text' | 'multiple-choice' | 'rating' | 'yes-no';
  options?: string[];
  required: boolean;
  order: number;
  createdAt: Date;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  responses: Map<string, string | number>;
  submittedAt: Date;
  status: 'draft' | 'submitted';
  createdAt: Date;
}

export interface Feedback {
  id: string;
  companyId: string;
  feedbackCode: string;
  customerId: string;
  subject: string;
  message: string;
  category: string;
  rating: number;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface FeedbackMetrics {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  averageResponseRate: number;
  totalFeedback: number;
  resolvedFeedback: number;
  averageRating: number;
  satisfactionScore: number;
}

export class FeedbackManagementService {
  private surveys: Map<string, Survey> = new Map();
  private questions: Map<string, SurveyQuestion> = new Map();
  private responses: Map<string, SurveyResponse> = new Map();
  private feedback: Map<string, Feedback> = new Map();

  async createSurvey(
    companyId: string,
    surveyCode: string,
    title: string,
    description: string,
    category: string,
    startDate: Date,
    endDate: Date,
    targetAudience: string
  ): Promise<Survey> {
    const survey: Survey = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      surveyCode,
      title,
      description,
      category,
      status: 'draft',
      startDate,
      endDate,
      targetAudience,
      createdAt: new Date(),
    };

    this.surveys.set(survey.id, survey);
    console.log(`Survey created: ${title}`);
    return survey;
  }

  async addSurveyQuestion(
    surveyId: string,
    questionText: string,
    questionType: 'text' | 'multiple-choice' | 'rating' | 'yes-no',
    options: string[] | undefined,
    required: boolean,
    order: number
  ): Promise<SurveyQuestion> {
    const question: SurveyQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      surveyId,
      questionText,
      questionType,
      options,
      required,
      order,
      createdAt: new Date(),
    };

    this.questions.set(question.id, question);
    console.log(`Survey question added: ${questionText}`);
    return question;
  }

  async submitSurveyResponse(
    surveyId: string,
    respondentId: string,
    responses: Map<string, string | number>
  ): Promise<SurveyResponse> {
    const response: SurveyResponse = {
      id: Math.random().toString(36).substr(2, 9),
      surveyId,
      respondentId,
      responses,
      submittedAt: new Date(),
      status: 'submitted',
      createdAt: new Date(),
    };

    this.responses.set(response.id, response);
    console.log(`Survey response submitted: ${respondentId}`);
    return response;
  }

  async submitFeedback(
    companyId: string,
    feedbackCode: string,
    customerId: string,
    subject: string,
    message: string,
    category: string,
    rating: number,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<Feedback> {
    const feedback: Feedback = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      feedbackCode,
      customerId,
      subject,
      message,
      category,
      rating,
      status: 'new',
      priority,
      createdAt: new Date(),
    };

    this.feedback.set(feedback.id, feedback);
    console.log(`Feedback submitted: ${subject}`);
    return feedback;
  }

  async updateFeedbackStatus(
    feedbackId: string,
    status: 'new' | 'in-progress' | 'resolved' | 'closed'
  ): Promise<Feedback | null> {
    const feedback = this.feedback.get(feedbackId);
    if (!feedback) return null;

    feedback.status = status;
    this.feedback.set(feedbackId, feedback);
    console.log(`Feedback status updated: ${feedbackId}`);
    return feedback;
  }

  async getSurveys(companyId: string, status?: string): Promise<Survey[]> {
    let surveys = Array.from(this.surveys.values()).filter((s) => s.companyId === companyId);

    if (status) {
      surveys = surveys.filter((s) => s.status === status);
    }

    return surveys;
  }

  async getSurveyQuestions(surveyId: string): Promise<SurveyQuestion[]> {
    return Array.from(this.questions.values())
      .filter((q) => q.surveyId === surveyId)
      .sort((a, b) => a.order - b.order);
  }

  async getSurveyResponses(surveyId?: string): Promise<SurveyResponse[]> {
    let responses = Array.from(this.responses.values());

    if (surveyId) {
      responses = responses.filter((r) => r.surveyId === surveyId);
    }

    return responses;
  }

  async getFeedback(companyId: string, status?: string): Promise<Feedback[]> {
    let feedback = Array.from(this.feedback.values()).filter((f) => f.companyId === companyId);

    if (status) {
      feedback = feedback.filter((f) => f.status === status);
    }

    return feedback;
  }

  async getFeedbackMetrics(companyId: string): Promise<FeedbackMetrics> {
    const surveys = Array.from(this.surveys.values()).filter((s) => s.companyId === companyId);
    const activeSurveys = surveys.filter((s) => s.status === 'active').length;

    const allResponses = Array.from(this.responses.values());
    const responseRate = surveys.length > 0 ? (allResponses.length / surveys.length) * 100 : 0;

    const feedback = Array.from(this.feedback.values()).filter((f) => f.companyId === companyId);
    const resolvedFeedback = feedback.filter((f) => f.status === 'resolved').length;
    const averageRating = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0;

    return {
      totalSurveys: surveys.length,
      activeSurveys,
      totalResponses: allResponses.length,
      averageResponseRate: responseRate,
      totalFeedback: feedback.length,
      resolvedFeedback,
      averageRating,
      satisfactionScore: (averageRating / 5) * 100,
    };
  }
}

export const feedbackManagementService = new FeedbackManagementService();

