export interface CustomerFeedback {
  id: string;
  companyId: string;
  customerId: string;
  rating: number;
  comment: string;
  category: string;
  status: 'new' | 'reviewed' | 'addressed' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Survey {
  id: string;
  companyId: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  status: 'draft' | 'active' | 'closed';
  responses: number;
  createdAt: Date;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'multiple-choice' | 'yes-no';
  options?: string[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  answers: Record<string, string | number>;
  submittedAt: Date;
}

export class FeedbackService {
  private feedback: Map<string, CustomerFeedback> = new Map();
  private surveys: Map<string, Survey> = new Map();
  private responses: SurveyResponse[] = [];

  async submitFeedback(
    companyId: string,
    customerId: string,
    rating: number,
    comment: string,
    category: string
  ): Promise<CustomerFeedback> {
    const fb: CustomerFeedback = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      customerId,
      rating,
      comment,
      category,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.feedback.set(fb.id, fb);
    console.log(`Feedback submitted: ${customerId}`);
    return fb;
  }

  async reviewFeedback(feedbackId: string): Promise<CustomerFeedback | null> {
    const fb = this.feedback.get(feedbackId);
    if (!fb) return null;

    fb.status = 'reviewed';
    fb.updatedAt = new Date();
    this.feedback.set(feedbackId, fb);
    console.log(`Feedback reviewed: ${feedbackId}`);
    return fb;
  }

  async createSurvey(
    companyId: string,
    title: string,
    description: string,
    questions: SurveyQuestion[]
  ): Promise<Survey> {
    const survey: Survey = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      title,
      description,
      questions,
      status: 'draft',
      responses: 0,
      createdAt: new Date(),
    };

    this.surveys.set(survey.id, survey);
    console.log(`Survey created: ${title}`);
    return survey;
  }

  async activateSurvey(surveyId: string): Promise<Survey | null> {
    const survey = this.surveys.get(surveyId);
    if (!survey) return null;

    survey.status = 'active';
    this.surveys.set(surveyId, survey);
    console.log(`Survey activated: ${surveyId}`);
    return survey;
  }

  async submitSurveyResponse(
    surveyId: string,
    respondentId: string,
    answers: Record<string, string | number>
  ): Promise<SurveyResponse> {
    const response: SurveyResponse = {
      id: Math.random().toString(36).substr(2, 9),
      surveyId,
      respondentId,
      answers,
      submittedAt: new Date(),
    };

    this.responses.push(response);

    const survey = this.surveys.get(surveyId);
    if (survey) {
      survey.responses += 1;
      this.surveys.set(surveyId, survey);
    }

    console.log(`Survey response submitted: ${surveyId}`);
    return response;
  }

  async getFeedback(companyId: string, status?: string): Promise<CustomerFeedback[]> {
    let feedback = Array.from(this.feedback.values()).filter(
      (f) => f.companyId === companyId
    );

    if (status) {
      feedback = feedback.filter((f) => f.status === status);
    }

    return feedback;
  }

  async getSurveys(companyId: string): Promise<Survey[]> {
    return Array.from(this.surveys.values()).filter(
      (s) => s.companyId === companyId
    );
  }

  async getFeedbackMetrics(companyId: string): Promise<{
    totalFeedback: number;
    averageRating: number;
    newFeedback: number;
    addressedFeedback: number;
    totalSurveys: number;
    activeSurveys: number;
    totalResponses: number;
  }> {
    const feedback = Array.from(this.feedback.values()).filter(
      (f) => f.companyId === companyId
    );

    const averageRating = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;

    const newFeedback = feedback.filter((f) => f.status === 'new').length;
    const addressedFeedback = feedback.filter((f) => f.status === 'addressed').length;

    const surveys = Array.from(this.surveys.values()).filter(
      (s) => s.companyId === companyId
    );
    const activeSurveys = surveys.filter((s) => s.status === 'active').length;
    const totalResponses = this.responses.length;

    return {
      totalFeedback: feedback.length,
      averageRating,
      newFeedback,
      addressedFeedback,
      totalSurveys: surveys.length,
      activeSurveys,
      totalResponses,
    };
  }
}

export const feedbackService = new FeedbackService();

