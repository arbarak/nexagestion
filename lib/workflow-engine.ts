export interface WorkflowStep {
  id: string;
  type: string;
  config: Record<string, any>;
}

export interface WorkflowContext {
  workflowId: string;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  variables: Record<string, any>;
}

export interface WorkflowResult {
  success: boolean;
  stepResults: Array<{ stepId: string; status: string; result?: any; error?: string }>;
  completedAt: Date;
}

export class WorkflowEngine {
  private stepHandlers: Map<string, (config: any, context: WorkflowContext) => Promise<any>> = new Map();

  registerStepHandler(type: string, handler: (config: any, context: WorkflowContext) => Promise<any>) {
    this.stepHandlers.set(type, handler);
  }

  async executeWorkflow(steps: WorkflowStep[], context: WorkflowContext): Promise<WorkflowResult> {
    const stepResults: Array<{ stepId: string; status: string; result?: any; error?: string }> = [];

    for (const step of steps) {
      try {
        const handler = this.stepHandlers.get(step.type);
        if (!handler) {
          throw new Error(`No handler registered for step type: ${step.type}`);
        }

        const result = await handler(step.config, context);
        stepResults.push({
          stepId: step.id,
          status: 'completed',
          result,
        });

        // Update context variables for next steps
        if (result && typeof result === 'object') {
          context.variables = { ...context.variables, ...result };
        }
      } catch (error) {
        stepResults.push({
          stepId: step.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        // Stop execution on error
        break;
      }
    }

    return {
      success: stepResults.every((r) => r.status === 'completed'),
      stepResults,
      completedAt: new Date(),
    };
  }
}

export const defaultStepHandlers = {
  send_notification: async (config: any, context: WorkflowContext) => {
    // Send notification logic
    return { notificationId: `notif_${Date.now()}` };
  },

  create_task: async (config: any, context: WorkflowContext) => {
    // Create task logic
    return { taskId: `task_${Date.now()}` };
  },

  send_email: async (config: any, context: WorkflowContext) => {
    // Send email logic
    return { emailId: `email_${Date.now()}` };
  },

  update_entity: async (config: any, context: WorkflowContext) => {
    // Update entity logic
    return { updated: true };
  },

  create_approval: async (config: any, context: WorkflowContext) => {
    // Create approval logic
    return { approvalId: `approval_${Date.now()}` };
  },

  conditional_branch: async (config: any, context: WorkflowContext) => {
    // Conditional logic
    const condition = config.condition;
    const result = eval(condition.replace(/\{(\w+)\}/g, (match: string, key: string) => context.variables[key]));
    return { conditionMet: result };
  },
};

export function createWorkflowEngine(): WorkflowEngine {
  const engine = new WorkflowEngine();

  // Register default handlers
  Object.entries(defaultStepHandlers).forEach(([type, handler]) => {
    engine.registerStepHandler(type, handler);
  });

  return engine;
}

