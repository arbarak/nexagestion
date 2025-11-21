export interface TrainingProgram {
  id: string;
  companyId: string;
  programCode: string;
  programName: string;
  description: string;
  category: string;
  duration: number;
  maxParticipants: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface TrainingSession {
  id: string;
  programId: string;
  sessionCode: string;
  instructor: string;
  location: string;
  startDate: Date;
  endDate: Date;
  enrolledCount: number;
  completedCount: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface EmployeeTraining {
  id: string;
  employeeId: string;
  sessionId: string;
  enrollmentDate: Date;
  completionDate?: Date;
  score: number;
  status: 'enrolled' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
}

export interface TrainingMetrics {
  totalPrograms: number;
  activePrograms: number;
  totalSessions: number;
  completedSessions: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageScore: number;
  completionRate: number;
}

export class TrainingManagementService {
  private programs: Map<string, TrainingProgram> = new Map();
  private sessions: Map<string, TrainingSession> = new Map();
  private enrollments: Map<string, EmployeeTraining> = new Map();

  async createTrainingProgram(
    companyId: string,
    programCode: string,
    programName: string,
    description: string,
    category: string,
    duration: number,
    maxParticipants: number,
    startDate: Date,
    endDate: Date
  ): Promise<TrainingProgram> {
    const program: TrainingProgram = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      programCode,
      programName,
      description,
      category,
      duration,
      maxParticipants,
      status: 'draft',
      startDate,
      endDate,
      createdAt: new Date(),
    };

    this.programs.set(program.id, program);
    console.log(`Training program created: ${programName}`);
    return program;
  }

  async createTrainingSession(
    programId: string,
    sessionCode: string,
    instructor: string,
    location: string,
    startDate: Date,
    endDate: Date
  ): Promise<TrainingSession> {
    const session: TrainingSession = {
      id: Math.random().toString(36).substr(2, 9),
      programId,
      sessionCode,
      instructor,
      location,
      startDate,
      endDate,
      enrolledCount: 0,
      completedCount: 0,
      status: 'scheduled',
      createdAt: new Date(),
    };

    this.sessions.set(session.id, session);
    console.log(`Training session created: ${sessionCode}`);
    return session;
  }

  async enrollEmployee(
    employeeId: string,
    sessionId: string
  ): Promise<EmployeeTraining> {
    const enrollment: EmployeeTraining = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      sessionId,
      enrollmentDate: new Date(),
      score: 0,
      status: 'enrolled',
      createdAt: new Date(),
    };

    this.enrollments.set(enrollment.id, enrollment);

    const session = this.sessions.get(sessionId);
    if (session) {
      session.enrolledCount += 1;
      this.sessions.set(sessionId, session);
    }

    console.log(`Employee enrolled: ${employeeId}`);
    return enrollment;
  }

  async completeTraining(
    enrollmentId: string,
    score: number
  ): Promise<EmployeeTraining | null> {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) return null;

    enrollment.status = score >= 60 ? 'completed' : 'failed';
    enrollment.score = score;
    enrollment.completionDate = new Date();
    this.enrollments.set(enrollmentId, enrollment);

    if (enrollment.status === 'completed') {
      const session = this.sessions.get(enrollment.sessionId);
      if (session) {
        session.completedCount += 1;
        this.sessions.set(enrollment.sessionId, session);
      }
    }

    console.log(`Training completed: ${enrollmentId}`);
    return enrollment;
  }

  async getTrainingPrograms(companyId: string, status?: string): Promise<TrainingProgram[]> {
    let programs = Array.from(this.programs.values()).filter((p) => p.companyId === companyId);

    if (status) {
      programs = programs.filter((p) => p.status === status);
    }

    return programs;
  }

  async getTrainingSessions(programId?: string): Promise<TrainingSession[]> {
    let sessions = Array.from(this.sessions.values());

    if (programId) {
      sessions = sessions.filter((s) => s.programId === programId);
    }

    return sessions;
  }

  async getEmployeeEnrollments(employeeId?: string): Promise<EmployeeTraining[]> {
    let enrollments = Array.from(this.enrollments.values());

    if (employeeId) {
      enrollments = enrollments.filter((e) => e.employeeId === employeeId);
    }

    return enrollments;
  }

  async getTrainingMetrics(companyId: string): Promise<TrainingMetrics> {
    const programs = Array.from(this.programs.values()).filter((p) => p.companyId === companyId);
    const activePrograms = programs.filter((p) => p.status === 'active').length;

    const sessions = Array.from(this.sessions.values());
    const completedSessions = sessions.filter((s) => s.status === 'completed').length;

    const enrollments = Array.from(this.enrollments.values());
    const completedEnrollments = enrollments.filter((e) => e.status === 'completed').length;
    const averageScore = enrollments.length > 0 ? enrollments.reduce((sum, e) => sum + e.score, 0) / enrollments.length : 0;
    const completionRate = enrollments.length > 0 ? (completedEnrollments / enrollments.length) * 100 : 0;

    return {
      totalPrograms: programs.length,
      activePrograms,
      totalSessions: sessions.length,
      completedSessions,
      totalEnrollments: enrollments.length,
      completedEnrollments,
      averageScore,
      completionRate,
    };
  }
}

export const trainingManagementService = new TrainingManagementService();

