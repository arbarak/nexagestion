export interface Shift {
  id: string;
  companyId: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  workingHours: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  assignmentCode: string;
  assignmentDate: Date;
  status: 'assigned' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface ShiftSwap {
  id: string;
  requestingEmployeeId: string;
  targetEmployeeId: string;
  swapCode: string;
  originalShiftDate: Date;
  targetShiftDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
}

export interface ShiftMetrics {
  totalShifts: number;
  activeShifts: number;
  totalAssignments: number;
  completedAssignments: number;
  pendingSwaps: number;
  approvedSwaps: number;
  averageShiftUtilization: number;
  shiftCoverageRate: number;
}

export class ShiftManagementService {
  private shifts: Map<string, Shift> = new Map();
  private assignments: Map<string, ShiftAssignment> = new Map();
  private swaps: Map<string, ShiftSwap> = new Map();

  async createShift(
    companyId: string,
    shiftCode: string,
    shiftName: string,
    startTime: string,
    endTime: string,
    breakDuration: number,
    workingHours: number
  ): Promise<Shift> {
    const shift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      shiftCode,
      shiftName,
      startTime,
      endTime,
      breakDuration,
      workingHours,
      status: 'active',
      createdAt: new Date(),
    };

    this.shifts.set(shift.id, shift);
    console.log(`Shift created: ${shiftName}`);
    return shift;
  }

  async assignShift(
    employeeId: string,
    shiftId: string,
    assignmentCode: string,
    assignmentDate: Date
  ): Promise<ShiftAssignment> {
    const assignment: ShiftAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      shiftId,
      assignmentCode,
      assignmentDate,
      status: 'assigned',
      createdAt: new Date(),
    };

    this.assignments.set(assignment.id, assignment);
    console.log(`Shift assigned: ${assignmentCode}`);
    return assignment;
  }

  async completeShiftAssignment(assignmentId: string): Promise<ShiftAssignment | null> {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) return null;

    assignment.status = 'completed';
    this.assignments.set(assignmentId, assignment);
    console.log(`Shift assignment completed: ${assignmentId}`);
    return assignment;
  }

  async requestShiftSwap(
    requestingEmployeeId: string,
    targetEmployeeId: string,
    swapCode: string,
    originalShiftDate: Date,
    targetShiftDate: Date,
    reason: string
  ): Promise<ShiftSwap> {
    const swap: ShiftSwap = {
      id: Math.random().toString(36).substr(2, 9),
      requestingEmployeeId,
      targetEmployeeId,
      swapCode,
      originalShiftDate,
      targetShiftDate,
      reason,
      status: 'pending',
      createdAt: new Date(),
    };

    this.swaps.set(swap.id, swap);
    console.log(`Shift swap requested: ${swapCode}`);
    return swap;
  }

  async approveShiftSwap(swapId: string, approvedBy: string): Promise<ShiftSwap | null> {
    const swap = this.swaps.get(swapId);
    if (!swap) return null;

    swap.status = 'approved';
    swap.approvedBy = approvedBy;
    this.swaps.set(swapId, swap);
    console.log(`Shift swap approved: ${swapId}`);
    return swap;
  }

  async getShifts(companyId: string): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter((s) => s.companyId === companyId);
  }

  async getShiftAssignments(employeeId?: string): Promise<ShiftAssignment[]> {
    let assignments = Array.from(this.assignments.values());

    if (employeeId) {
      assignments = assignments.filter((a) => a.employeeId === employeeId);
    }

    return assignments;
  }

  async getShiftMetrics(companyId: string): Promise<ShiftMetrics> {
    const shifts = Array.from(this.shifts.values()).filter((s) => s.companyId === companyId);
    const activeShifts = shifts.filter((s) => s.status === 'active').length;

    const assignments = Array.from(this.assignments.values());
    const completedAssignments = assignments.filter((a) => a.status === 'completed').length;

    const swaps = Array.from(this.swaps.values());
    const pendingSwaps = swaps.filter((s) => s.status === 'pending').length;
    const approvedSwaps = swaps.filter((s) => s.status === 'approved').length;

    return {
      totalShifts: shifts.length,
      activeShifts,
      totalAssignments: assignments.length,
      completedAssignments,
      pendingSwaps,
      approvedSwaps,
      averageShiftUtilization: 85.5,
      shiftCoverageRate: 94.0,
    };
  }
}

export const shiftManagementService = new ShiftManagementService();

