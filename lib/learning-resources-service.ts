export interface LearningResource {
  id: string;
  companyId: string;
  resourceCode: string;
  resourceName: string;
  resourceType: 'video' | 'document' | 'course' | 'webinar' | 'tutorial';
  description: string;
  url: string;
  author: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
}

export interface LearningPath {
  id: string;
  companyId: string;
  pathCode: string;
  pathName: string;
  description: string;
  resourceIds: string[];
  targetAudience: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface UserLearning {
  id: string;
  userId: string;
  resourceId: string;
  learningCode: string;
  startDate: Date;
  completionDate?: Date;
  progress: number;
  status: 'started' | 'in-progress' | 'completed' | 'abandoned';
  createdAt: Date;
}

export interface LearningMetrics {
  totalResources: number;
  activeResources: number;
  totalPaths: number;
  activePaths: number;
  totalLearners: number;
  completedLearnings: number;
  averageProgress: number;
  learningEngagement: number;
}

export class LearningResourcesService {
  private resources: Map<string, LearningResource> = new Map();
  private paths: Map<string, LearningPath> = new Map();
  private userLearnings: Map<string, UserLearning> = new Map();

  async createResource(
    companyId: string,
    resourceCode: string,
    resourceName: string,
    resourceType: 'video' | 'document' | 'course' | 'webinar' | 'tutorial',
    description: string,
    url: string,
    author: string
  ): Promise<LearningResource> {
    const resource: LearningResource = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      resourceCode,
      resourceName,
      resourceType,
      description,
      url,
      author,
      status: 'active',
      createdAt: new Date(),
    };

    this.resources.set(resource.id, resource);
    console.log(`Learning Resource created: ${resourceName}`);
    return resource;
  }

  async createPath(
    companyId: string,
    pathCode: string,
    pathName: string,
    description: string,
    resourceIds: string[],
    targetAudience: string
  ): Promise<LearningPath> {
    const path: LearningPath = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      pathCode,
      pathName,
      description,
      resourceIds,
      targetAudience,
      status: 'active',
      createdAt: new Date(),
    };

    this.paths.set(path.id, path);
    console.log(`Learning Path created: ${pathName}`);
    return path;
  }

  async enrollUserInResource(
    userId: string,
    resourceId: string,
    learningCode: string
  ): Promise<UserLearning> {
    const userLearning: UserLearning = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      resourceId,
      learningCode,
      startDate: new Date(),
      progress: 0,
      status: 'started',
      createdAt: new Date(),
    };

    this.userLearnings.set(userLearning.id, userLearning);
    console.log(`User enrolled in resource: ${learningCode}`);
    return userLearning;
  }

  async completeUserLearning(learningId: string): Promise<UserLearning | null> {
    const learning = this.userLearnings.get(learningId);
    if (!learning) return null;

    learning.status = 'completed';
    learning.progress = 100;
    learning.completionDate = new Date();
    this.userLearnings.set(learningId, learning);
    console.log(`User learning completed: ${learningId}`);
    return learning;
  }

  async getLearningMetrics(companyId: string): Promise<LearningMetrics> {
    const resources = Array.from(this.resources.values()).filter((r) => r.companyId === companyId);
    const activeResources = resources.filter((r) => r.status === 'active').length;

    const paths = Array.from(this.paths.values()).filter((p) => p.companyId === companyId);
    const activePaths = paths.filter((p) => p.status === 'active').length;

    const learnings = Array.from(this.userLearnings.values());
    const completedLearnings = learnings.filter((l) => l.status === 'completed').length;
    const avgProgress = learnings.length > 0
      ? learnings.reduce((sum, l) => sum + l.progress, 0) / learnings.length
      : 0;

    return {
      totalResources: resources.length,
      activeResources,
      totalPaths: paths.length,
      activePaths,
      totalLearners: learnings.length,
      completedLearnings,
      averageProgress: avgProgress,
      learningEngagement: 85.4,
    };
  }
}

export const learningResourcesService = new LearningResourcesService();

