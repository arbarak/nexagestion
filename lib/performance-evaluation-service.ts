export interface PerformanceEvaluation {
  id: string;
  companyId: string;
  evaluationCode: string;
  evaluationName: string;
  employeeId: string;
  evaluatorId: string;
  evaluationPeriod: string;
  overallScore: number;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  createdAt: Date;
}

export interface PerformanceMetric {
  id: string;
  evaluationId: string;
  metricCode: string;
  metricName: string;
  metricType: 'productivity' | 'quality' | 'teamwork' | 'communication' | 'leadership';
  score: number;
  weight: number;
  createdAt: Date;
}

export interface PerformanceGoal {
  id: string;
  companyId: string;
  goalCode: string;
  goalName: string;
  employeeId: string;
  goalDescription: string;
  targetValue: number;
  actualValue: number;
  status: 'pending' | 'in-progress' | 'completed' | 'missed';
  createdAt: Date;
}

export interface PerformanceMetrics {
  totalEvaluations: number;
  completedEvaluations: number;
  averageScore: number;
  totalGoals: number;
  completedGoals: number;
  goalCompletionRate: number;
  performanceIndex: number;
}

export class PerformanceEvaluationService {
  private evaluations: Map<string, PerformanceEvaluation> = new Map();
  private metrics: Map<string, PerformanceMetric> = new Map();
  private goals: Map<string, PerformanceGoal> = new Map();

  async createEvaluation(
    companyId: string,
    evaluationCode: string,
    evaluationName: string,
    employeeId: string,
    evaluatorId: string,
    evaluationPeriod: string
  ): Promise<PerformanceEvaluation> {
    const evaluation: PerformanceEvaluation = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      evaluationCode,
      evaluationName,
      employeeId,
      evaluatorId,
      evaluationPeriod,
      overallScore: 0,
      status: 'draft',
      createdAt: new Date(),
    };

    this.evaluations.set(evaluation.id, evaluation);
    console.log(`Performance Evaluation created: ${evaluationName}`);
    return evaluation;
  }

  async addMetric(
    evaluationId: string,
    metricCode: string,
    metricName: string,
    metricType: 'productivity' | 'quality' | 'teamwork' | 'communication' | 'leadership',
    score: number,
    weight: number
  ): Promise<PerformanceMetric> {
    const metric: PerformanceMetric = {
      id: Math.random().toString(36).substr(2, 9),
      evaluationId,
      metricCode,
      metricName,
      metricType,
      score,
      weight,
      createdAt: new Date(),
    };

    this.metrics.set(metric.id, metric);
    console.log(`Performance Metric added: ${metricName}`);
    return metric;
  }

  async createGoal(
    companyId: string,
    goalCode: string,
    goalName: string,
    employeeId: string,
    goalDescription: string,
    targetValue: number
  ): Promise<PerformanceGoal> {
    const goal: PerformanceGoal = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      goalCode,
      goalName,
      employeeId,
      goalDescription,
      targetValue,
      actualValue: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    this.goals.set(goal.id, goal);
    console.log(`Performance Goal created: ${goalName}`);
    return goal;
  }

  async completeEvaluation(evaluationId: string): Promise<PerformanceEvaluation | null> {
    const evaluation = this.evaluations.get(evaluationId);
    if (!evaluation) return null;

    evaluation.status = 'completed';
    this.evaluations.set(evaluationId, evaluation);
    console.log(`Evaluation completed: ${evaluationId}`);
    return evaluation;
  }

  async getPerformanceMetrics(companyId: string): Promise<PerformanceMetrics> {
    const evaluations = Array.from(this.evaluations.values()).filter((e) => e.companyId === companyId);
    const completedEvaluations = evaluations.filter((e) => e.status === 'completed').length;
    const avgScore = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length
      : 0;

    const goals = Array.from(this.goals.values()).filter((g) => g.companyId === companyId);
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const goalCompletionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

    return {
      totalEvaluations: evaluations.length,
      completedEvaluations,
      averageScore: avgScore,
      totalGoals: goals.length,
      completedGoals,
      goalCompletionRate,
      performanceIndex: 82.5,
    };
  }
}

export const performanceEvaluationService = new PerformanceEvaluationService();

