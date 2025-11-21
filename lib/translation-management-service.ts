export interface TranslationProject {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguages: string[];
  completionPercentage: Record<string, number>;
  status: 'draft' | 'in-progress' | 'review' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationMemory {
  id: string;
  companyId: string;
  sourceText: string;
  targetText: string;
  language: string;
  frequency: number;
  lastUsed: Date;
}

export class TranslationManagementService {
  private projects: Map<string, TranslationProject> = new Map();
  private memories: Map<string, TranslationMemory> = new Map();

  async createProject(
    companyId: string,
    name: string,
    sourceLanguage: string,
    targetLanguages: string[],
    description?: string
  ): Promise<TranslationProject> {
    const project: TranslationProject = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      description,
      sourceLanguage,
      targetLanguages,
      completionPercentage: {},
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    targetLanguages.forEach(lang => {
      project.completionPercentage[lang] = 0;
    });

    this.projects.set(project.id, project);
    console.log(`Created translation project: ${name}`);
    return project;
  }

  async getProject(companyId: string, projectId: string): Promise<TranslationProject | null> {
    const project = this.projects.get(projectId);
    if (project && project.companyId === companyId) {
      return project;
    }
    return null;
  }

  async getProjects(companyId: string, status?: string): Promise<TranslationProject[]> {
    const projects = Array.from(this.projects.values()).filter((p) => {
      if (p.companyId !== companyId) return false;
      if (status && p.status !== status) return false;
      return true;
    });
    return projects;
  }

  async updateProjectStatus(
    companyId: string,
    projectId: string,
    status: TranslationProject['status']
  ): Promise<TranslationProject | null> {
    const project = this.projects.get(projectId);
    if (!project || project.companyId !== companyId) {
      return null;
    }

    project.status = status;
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    console.log(`Updated project status: ${projectId} -> ${status}`);
    return project;
  }

  async updateCompletionPercentage(
    companyId: string,
    projectId: string,
    language: string,
    percentage: number
  ): Promise<TranslationProject | null> {
    const project = this.projects.get(projectId);
    if (!project || project.companyId !== companyId) {
      return null;
    }

    project.completionPercentage[language] = Math.min(100, Math.max(0, percentage));
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    return project;
  }

  async deleteProject(companyId: string, projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (project && project.companyId === companyId) {
      this.projects.delete(projectId);
      console.log(`Deleted project: ${projectId}`);
    }
  }

  async addToMemory(
    companyId: string,
    sourceText: string,
    targetText: string,
    language: string
  ): Promise<TranslationMemory> {
    const id = `${language}-${sourceText}`;
    let memory = this.memories.get(id);

    if (memory && memory.companyId === companyId) {
      memory.frequency++;
      memory.lastUsed = new Date();
    } else {
      memory = {
        id,
        companyId,
        sourceText,
        targetText,
        language,
        frequency: 1,
        lastUsed: new Date(),
      };
    }

    this.memories.set(id, memory);
    return memory;
  }

  async getMemoryMatches(
    companyId: string,
    sourceText: string,
    language: string,
    threshold: number = 0.8
  ): Promise<TranslationMemory[]> {
    const matches: TranslationMemory[] = [];

    for (const [, memory] of this.memories) {
      if (memory.companyId !== companyId || memory.language !== language) continue;

      const similarity = this.calculateSimilarity(sourceText, memory.sourceText);
      if (similarity >= threshold) {
        matches.push(memory);
      }
    }

    return matches.sort((a, b) => b.frequency - a.frequency);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private getEditDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  async getMemoryStats(companyId: string): Promise<{
    totalMemories: number;
    languageStats: Record<string, number>;
    topMatches: TranslationMemory[];
  }> {
    let totalMemories = 0;
    const languageStats: Record<string, number> = {};
    const topMatches: TranslationMemory[] = [];

    for (const [, memory] of this.memories) {
      if (memory.companyId === companyId) {
        totalMemories++;
        languageStats[memory.language] = (languageStats[memory.language] || 0) + 1;
        topMatches.push(memory);
      }
    }

    topMatches.sort((a, b) => b.frequency - a.frequency);

    return {
      totalMemories,
      languageStats,
      topMatches: topMatches.slice(0, 10),
    };
  }
}

export const translationManagementService = new TranslationManagementService();

