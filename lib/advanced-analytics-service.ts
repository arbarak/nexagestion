export interface AnalyticsQuery {
  id: string;
  companyId: string;
  queryCode: string;
  queryName: string;
  queryType: 'ad-hoc' | 'scheduled' | 'real-time';
  sqlQuery: string;
  resultCount: number;
  executionTime: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PredictiveModel {
  id: string;
  companyId: string;
  modelCode: string;
  modelName: string;
  modelType: 'regression' | 'classification' | 'clustering' | 'forecasting';
  accuracy: number;
  trainingDataSize: number;
  status: 'training' | 'active' | 'inactive' | 'archived';
  createdAt: Date;
}

export interface AnalyticsAlert {
  id: string;
  companyId: string;
  alertCode: string;
  alertName: string;
  alertType: 'threshold' | 'anomaly' | 'trend' | 'forecast';
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'triggered';
  createdAt: Date;
}

export interface AdvancedAnalyticsMetrics {
  totalQueries: number;
  completedQueries: number;
  totalModels: number;
  activeModels: number;
  totalAlerts: number;
  triggeredAlerts: number;
  averageQueryTime: number;
  modelAccuracy: number;
}

export class AdvancedAnalyticsService {
  private queries: Map<string, AnalyticsQuery> = new Map();
  private models: Map<string, PredictiveModel> = new Map();
  private alerts: Map<string, AnalyticsAlert> = new Map();

  async createQuery(
    companyId: string,
    queryCode: string,
    queryName: string,
    queryType: 'ad-hoc' | 'scheduled' | 'real-time',
    sqlQuery: string
  ): Promise<AnalyticsQuery> {
    const query: AnalyticsQuery = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      queryCode,
      queryName,
      queryType,
      sqlQuery,
      resultCount: 0,
      executionTime: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queries.set(query.id, query);
    console.log(`Query created: ${queryName}`);
    return query;
  }

  async executeQuery(queryId: string, resultCount: number, executionTime: number): Promise<AnalyticsQuery | null> {
    const query = this.queries.get(queryId);
    if (!query) return null;

    query.status = 'completed';
    query.resultCount = resultCount;
    query.executionTime = executionTime;
    this.queries.set(queryId, query);
    console.log(`Query executed: ${queryId}`);
    return query;
  }

  async createModel(
    companyId: string,
    modelCode: string,
    modelName: string,
    modelType: 'regression' | 'classification' | 'clustering' | 'forecasting',
    trainingDataSize: number
  ): Promise<PredictiveModel> {
    const model: PredictiveModel = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      modelCode,
      modelName,
      modelType,
      accuracy: 0,
      trainingDataSize,
      status: 'training',
      createdAt: new Date(),
    };

    this.models.set(model.id, model);
    console.log(`Model created: ${modelName}`);
    return model;
  }

  async activateModel(modelId: string, accuracy: number): Promise<PredictiveModel | null> {
    const model = this.models.get(modelId);
    if (!model) return null;

    model.status = 'active';
    model.accuracy = accuracy;
    this.models.set(modelId, model);
    console.log(`Model activated: ${modelId}`);
    return model;
  }

  async createAlert(
    companyId: string,
    alertCode: string,
    alertName: string,
    alertType: 'threshold' | 'anomaly' | 'trend' | 'forecast',
    condition: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<AnalyticsAlert> {
    const alert: AnalyticsAlert = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      alertCode,
      alertName,
      alertType,
      condition,
      severity,
      status: 'active',
      createdAt: new Date(),
    };

    this.alerts.set(alert.id, alert);
    console.log(`Alert created: ${alertName}`);
    return alert;
  }

  async getAnalyticsMetrics(companyId: string): Promise<AdvancedAnalyticsMetrics> {
    const queries = Array.from(this.queries.values()).filter((q) => q.companyId === companyId);
    const completedQueries = queries.filter((q) => q.status === 'completed').length;
    const avgQueryTime = queries.length > 0
      ? queries.reduce((sum, q) => sum + q.executionTime, 0) / queries.length
      : 0;

    const models = Array.from(this.models.values()).filter((m) => m.companyId === companyId);
    const activeModels = models.filter((m) => m.status === 'active').length;
    const avgAccuracy = models.length > 0
      ? models.reduce((sum, m) => sum + m.accuracy, 0) / models.length
      : 0;

    const alerts = Array.from(this.alerts.values()).filter((a) => a.companyId === companyId);
    const triggeredAlerts = alerts.filter((a) => a.status === 'triggered').length;

    return {
      totalQueries: queries.length,
      completedQueries,
      totalModels: models.length,
      activeModels,
      totalAlerts: alerts.length,
      triggeredAlerts,
      averageQueryTime: avgQueryTime,
      modelAccuracy: avgAccuracy,
    };
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();

