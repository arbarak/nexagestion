export interface AutomationScript {
  id: string;
  companyId: string;
  name: string;
  description: string;
  scriptType: 'selenium' | 'cypress' | 'playwright' | 'appium';
  testCaseId: string;
  scriptContent: string;
  status: 'draft' | 'active' | 'deprecated';
  createdBy: string;
  createdAt: Date;
}

export interface AutomationRun {
  id: string;
  scriptId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'passed' | 'failed' | 'error';
  duration?: number;
  successRate: number;
  logs: string;
}

export interface TestReport {
  id: string;
  companyId: string;
  name: string;
  executionDate: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  passRate: number;
  duration: number;
  environment: string;
}

export class TestAutomationService {
  private scripts: Map<string, AutomationScript> = new Map();
  private runs: AutomationRun[] = [];
  private reports: TestReport[] = [];

  async createAutomationScript(
    companyId: string,
    name: string,
    description: string,
    scriptType: 'selenium' | 'cypress' | 'playwright' | 'appium',
    testCaseId: string,
    scriptContent: string,
    createdBy: string
  ): Promise<AutomationScript> {
    const script: AutomationScript = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      description,
      scriptType,
      testCaseId,
      scriptContent,
      status: 'draft',
      createdBy,
      createdAt: new Date(),
    };

    this.scripts.set(script.id, script);
    console.log(`Automation script created: ${name}`);
    return script;
  }

  async runAutomationScript(
    scriptId: string,
    successRate: number,
    logs: string
  ): Promise<AutomationRun> {
    const run: AutomationRun = {
      id: Math.random().toString(36).substr(2, 9),
      scriptId,
      startTime: new Date(),
      status: successRate === 100 ? 'passed' : 'failed',
      successRate,
      logs,
    };

    this.runs.push(run);
    console.log(`Automation run completed: ${scriptId}`);
    return run;
  }

  async generateTestReport(
    companyId: string,
    name: string,
    totalTests: number,
    passedTests: number,
    failedTests: number,
    skippedTests: number,
    duration: number,
    environment: string
  ): Promise<TestReport> {
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const report: TestReport = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      executionDate: new Date(),
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      passRate,
      duration,
      environment,
    };

    this.reports.push(report);
    console.log(`Test report generated: ${name}`);
    return report;
  }

  async getAutomationScripts(companyId: string, scriptType?: string): Promise<AutomationScript[]> {
    let scripts = Array.from(this.scripts.values()).filter(
      (s) => s.companyId === companyId
    );

    if (scriptType) {
      scripts = scripts.filter((s) => s.scriptType === scriptType);
    }

    return scripts;
  }

  async getAutomationRuns(scriptId: string, limit: number = 10): Promise<AutomationRun[]> {
    return this.runs
      .filter((r) => r.scriptId === scriptId)
      .slice(-limit);
  }

  async getTestReports(companyId: string, limit: number = 12): Promise<TestReport[]> {
    return this.reports
      .filter((r) => r.companyId === companyId)
      .slice(-limit);
  }

  async getAutomationMetrics(companyId: string): Promise<{
    totalScripts: number;
    activeScripts: number;
    totalRuns: number;
    averageSuccessRate: number;
    totalReports: number;
  }> {
    const scripts = Array.from(this.scripts.values()).filter(
      (s) => s.companyId === companyId
    );
    const activeScripts = scripts.filter((s) => s.status === 'active').length;

    const scriptIds = new Set(scripts.map((s) => s.id));
    const runs = this.runs.filter((r) => scriptIds.has(r.scriptId));
    const averageSuccessRate = runs.length > 0
      ? runs.reduce((sum, r) => sum + r.successRate, 0) / runs.length
      : 0;

    const reports = this.reports.filter((r) => r.companyId === companyId);

    return {
      totalScripts: scripts.length,
      activeScripts,
      totalRuns: runs.length,
      averageSuccessRate,
      totalReports: reports.length,
    };
  }
}

export const testAutomationService = new TestAutomationService();

