export interface TestCase {
  id: string;
  companyId: string;
  name: string;
  description: string;
  module: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'deprecated';
  steps: string[];
  expectedResult: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestExecution {
  id: string;
  testCaseId: string;
  executedBy: string;
  executionDate: Date;
  result: 'passed' | 'failed' | 'blocked' | 'skipped';
  notes: string;
  duration: number;
  environment: string;
}

export interface BugReport {
  id: string;
  companyId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  reportedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSuite {
  id: string;
  companyId: string;
  name: string;
  description: string;
  testCaseIds: string[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  createdAt: Date;
}

export class QAService {
  private testCases: Map<string, TestCase> = new Map();
  private testExecutions: TestExecution[] = [];
  private bugReports: Map<string, BugReport> = new Map();
  private testSuites: Map<string, TestSuite> = new Map();

  async createTestCase(
    companyId: string,
    name: string,
    description: string,
    module: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    steps: string[],
    expectedResult: string,
    createdBy: string
  ): Promise<TestCase> {
    const testCase: TestCase = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      description,
      module,
      priority,
      status: 'draft',
      steps,
      expectedResult,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.testCases.set(testCase.id, testCase);
    console.log(`Test case created: ${name}`);
    return testCase;
  }

  async executeTestCase(
    testCaseId: string,
    executedBy: string,
    result: 'passed' | 'failed' | 'blocked' | 'skipped',
    notes: string,
    duration: number,
    environment: string
  ): Promise<TestExecution> {
    const execution: TestExecution = {
      id: Math.random().toString(36).substr(2, 9),
      testCaseId,
      executedBy,
      executionDate: new Date(),
      result,
      notes,
      duration,
      environment,
    };

    this.testExecutions.push(execution);
    console.log(`Test executed: ${testCaseId} - ${result}`);
    return execution;
  }

  async reportBug(
    companyId: string,
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    reportedBy: string
  ): Promise<BugReport> {
    const bug: BugReport = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      title,
      description,
      severity,
      status: 'open',
      reportedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.bugReports.set(bug.id, bug);
    console.log(`Bug reported: ${title}`);
    return bug;
  }

  async assignBug(bugId: string, assignedTo: string): Promise<BugReport | null> {
    const bug = this.bugReports.get(bugId);
    if (!bug) return null;

    bug.assignedTo = assignedTo;
    bug.status = 'in-progress';
    bug.updatedAt = new Date();
    this.bugReports.set(bugId, bug);
    console.log(`Bug assigned: ${bugId}`);
    return bug;
  }

  async resolveBug(bugId: string): Promise<BugReport | null> {
    const bug = this.bugReports.get(bugId);
    if (!bug) return null;

    bug.status = 'resolved';
    bug.updatedAt = new Date();
    this.bugReports.set(bugId, bug);
    console.log(`Bug resolved: ${bugId}`);
    return bug;
  }

  async getTestCases(companyId: string, module?: string): Promise<TestCase[]> {
    let cases = Array.from(this.testCases.values()).filter(
      (tc) => tc.companyId === companyId
    );

    if (module) {
      cases = cases.filter((tc) => tc.module === module);
    }

    return cases;
  }

  async getBugReports(companyId: string, status?: string): Promise<BugReport[]> {
    let bugs = Array.from(this.bugReports.values()).filter(
      (b) => b.companyId === companyId
    );

    if (status) {
      bugs = bugs.filter((b) => b.status === status);
    }

    return bugs;
  }

  async getQAMetrics(companyId: string): Promise<{
    totalTestCases: number;
    activeTestCases: number;
    totalExecutions: number;
    passRate: number;
    openBugs: number;
    resolvedBugs: number;
    criticalBugs: number;
  }> {
    const testCases = Array.from(this.testCases.values()).filter(
      (tc) => tc.companyId === companyId
    );
    const activeTestCases = testCases.filter((tc) => tc.status === 'active').length;

    const executions = this.testExecutions.filter((e) =>
      testCases.some((tc) => tc.id === e.testCaseId)
    );
    const passedExecutions = executions.filter((e) => e.result === 'passed').length;
    const passRate = executions.length > 0 ? (passedExecutions / executions.length) * 100 : 0;

    const bugs = Array.from(this.bugReports.values()).filter(
      (b) => b.companyId === companyId
    );
    const openBugs = bugs.filter((b) => b.status === 'open').length;
    const resolvedBugs = bugs.filter((b) => b.status === 'resolved').length;
    const criticalBugs = bugs.filter((b) => b.severity === 'critical').length;

    return {
      totalTestCases: testCases.length,
      activeTestCases,
      totalExecutions: executions.length,
      passRate,
      openBugs,
      resolvedBugs,
      criticalBugs,
    };
  }
}

export const qaService = new QAService();

