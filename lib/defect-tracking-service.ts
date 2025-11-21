export interface DefectReport {
  id: string;
  companyId: string;
  reportCode: string;
  reportName: string;
  defectType: 'design' | 'manufacturing' | 'material' | 'assembly' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  reportedBy: string;
  reportDate: Date;
  status: 'open' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
}

export interface DefectAction {
  id: string;
  defectReportId: string;
  actionCode: string;
  actionName: string;
  actionType: 'corrective' | 'preventive' | 'containment';
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface DefectMetrics {
  totalDefects: number;
  openDefects: number;
  resolvedDefects: number;
  closedDefects: number;
  totalActions: number;
  completedActions: number;
  averageResolutionTime: number;
  defectTrendScore: number;
}

export class DefectTrackingService {
  private defectReports: Map<string, DefectReport> = new Map();
  private defectActions: Map<string, DefectAction> = new Map();

  async createDefectReport(
    companyId: string,
    reportCode: string,
    reportName: string,
    defectType: 'design' | 'manufacturing' | 'material' | 'assembly' | 'other',
    severity: 'critical' | 'high' | 'medium' | 'low',
    description: string,
    reportedBy: string
  ): Promise<DefectReport> {
    const report: DefectReport = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      reportCode,
      reportName,
      defectType,
      severity,
      description,
      reportedBy,
      reportDate: new Date(),
      status: 'open',
      createdAt: new Date(),
    };

    this.defectReports.set(report.id, report);
    console.log(`Defect Report created: ${reportName}`);
    return report;
  }

  async createDefectAction(
    defectReportId: string,
    actionCode: string,
    actionName: string,
    actionType: 'corrective' | 'preventive' | 'containment',
    assignedTo: string,
    dueDate: Date
  ): Promise<DefectAction> {
    const action: DefectAction = {
      id: Math.random().toString(36).substr(2, 9),
      defectReportId,
      actionCode,
      actionName,
      actionType,
      assignedTo,
      dueDate,
      status: 'pending',
      createdAt: new Date(),
    };

    this.defectActions.set(action.id, action);
    console.log(`Defect Action created: ${actionName}`);
    return action;
  }

  async updateDefectStatus(
    reportId: string,
    status: 'open' | 'assigned' | 'in-progress' | 'resolved' | 'closed'
  ): Promise<DefectReport | null> {
    const report = this.defectReports.get(reportId);
    if (!report) return null;

    report.status = status;
    this.defectReports.set(reportId, report);
    console.log(`Defect status updated: ${reportId} -> ${status}`);
    return report;
  }

  async completeDefectAction(actionId: string): Promise<DefectAction | null> {
    const action = this.defectActions.get(actionId);
    if (!action) return null;

    action.status = 'completed';
    this.defectActions.set(actionId, action);
    console.log(`Defect Action completed: ${actionId}`);
    return action;
  }

  async getDefectMetrics(companyId: string): Promise<DefectMetrics> {
    const reports = Array.from(this.defectReports.values()).filter((r) => r.companyId === companyId);
    const openDefects = reports.filter((r) => r.status === 'open').length;
    const resolvedDefects = reports.filter((r) => r.status === 'resolved').length;
    const closedDefects = reports.filter((r) => r.status === 'closed').length;

    const actions = Array.from(this.defectActions.values());
    const completedActions = actions.filter((a) => a.status === 'completed').length;

    return {
      totalDefects: reports.length,
      openDefects,
      resolvedDefects,
      closedDefects,
      totalActions: actions.length,
      completedActions,
      averageResolutionTime: 4.5,
      defectTrendScore: 92.3,
    };
  }
}

export const defectTrackingService = new DefectTrackingService();

