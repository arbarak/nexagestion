export interface Skill {
  id: string;
  companyId: string;
  skillName: string;
  category: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  createdAt: Date;
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  skillId: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  lastAssessmentDate: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface SkillGap {
  id: string;
  employeeId: string;
  requiredSkillId: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  gapLevel: number;
  trainingRecommended: string;
  createdAt: Date;
}

export interface DevelopmentPlan {
  id: string;
  employeeId: string;
  planName: string;
  objectives: string[];
  targetSkills: string[];
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed';
  progressPercentage: number;
  createdAt: Date;
}

export interface SkillsMetrics {
  totalSkills: number;
  employeesWithSkills: number;
  averageProficiency: number;
  skillGapsIdentified: number;
  developmentPlansActive: number;
  completedPlans: number;
  averageGapLevel: number;
}

export class SkillsDevelopmentService {
  private skills: Map<string, Skill> = new Map();
  private employeeSkills: Map<string, EmployeeSkill> = new Map();
  private skillGaps: Map<string, SkillGap> = new Map();
  private developmentPlans: Map<string, DevelopmentPlan> = new Map();

  async createSkill(
    companyId: string,
    skillName: string,
    category: string,
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    description: string
  ): Promise<Skill> {
    const skill: Skill = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      skillName,
      category,
      proficiencyLevel,
      description,
      createdAt: new Date(),
    };

    this.skills.set(skill.id, skill);
    console.log(`Skill created: ${skillName}`);
    return skill;
  }

  async assignEmployeeSkill(
    employeeId: string,
    skillId: string,
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    yearsOfExperience: number
  ): Promise<EmployeeSkill> {
    const employeeSkill: EmployeeSkill = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      skillId,
      proficiencyLevel,
      yearsOfExperience,
      lastAssessmentDate: new Date(),
      status: 'active',
      createdAt: new Date(),
    };

    this.employeeSkills.set(employeeSkill.id, employeeSkill);
    console.log(`Employee skill assigned: ${employeeId}`);
    return employeeSkill;
  }

  async identifySkillGap(
    employeeId: string,
    requiredSkillId: string,
    currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  ): Promise<SkillGap> {
    const levelMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const gapLevel = levelMap[requiredLevel] - levelMap[currentLevel];

    const gap: SkillGap = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      requiredSkillId,
      currentLevel,
      requiredLevel,
      gapLevel: Math.max(0, gapLevel),
      trainingRecommended: gapLevel > 0 ? 'Yes' : 'No',
      createdAt: new Date(),
    };

    this.skillGaps.set(gap.id, gap);
    console.log(`Skill gap identified: ${employeeId}`);
    return gap;
  }

  async createDevelopmentPlan(
    employeeId: string,
    planName: string,
    objectives: string[],
    targetSkills: string[],
    startDate: Date,
    endDate: Date
  ): Promise<DevelopmentPlan> {
    const plan: DevelopmentPlan = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      planName,
      objectives,
      targetSkills,
      startDate,
      endDate,
      status: 'draft',
      progressPercentage: 0,
      createdAt: new Date(),
    };

    this.developmentPlans.set(plan.id, plan);
    console.log(`Development plan created: ${planName}`);
    return plan;
  }

  async getSkills(companyId: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter((s) => s.companyId === companyId);
  }

  async getEmployeeSkills(employeeId?: string): Promise<EmployeeSkill[]> {
    let skills = Array.from(this.employeeSkills.values());

    if (employeeId) {
      skills = skills.filter((s) => s.employeeId === employeeId);
    }

    return skills;
  }

  async getSkillGaps(employeeId?: string): Promise<SkillGap[]> {
    let gaps = Array.from(this.skillGaps.values());

    if (employeeId) {
      gaps = gaps.filter((g) => g.employeeId === employeeId);
    }

    return gaps;
  }

  async getSkillsMetrics(companyId: string): Promise<SkillsMetrics> {
    const skills = Array.from(this.skills.values()).filter((s) => s.companyId === companyId);
    const employeeSkills = Array.from(this.employeeSkills.values());
    const uniqueEmployees = new Set(employeeSkills.map((es) => es.employeeId)).size;

    const levelMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const averageProficiency = employeeSkills.length > 0 ? employeeSkills.reduce((sum, es) => sum + levelMap[es.proficiencyLevel], 0) / employeeSkills.length : 0;

    const gaps = Array.from(this.skillGaps.values());
    const averageGapLevel = gaps.length > 0 ? gaps.reduce((sum, g) => sum + g.gapLevel, 0) / gaps.length : 0;

    const plans = Array.from(this.developmentPlans.values());
    const activePlans = plans.filter((p) => p.status === 'active').length;
    const completedPlans = plans.filter((p) => p.status === 'completed').length;

    return {
      totalSkills: skills.length,
      employeesWithSkills: uniqueEmployees,
      averageProficiency,
      skillGapsIdentified: gaps.length,
      developmentPlansActive: activePlans,
      completedPlans,
      averageGapLevel,
    };
  }
}

export const skillsDevelopmentService = new SkillsDevelopmentService();

