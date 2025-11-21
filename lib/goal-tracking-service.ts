export interface GoalObjective {
  id: string;
  companyId: string;
  objectiveCode: string;
  objectiveName: string;
  objectiveDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
}

export interface GoalKeyResult {
  id: string;
  objectiveId: string;
  keyResultCode: string;
  keyResultName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'pending' | 'in-progress' | 'completed' | 'missed';
  createdAt: Date;
}

export interface GoalProgress {
  id: string;
  keyResultId: string;
  progressCode: string;
  progressValue: number;
  progressDate: Date;
  notes: string;
  createdAt: Date;
}

export interface GoalTrackingMetrics {
  totalObjectives: number;
  activeObjectives: number;
  completedObjectives: number;
  totalKeyResults: number;
  completedKeyResults: number;
  keyResultCompletionRate: number;
  goalTrackingScore: number;
}

export class GoalTrackingService {
  private objectives: Map<string, GoalObjective> = new Map();
  private keyResults: Map<string, GoalKeyResult> = new Map();
  private progress: Map<string, GoalProgress> = new Map();

  async createObjective(
    companyId: string,
    objectiveCode: string,
    objectiveName: string,
    objectiveDescription: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<GoalObjective> {
    const objective: GoalObjective = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      objectiveCode,
      objectiveName,
      objectiveDescription,
      priority,
      status: 'active',
      createdAt: new Date(),
    };

    this.objectives.set(objective.id, objective);
    console.log(`Goal Objective created: ${objectiveName}`);
    return objective;
  }

  async createKeyResult(
    objectiveId: string,
    keyResultCode: string,
    keyResultName: string,
    targetValue: number,
    unit: string
  ): Promise<GoalKeyResult> {
    const keyResult: GoalKeyResult = {
      id: Math.random().toString(36).substr(2, 9),
      objectiveId,
      keyResultCode,
      keyResultName,
      targetValue,
      currentValue: 0,
      unit,
      status: 'pending',
      createdAt: new Date(),
    };

    this.keyResults.set(keyResult.id, keyResult);
    console.log(`Key Result created: ${keyResultName}`);
    return keyResult;
  }

  async updateProgress(
    keyResultId: string,
    progressCode: string,
    progressValue: number,
    notes: string
  ): Promise<GoalProgress> {
    const goalProgress: GoalProgress = {
      id: Math.random().toString(36).substr(2, 9),
      keyResultId,
      progressCode,
      progressValue,
      progressDate: new Date(),
      notes,
      createdAt: new Date(),
    };

    this.progress.set(goalProgress.id, goalProgress);
    console.log(`Progress updated: ${progressCode}`);
    return goalProgress;
  }

  async completeKeyResult(keyResultId: string): Promise<GoalKeyResult | null> {
    const keyResult = this.keyResults.get(keyResultId);
    if (!keyResult) return null;

    keyResult.status = 'completed';
    this.keyResults.set(keyResultId, keyResult);
    console.log(`Key Result completed: ${keyResultId}`);
    return keyResult;
  }

  async getGoalTrackingMetrics(companyId: string): Promise<GoalTrackingMetrics> {
    const objectives = Array.from(this.objectives.values()).filter((o) => o.companyId === companyId);
    const activeObjectives = objectives.filter((o) => o.status === 'active').length;
    const completedObjectives = objectives.filter((o) => o.status === 'completed').length;

    const keyResults = Array.from(this.keyResults.values());
    const completedKeyResults = keyResults.filter((kr) => kr.status === 'completed').length;
    const krCompletionRate = keyResults.length > 0 ? (completedKeyResults / keyResults.length) * 100 : 0;

    return {
      totalObjectives: objectives.length,
      activeObjectives,
      completedObjectives,
      totalKeyResults: keyResults.length,
      completedKeyResults,
      keyResultCompletionRate: krCompletionRate,
      goalTrackingScore: 79.3,
    };
  }
}

export const goalTrackingService = new GoalTrackingService();

