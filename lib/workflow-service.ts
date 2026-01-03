import { prisma } from './prisma';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'approval' | 'notification' | 'webhook';
  config: Record<string, any>;
  nextStepId?: string;
  conditions?: Array<{ field: string; operator: string; value: any }>;
}

export interface Workflow {
  id: string;
  companyId: string;
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  entityId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export class WorkflowService {
  /**
   * Create a new workflow
   */
  async createWorkflow(
    companyId: string,
    data: {
      name: string;
      description?: string;
      trigger: string;
      steps: WorkflowStep[];
      enabled?: boolean;
    }
  ): Promise<any> {
    return await prisma.workflow.create({
      data: {
        companyId,
        name: data.name,
        description: data.description || '',
        trigger: data.trigger,
        steps: data.steps,
        enabled: data.enabled !== false,
        createdBy: 'system',
      },
    });
  }

  /**
   * Get all workflows for a company
   */
  async getWorkflows(companyId: string): Promise<any[]> {
    return await prisma.workflow.findMany({
      where: { companyId },
    });
  }

  /**
   * Get a specific workflow
   */
  async getWorkflow(companyId: string, workflowId: string): Promise<any> {
    return await prisma.workflow.findUnique({
      where: { id: workflowId },
    });
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(
    companyId: string,
    workflowId: string,
    updates: Partial<Workflow>
  ): Promise<any> {
    return await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.steps && { steps: updates.steps }),
        ...(updates.enabled !== undefined && { enabled: updates.enabled }),
      },
    });
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(companyId: string, workflowId: string): Promise<void> {
    await prisma.workflow.delete({
      where: { id: workflowId },
    });
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    entityId: string,
    data: Record<string, any>
  ): Promise<WorkflowExecution> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (!workflow.enabled) {
      throw new Error(`Workflow ${workflowId} is disabled`);
    }

    const execution: WorkflowExecution = {
      id: 'exec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      workflowId,
      entityId,
      status: 'running',
      currentStep: 0,
      startedAt: new Date(),
    };

    try {
      const steps = Array.isArray(workflow.steps) ? workflow.steps : JSON.parse(String(workflow.steps) || '[]');

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        execution.currentStep = i;

        try {
          await this.executeStep(step, data, workflow.companyId, entityId);
        } catch (stepError) {
          console.error(`Step ${step.name} failed:`, stepError);
          execution.status = 'failed';
          execution.error = `Failed at step ${step.name}: ${String(stepError)}`;
          execution.completedAt = new Date();
          return execution;
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.error = String(error);
      execution.completedAt = new Date();
    }

    return execution;
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    data: Record<string, any>,
    companyId: string,
    entityId: string
  ): Promise<void> {
    switch (step.type) {
      case 'action':
        await this.executeAction(step, data, companyId, entityId);
        break;
      case 'condition':
        await this.evaluateCondition(step, data);
        break;
      case 'approval':
        await this.createApprovalTask(step, data, companyId, entityId);
        break;
      case 'notification':
        await this.sendNotification(step, data, companyId);
        break;
      case 'webhook':
        await this.callWebhook(step, data);
        break;
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute an action step
   */
  private async executeAction(
    step: WorkflowStep,
    data: Record<string, any>,
    companyId: string,
    entityId: string
  ): Promise<void> {
    const { actionType, actionConfig } = step.config;

    switch (actionType) {
      case 'create_task':
        await prisma.task.create({
          data: {
            companyId,
            title: actionConfig.title || step.name,
            description: actionConfig.description || '',
            status: 'PENDING',
            priority: actionConfig.priority || 'MEDIUM',
            assignedTo: actionConfig.assignedTo,
          },
        });
        break;

      case 'update_entity':
        // Generic update based on entity type and fields
        console.log(`Updating entity ${entityId} with:`, actionConfig.updates);
        break;

      case 'send_email':
        console.log(`Sending email to ${actionConfig.recipient} with subject: ${actionConfig.subject}`);
        break;

      default:
        console.log(`Unknown action type: ${actionType}`);
    }
  }

  /**
   * Evaluate a condition step
   */
  private async evaluateCondition(
    step: WorkflowStep,
    data: Record<string, any>
  ): Promise<void> {
    if (!step.conditions || step.conditions.length === 0) {
      return;
    }

    for (const condition of step.conditions) {
      const { field, operator, value } = condition;
      const fieldValue = data[field];

      let conditionMet = false;

      switch (operator) {
        case 'equals':
          conditionMet = fieldValue === value;
          break;
        case 'not_equals':
          conditionMet = fieldValue !== value;
          break;
        case 'greater_than':
          conditionMet = fieldValue > value;
          break;
        case 'less_than':
          conditionMet = fieldValue < value;
          break;
        case 'contains':
          conditionMet = String(fieldValue).includes(String(value));
          break;
        case 'in':
          conditionMet = Array.isArray(value) && value.includes(fieldValue);
          break;
        default:
          throw new Error(`Unknown operator: ${operator}`);
      }

      if (!conditionMet) {
        throw new Error(`Condition failed: ${field} ${operator} ${value}`);
      }
    }
  }

  /**
   * Create an approval task
   */
  private async createApprovalTask(
    step: WorkflowStep,
    data: Record<string, any>,
    companyId: string,
    entityId: string
  ): Promise<void> {
    const { approverId, approvalTitle } = step.config;

    await prisma.approval.create({
      data: {
        companyId,
        entityId,
        entityType: data.entityType || 'SALE',
        status: 'PENDING',
        approverUserId: approverId,
        requestedAt: new Date(),
        notes: approvalTitle || step.name,
      },
    });
  }

  /**
   * Send notification
   */
  private async sendNotification(
    step: WorkflowStep,
    data: Record<string, any>,
    companyId: string
  ): Promise<void> {
    const { recipients, notificationTitle, notificationMessage } = step.config;

    for (const recipientId of recipients || []) {
      await prisma.notification.create({
        data: {
          companyId,
          userId: recipientId,
          title: notificationTitle || step.name,
          message: notificationMessage || JSON.stringify(data),
          type: 'WORKFLOW',
          status: 'UNREAD',
          createdAt: new Date(),
        },
      });
    }
  }

  /**
   * Call webhook
   */
  private async callWebhook(step: WorkflowStep, data: Record<string, any>): Promise<void> {
    const { url, method = 'POST', headers = {} } = step.config;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`Webhook call failed:`, error);
      throw error;
    }
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(workflowId: string): Promise<WorkflowExecution[]> {
    // Since we're storing executions in memory or logs for now,
    // return a placeholder. In production, this would query a WorkflowExecution table
    return [];
  }

  /**
   * Create a multi-level approval workflow
   */
  async createApprovalWorkflow(
    companyId: string,
    name: string,
    approvers: string[]
  ): Promise<any> {
    const steps: WorkflowStep[] = approvers.map((approver, index) => ({
      id: `step-${index}`,
      name: `Approval by ${approver}`,
      type: 'approval',
      config: { approverId: approver },
      nextStepId: index < approvers.length - 1 ? `step-${index + 1}` : undefined,
    }));

    return this.createWorkflow(companyId, {
      name,
      description: `Multi-level approval workflow with ${approvers.length} approvers`,
      trigger: 'manual',
      steps,
      enabled: true,
    });
  }

  /**
   * Create a notification workflow
   */
  async createNotificationWorkflow(
    companyId: string,
    name: string,
    recipients: string[]
  ): Promise<any> {
    const steps: WorkflowStep[] = [{
      id: 'notify',
      name: 'Send Notifications',
      type: 'notification',
      config: { recipients },
    }];

    return this.createWorkflow(companyId, {
      name,
      description: `Notification workflow for ${recipients.length} recipients`,
      trigger: 'event',
      steps,
      enabled: true,
    });
  }

  /**
   * Create a conditional workflow
   */
  async createConditionalWorkflow(
    companyId: string,
    name: string,
    conditions: Array<{ field: string; operator: string; value: any }>
  ): Promise<any> {
    const steps: WorkflowStep[] = [{
      id: 'condition',
      name: 'Check Conditions',
      type: 'condition',
      config: {},
      conditions,
    }];

    return this.createWorkflow(companyId, {
      name,
      description: `Conditional workflow with ${conditions.length} conditions`,
      trigger: 'event',
      steps,
      enabled: true,
    });
  }
}

export const workflowService = new WorkflowService();

