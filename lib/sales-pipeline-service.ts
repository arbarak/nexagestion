export interface Deal {
  id: string;
  companyId: string;
  name: string;
  customerId: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  assignedTo: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesActivity {
  id: string;
  dealId: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  description: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface SalesForecast {
  id: string;
  companyId: string;
  month: string;
  forecastedRevenue: number;
  actualRevenue: number;
  accuracy: number;
  createdAt: Date;
}

export class SalesPipelineService {
  private deals: Map<string, Deal> = new Map();
  private activities: SalesActivity[] = [];
  private forecasts: SalesForecast[] = [];

  async createDeal(
    companyId: string,
    name: string,
    customerId: string,
    value: number,
    expectedCloseDate: Date,
    assignedTo: string
  ): Promise<Deal> {
    const deal: Deal = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      customerId,
      value,
      stage: 'prospecting',
      probability: 0,
      expectedCloseDate,
      assignedTo,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.deals.set(deal.id, deal);
    console.log(`Deal created: ${name}`);
    return deal;
  }

  async getDeals(companyId: string, stage?: string): Promise<Deal[]> {
    let deals = Array.from(this.deals.values()).filter(
      (d) => d.companyId === companyId
    );

    if (stage) {
      deals = deals.filter((d) => d.stage === stage);
    }

    return deals;
  }

  async updateDealStage(dealId: string, stage: string, probability: number): Promise<Deal | null> {
    const deal = this.deals.get(dealId);
    if (!deal) return null;

    deal.stage = stage;
    deal.probability = probability;

    if (stage === 'closed-won' || stage === 'closed-lost') {
      deal.actualCloseDate = new Date();
    }

    deal.updatedAt = new Date();
    this.deals.set(dealId, deal);
    console.log(`Deal stage updated: ${stage}`);
    return deal;
  }

  async addActivity(
    dealId: string,
    type: 'call' | 'email' | 'meeting' | 'task' | 'note',
    description: string,
    dueDate: Date,
    createdBy: string
  ): Promise<SalesActivity> {
    const activity: SalesActivity = {
      id: Math.random().toString(36).substr(2, 9),
      dealId,
      type,
      description,
      dueDate,
      completed: false,
      createdBy,
      createdAt: new Date(),
    };

    this.activities.push(activity);
    console.log(`Activity added to deal: ${dealId}`);
    return activity;
  }

  async completeActivity(activityId: string): Promise<SalesActivity | null> {
    const activity = this.activities.find((a) => a.id === activityId);
    if (!activity) return null;

    activity.completed = true;
    activity.completedDate = new Date();
    console.log(`Activity completed: ${activityId}`);
    return activity;
  }

  async getDealActivities(dealId: string): Promise<SalesActivity[]> {
    return this.activities.filter((a) => a.dealId === dealId);
  }

  async getPipelineMetrics(companyId: string): Promise<{
    totalDeals: number;
    totalPipelineValue: number;
    dealsByStage: Record<string, number>;
    averageDealValue: number;
    winRate: number;
  }> {
    const deals = Array.from(this.deals.values()).filter(
      (d) => d.companyId === companyId
    );

    const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);
    const averageDealValue = deals.length > 0 ? totalPipelineValue / deals.length : 0;

    const closedWon = deals.filter((d) => d.stage === 'closed-won').length;
    const closedLost = deals.filter((d) => d.stage === 'closed-lost').length;
    const totalClosed = closedWon + closedLost;
    const winRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0;

    const dealsByStage: Record<string, number> = {
      prospecting: deals.filter((d) => d.stage === 'prospecting').length,
      qualification: deals.filter((d) => d.stage === 'qualification').length,
      proposal: deals.filter((d) => d.stage === 'proposal').length,
      negotiation: deals.filter((d) => d.stage === 'negotiation').length,
      'closed-won': closedWon,
      'closed-lost': closedLost,
    };

    return {
      totalDeals: deals.length,
      totalPipelineValue,
      dealsByStage,
      averageDealValue,
      winRate,
    };
  }

  async createForecast(
    companyId: string,
    month: string,
    forecastedRevenue: number,
    actualRevenue: number = 0
  ): Promise<SalesForecast> {
    const accuracy = actualRevenue > 0
      ? Math.round((actualRevenue / forecastedRevenue) * 100)
      : 0;

    const forecast: SalesForecast = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      month,
      forecastedRevenue,
      actualRevenue,
      accuracy,
      createdAt: new Date(),
    };

    this.forecasts.push(forecast);
    console.log(`Forecast created: ${month}`);
    return forecast;
  }

  async getForecasts(companyId: string, limit: number = 12): Promise<SalesForecast[]> {
    return this.forecasts
      .filter((f) => f.companyId === companyId)
      .slice(-limit);
  }
}

export const salesPipelineService = new SalesPipelineService();

