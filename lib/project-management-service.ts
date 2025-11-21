export interface Project {
  id: string;
  companyId: string;
  projectCode: string;
  projectName: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  budget: number;
  manager: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  taskCode: string;
  taskName: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  dueDate: Date;
  completionPercentage: number;
  createdAt: Date;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  milestoneCode: string;
  milestoneName: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'achieved' | 'delayed';
  deliverables: string[];
  createdAt: Date;
}

export interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalBudget: number;
  budgetUtilization: number;
  onTimeDeliveryRate: number;
}

export class ProjectManagementService {
  private projects: Map<string, Project> = new Map();
  private tasks: Map<string, ProjectTask> = new Map();
  private milestones: Map<string, ProjectMilestone> = new Map();

  async createProject(
    companyId: string,
    projectCode: string,
    projectName: string,
    description: string,
    startDate: Date,
    endDate: Date,
    budget: number,
    manager: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<Project> {
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      projectCode,
      projectName,
      description,
      status: 'planning',
      startDate,
      endDate,
      budget,
      manager,
      priority,
      createdAt: new Date(),
    };

    this.projects.set(project.id, project);
    console.log(`Project created: ${projectName}`);
    return project;
  }

  async createTask(
    projectId: string,
    taskCode: string,
    taskName: string,
    description: string,
    assignedTo: string,
    priority: 'low' | 'medium' | 'high',
    startDate: Date,
    dueDate: Date
  ): Promise<ProjectTask> {
    const task: ProjectTask = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      taskCode,
      taskName,
      description,
      assignedTo,
      status: 'pending',
      priority,
      startDate,
      dueDate,
      completionPercentage: 0,
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    console.log(`Task created: ${taskName}`);
    return task;
  }

  async updateTaskProgress(taskId: string, completionPercentage: number): Promise<ProjectTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.completionPercentage = completionPercentage;
    if (completionPercentage === 100) {
      task.status = 'completed';
    } else if (completionPercentage > 0) {
      task.status = 'in-progress';
    }

    this.tasks.set(taskId, task);
    console.log(`Task progress updated: ${taskId}`);
    return task;
  }

  async createMilestone(
    projectId: string,
    milestoneCode: string,
    milestoneName: string,
    description: string,
    targetDate: Date,
    deliverables: string[]
  ): Promise<ProjectMilestone> {
    const milestone: ProjectMilestone = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      milestoneCode,
      milestoneName,
      description,
      targetDate,
      status: 'pending',
      deliverables,
      createdAt: new Date(),
    };

    this.milestones.set(milestone.id, milestone);
    console.log(`Milestone created: ${milestoneName}`);
    return milestone;
  }

  async getProjects(companyId: string, status?: string): Promise<Project[]> {
    let projects = Array.from(this.projects.values()).filter((p) => p.companyId === companyId);

    if (status) {
      projects = projects.filter((p) => p.status === status);
    }

    return projects;
  }

  async getProjectTasks(projectId?: string): Promise<ProjectTask[]> {
    let tasks = Array.from(this.tasks.values());

    if (projectId) {
      tasks = tasks.filter((t) => t.projectId === projectId);
    }

    return tasks;
  }

  async getProjectMetrics(companyId: string): Promise<ProjectMetrics> {
    const projects = Array.from(this.projects.values()).filter((p) => p.companyId === companyId);
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

    const tasks = Array.from(this.tasks.values());
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalTasks: tasks.length,
      completedTasks,
      taskCompletionRate,
      totalBudget,
      budgetUtilization: 75.5,
      onTimeDeliveryRate: 88.0,
    };
  }
}

export const projectManagementService = new ProjectManagementService();

