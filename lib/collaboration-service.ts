export interface CollaborationProject {
  id: string;
  companyId: string;
  projectCode: string;
  projectName: string;
  projectDescription: string;
  teamMembers: string[];
  status: 'planning' | 'active' | 'completed' | 'archived';
  createdAt: Date;
}

export interface CollaborationTask {
  id: string;
  projectId: string;
  taskCode: string;
  taskName: string;
  taskDescription: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  createdAt: Date;
}

export interface CollaborationComment {
  id: string;
  taskId: string;
  commentCode: string;
  commentText: string;
  author: string;
  createdAt: Date;
}

export interface CollaborationMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  collaborationScore: number;
}

export class CollaborationService {
  private projects: Map<string, CollaborationProject> = new Map();
  private tasks: Map<string, CollaborationTask> = new Map();
  private comments: Map<string, CollaborationComment> = new Map();

  async createProject(
    companyId: string,
    projectCode: string,
    projectName: string,
    projectDescription: string,
    teamMembers: string[]
  ): Promise<CollaborationProject> {
    const project: CollaborationProject = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      projectCode,
      projectName,
      projectDescription,
      teamMembers,
      status: 'planning',
      createdAt: new Date(),
    };

    this.projects.set(project.id, project);
    console.log(`Collaboration Project created: ${projectName}`);
    return project;
  }

  async createTask(
    projectId: string,
    taskCode: string,
    taskName: string,
    taskDescription: string,
    assignedTo: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<CollaborationTask> {
    const task: CollaborationTask = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      taskCode,
      taskName,
      taskDescription,
      assignedTo,
      priority,
      status: 'pending',
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    console.log(`Collaboration Task created: ${taskName}`);
    return task;
  }

  async addComment(
    taskId: string,
    commentCode: string,
    commentText: string,
    author: string
  ): Promise<CollaborationComment> {
    const comment: CollaborationComment = {
      id: Math.random().toString(36).substr(2, 9),
      taskId,
      commentCode,
      commentText,
      author,
      createdAt: new Date(),
    };

    this.comments.set(comment.id, comment);
    console.log(`Comment added: ${commentCode}`);
    return comment;
  }

  async completeTask(taskId: string): Promise<CollaborationTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = 'completed';
    this.tasks.set(taskId, task);
    console.log(`Task completed: ${taskId}`);
    return task;
  }

  async getCollaborationMetrics(companyId: string): Promise<CollaborationMetrics> {
    const projects = Array.from(this.projects.values()).filter((p) => p.companyId === companyId);
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

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
      collaborationScore: 87.6,
    };
  }
}

export const collaborationService = new CollaborationService();

