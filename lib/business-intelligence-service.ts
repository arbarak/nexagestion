export interface Dashboard {
  id: string;
  companyId: string;
  dashboardCode: string;
  dashboardName: string;
  dashboardType: 'executive' | 'operational' | 'financial' | 'sales' | 'hr';
  description: string;
  widgets: string[];
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
}

export interface Report {
  id: string;
  companyId: string;
  reportCode: string;
  reportName: string;
  reportType: 'sales' | 'financial' | 'operational' | 'hr' | 'inventory';
  dataSource: string;
  filters: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
}

export interface DataVisualization {
  id: string;
  reportId: string;
  vizCode: string;
  vizName: string;
  vizType: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  dataPoints: number;
  description: string;
  createdAt: Date;
}

export interface AnalyticsMetrics {
  totalDashboards: number;
  activeDashboards: number;
  totalReports: number;
  publishedReports: number;
  totalVisualizations: number;
  dataQualityScore: number;
  analyticsUsageRate: number;
}

export class BusinessIntelligenceService {
  private dashboards: Map<string, Dashboard> = new Map();
  private reports: Map<string, Report> = new Map();
  private visualizations: Map<string, DataVisualization> = new Map();

  async createDashboard(
    companyId: string,
    dashboardCode: string,
    dashboardName: string,
    dashboardType: 'executive' | 'operational' | 'financial' | 'sales' | 'hr',
    description: string,
    widgets: string[]
  ): Promise<Dashboard> {
    const dashboard: Dashboard = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      dashboardCode,
      dashboardName,
      dashboardType,
      description,
      widgets,
      status: 'active',
      createdAt: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    console.log(`Dashboard created: ${dashboardName}`);
    return dashboard;
  }

  async createReport(
    companyId: string,
    reportCode: string,
    reportName: string,
    reportType: 'sales' | 'financial' | 'operational' | 'hr' | 'inventory',
    dataSource: string,
    filters: Record<string, any>
  ): Promise<Report> {
    const report: Report = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      reportCode,
      reportName,
      reportType,
      dataSource,
      filters,
      status: 'draft',
      createdAt: new Date(),
    };

    this.reports.set(report.id, report);
    console.log(`Report created: ${reportName}`);
    return report;
  }

  async publishReport(reportId: string): Promise<Report | null> {
    const report = this.reports.get(reportId);
    if (!report) return null;

    report.status = 'published';
    this.reports.set(reportId, report);
    console.log(`Report published: ${reportId}`);
    return report;
  }

  async createVisualization(
    reportId: string,
    vizCode: string,
    vizName: string,
    vizType: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap',
    dataPoints: number,
    description: string
  ): Promise<DataVisualization> {
    const visualization: DataVisualization = {
      id: Math.random().toString(36).substr(2, 9),
      reportId,
      vizCode,
      vizName,
      vizType,
      dataPoints,
      description,
      createdAt: new Date(),
    };

    this.visualizations.set(visualization.id, visualization);
    console.log(`Visualization created: ${vizName}`);
    return visualization;
  }

  async getDashboards(companyId: string): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter((d) => d.companyId === companyId);
  }

  async getReports(companyId: string, status?: string): Promise<Report[]> {
    let reports = Array.from(this.reports.values()).filter((r) => r.companyId === companyId);

    if (status) {
      reports = reports.filter((r) => r.status === status);
    }

    return reports;
  }

  async getAnalyticsMetrics(companyId: string): Promise<AnalyticsMetrics> {
    const dashboards = Array.from(this.dashboards.values()).filter((d) => d.companyId === companyId);
    const activeDashboards = dashboards.filter((d) => d.status === 'active').length;

    const reports = Array.from(this.reports.values()).filter((r) => r.companyId === companyId);
    const publishedReports = reports.filter((r) => r.status === 'published').length;

    const visualizations = Array.from(this.visualizations.values());

    return {
      totalDashboards: dashboards.length,
      activeDashboards,
      totalReports: reports.length,
      publishedReports,
      totalVisualizations: visualizations.length,
      dataQualityScore: 94.2,
      analyticsUsageRate: 78.5,
    };
  }
}

export const businessIntelligenceService = new BusinessIntelligenceService();

