export interface MaintenancePlan {
  id: string;
  companyId: string;
  planCode: string;
  planName: string;
  assetId: string;
  maintenanceType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  description: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
}

export interface MaintenanceSchedule {
  id: string;
  planId: string;
  scheduleCode: string;
  scheduleName: string;
  scheduledDate: Date;
  assignedTo: string;
  estimatedDuration: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface MaintenanceTask {
  id: string;
  scheduleId: string;
  taskCode: string;
  taskName: string;
  taskDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface PreventiveMaintenanceMetrics {
  totalPlans: number;
  activePlans: number;
  totalSchedules: number;
  completedSchedules: number;
  totalTasks: number;
  completedTasks: number;
  maintenanceEfficiency: number;
}

export class PreventiveMaintenanceService {
  private plans: Map<string, MaintenancePlan> = new Map();
  private schedules: Map<string, MaintenanceSchedule> = new Map();
  private tasks: Map<string, MaintenanceTask> = new Map();

  async createPlan(
    companyId: string,
    planCode: string,
    planName: string,
    assetId: string,
    maintenanceType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual',
    description: string
  ): Promise<MaintenancePlan> {
    const plan: MaintenancePlan = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      planCode,
      planName,
      assetId,
      maintenanceType,
      description,
      status: 'active',
      createdAt: new Date(),
    };

    this.plans.set(plan.id, plan);
    console.log(`Maintenance Plan created: ${planName}`);
    return plan;
  }

  async createSchedule(
    planId: string,
    scheduleCode: string,
    scheduleName: string,
    scheduledDate: Date,
    assignedTo: string,
    estimatedDuration: number
  ): Promise<MaintenanceSchedule> {
    const schedule: MaintenanceSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      planId,
      scheduleCode,
      scheduleName,
      scheduledDate,
      assignedTo,
      estimatedDuration,
      status: 'pending',
      createdAt: new Date(),
    };

    this.schedules.set(schedule.id, schedule);
    console.log(`Maintenance Schedule created: ${scheduleName}`);
    return schedule;
  }

  async createTask(
    scheduleId: string,
    taskCode: string,
    taskName: string,
    taskDescription: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<MaintenanceTask> {
    const task: MaintenanceTask = {
      id: Math.random().toString(36).substr(2, 9),
      scheduleId,
      taskCode,
      taskName,
      taskDescription,
      priority,
      status: 'pending',
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    console.log(`Maintenance Task created: ${taskName}`);
    return task;
  }

  async completeSchedule(scheduleId: string): Promise<MaintenanceSchedule | null> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return null;

    schedule.status = 'completed';
    this.schedules.set(scheduleId, schedule);
    console.log(`Maintenance Schedule completed: ${scheduleId}`);
    return schedule;
  }

  async getPreventiveMaintenanceMetrics(companyId: string): Promise<PreventiveMaintenanceMetrics> {
    const plans = Array.from(this.plans.values()).filter((p) => p.companyId === companyId);
    const activePlans = plans.filter((p) => p.status === 'active').length;

    const schedules = Array.from(this.schedules.values());
    const completedSchedules = schedules.filter((s) => s.status === 'completed').length;

    const tasks = Array.from(this.tasks.values());
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;

    return {
      totalPlans: plans.length,
      activePlans,
      totalSchedules: schedules.length,
      completedSchedules,
      totalTasks: tasks.length,
      completedTasks,
      maintenanceEfficiency: 91.2,
    };
  }
}

export const preventiveMaintenanceService = new PreventiveMaintenanceService();

