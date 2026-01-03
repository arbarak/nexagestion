import { prisma } from './prisma';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hireDate: Date;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  salary: number;
  currency: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  companyId: string;
  managerId?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  bankAccount?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  workHours: number;
  notes?: string;
  createdAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: 'vacation' | 'sick' | 'personal' | 'unpaid' | 'maternity' | 'sabbatical';
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvalDate?: Date;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  taxes: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'processed' | 'paid';
  paymentMethod: 'bank_transfer' | 'check' | 'cash';
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewDate: Date;
  period: string;
  rating: number; // 1-5
  comments: string;
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  status: 'draft' | 'submitted' | 'reviewed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  departmentBreakdown: Record<string, number>;
  attendanceRate: number;
  averageWorkHoursPerDay: number;
  totalPayrollCost: number;
  averageSalary: number;
}

export class EmployeeService {
  /**
   * Create a new employee
   */
  async createEmployee(companyId: string, data: Partial<Employee>): Promise<Employee> {
    if (!data.firstName || !data.lastName || !data.email || !data.position || !data.department) {
      throw new Error('firstName, lastName, email, position, and department are required');
    }

    const employee: Employee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      position: data.position,
      department: data.department,
      hireDate: data.hireDate || new Date(),
      employmentType: data.employmentType || 'full_time',
      salary: data.salary || 0,
      currency: data.currency || 'MAD',
      status: data.status || 'active',
      companyId,
      managerId: data.managerId,
      emergencyContact: data.emergencyContact,
      address: data.address,
      city: data.city,
      country: data.country,
      taxId: data.taxId,
      bankAccount: data.bankAccount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    try {
      await prisma.employee.create({
        data: {
          ...employee,
          emergencyContact: employee.emergencyContact ? JSON.stringify(employee.emergencyContact) : null,
        },
      });
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw error;
    }

    return employee;
  }

  /**
   * Get employee details
   */
  async getEmployee(companyId: string, employeeId: string): Promise<Employee | null> {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
      });

      if (!employee || employee.companyId !== companyId) {
        return null;
      }

      return {
        ...employee,
        emergencyContact: employee.emergencyContact ? JSON.parse(employee.emergencyContact) : undefined,
      } as Employee;
    } catch (error) {
      console.error('Failed to get employee:', error);
      return null;
    }
  }

  /**
   * Get all employees in a company
   */
  async getEmployees(
    companyId: string,
    filters?: {
      status?: string;
      department?: string;
      position?: string;
    }
  ): Promise<Employee[]> {
    try {
      const employees = await prisma.employee.findMany({
        where: {
          companyId,
          ...(filters?.status && { status: filters.status }),
          ...(filters?.department && { department: filters.department }),
          ...(filters?.position && { position: filters.position }),
        },
      });

      return employees.map((emp) => ({
        ...emp,
        emergencyContact: emp.emergencyContact ? JSON.parse(emp.emergencyContact) : undefined,
      })) as Employee[];
    } catch (error) {
      console.error('Failed to get employees:', error);
      return [];
    }
  }

  /**
   * Record attendance
   */
  async recordAttendance(
    companyId: string,
    employeeId: string,
    checkInTime: Date
  ): Promise<AttendanceRecord> {
    const employee = await this.getEmployee(companyId, employeeId);

    if (!employee) {
      throw new Error('Employee not found');
    }

    const attendanceRecord: AttendanceRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      date: new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate()),
      checkInTime,
      status: 'present',
      workHours: 0,
      createdAt: new Date(),
    };

    try {
      await prisma.attendanceRecord.create({
        data: attendanceRecord,
      });
    } catch (error) {
      console.error('Failed to record attendance:', error);
      throw error;
    }

    return attendanceRecord;
  }

  /**
   * Check out employee
   */
  async recordCheckOut(
    companyId: string,
    employeeId: string,
    checkOutTime: Date
  ): Promise<AttendanceRecord | null> {
    const employee = await this.getEmployee(companyId, employeeId);

    if (!employee) {
      throw new Error('Employee not found');
    }

    const date = new Date(checkOutTime.getFullYear(), checkOutTime.getMonth(), checkOutTime.getDate());

    try {
      const record = await prisma.attendanceRecord.findFirst({
        where: {
          employeeId,
          date,
        },
      });

      if (!record) {
        return null;
      }

      const checkInTime = record.checkInTime;
      const workHours = checkInTime
        ? (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
        : 0;

      const updated = await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
          checkOutTime,
          workHours,
        },
      });

      return updated as AttendanceRecord;
    } catch (error) {
      console.error('Failed to record checkout:', error);
      return null;
    }
  }

  /**
   * Get attendance records
   */
  async getAttendanceRecords(
    companyId: string,
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    try {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          employeeId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
      });

      return records as AttendanceRecord[];
    } catch (error) {
      console.error('Failed to get attendance records:', error);
      return [];
    }
  }

  /**
   * Request leave
   */
  async requestLeave(
    companyId: string,
    employeeId: string,
    data: Partial<LeaveRequest>
  ): Promise<LeaveRequest> {
    const employee = await this.getEmployee(companyId, employeeId);

    if (!employee) {
      throw new Error('Employee not found');
    }

    if (!data.leaveType || !data.startDate || !data.endDate) {
      throw new Error('leaveType, startDate, and endDate are required');
    }

    const daysRequested = Math.ceil(
      (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const leaveRequest: LeaveRequest = {
      id: `leave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysRequested,
      reason: data.reason,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await prisma.leaveRequest.create({
        data: leaveRequest as any,
      });
    } catch (error) {
      console.error('Failed to create leave request:', error);
      throw error;
    }

    return leaveRequest;
  }

  /**
   * Approve leave request
   */
  async approveLeave(
    companyId: string,
    leaveRequestId: string,
    approverId: string
  ): Promise<LeaveRequest | null> {
    try {
      const updated = await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: 'approved',
          approvedBy: approverId,
          approvalDate: new Date(),
        },
      });

      return updated as LeaveRequest;
    } catch (error) {
      console.error('Failed to approve leave:', error);
      return null;
    }
  }

  /**
   * Reject leave request
   */
  async rejectLeave(
    companyId: string,
    leaveRequestId: string,
    comments?: string
  ): Promise<LeaveRequest | null> {
    try {
      const updated = await prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: 'rejected',
          comments,
        },
      });

      return updated as LeaveRequest;
    } catch (error) {
      console.error('Failed to reject leave:', error);
      return null;
    }
  }

  /**
   * Generate payroll
   */
  async generatePayroll(
    companyId: string,
    payPeriodStart: Date,
    payPeriodEnd: Date
  ): Promise<PayrollRecord[]> {
    const employees = await this.getEmployees(companyId, { status: 'active' });
    const payrollRecords: PayrollRecord[] = [];

    for (const employee of employees) {
      // Calculate attendance and deductions
      const attendanceRecords = await this.getAttendanceRecords(
        companyId,
        employee.id,
        payPeriodStart,
        payPeriodEnd
      );

      const totalWorkHours = attendanceRecords.reduce((sum, r) => sum + r.workHours, 0);
      const expectedHours = 8 * attendanceRecords.filter((r) => r.status === 'present').length;

      // Calculate deductions for absent days
      const absentDays = attendanceRecords.filter((r) => r.status === 'absent').length;
      const deductions = (employee.salary / 22) * absentDays; // 22 working days per month

      // Calculate net salary
      const baseSalary = employee.salary;
      const bonuses = 0;
      const taxes = baseSalary * 0.15; // Simplified: 15% tax
      const netSalary = baseSalary + bonuses - deductions - taxes;

      const payroll: PayrollRecord = {
        id: `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeId: employee.id,
        payPeriodStart,
        payPeriodEnd,
        baseSalary,
        bonuses,
        deductions,
        taxes,
        netSalary: Math.max(0, netSalary),
        status: 'draft',
        paymentMethod: 'bank_transfer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      payrollRecords.push(payroll);

      try {
        await prisma.payrollRecord.create({
          data: payroll,
        });
      } catch (error) {
        console.error(`Failed to create payroll for employee ${employee.id}:`, error);
      }
    }

    return payrollRecords;
  }

  /**
   * Get payroll records
   */
  async getPayrollRecords(
    companyId: string,
    filters?: {
      employeeId?: string;
      status?: string;
      payPeriodStart?: Date;
      payPeriodEnd?: Date;
    }
  ): Promise<PayrollRecord[]> {
    try {
      const records = await prisma.payrollRecord.findMany({
        where: {
          ...(filters?.employeeId && { employeeId: filters.employeeId }),
          ...(filters?.status && { status: filters.status }),
          ...(filters?.payPeriodStart &&
            filters?.payPeriodEnd && {
              payPeriodStart: { gte: filters.payPeriodStart },
              payPeriodEnd: { lte: filters.payPeriodEnd },
            }),
        },
        orderBy: { payPeriodStart: 'desc' },
      });

      return records as PayrollRecord[];
    } catch (error) {
      console.error('Failed to get payroll records:', error);
      return [];
    }
  }

  /**
   * Create performance review
   */
  async createPerformanceReview(
    companyId: string,
    data: Partial<PerformanceReview>
  ): Promise<PerformanceReview> {
    if (!data.employeeId || !data.reviewerId || !data.comments || data.rating === undefined) {
      throw new Error('employeeId, reviewerId, comments, and rating are required');
    }

    const review: PerformanceReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId: data.employeeId,
      reviewerId: data.reviewerId,
      reviewDate: data.reviewDate || new Date(),
      period: data.period || new Date().getFullYear().toString(),
      rating: Math.min(5, Math.max(1, data.rating)),
      comments: data.comments,
      strengths: data.strengths || [],
      areasForImprovement: data.areasForImprovement || [],
      goals: data.goals || [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await prisma.performanceReview.create({
        data: {
          ...review,
          strengths: review.strengths.join(','),
          areasForImprovement: review.areasForImprovement.join(','),
          goals: review.goals.join(','),
        },
      });
    } catch (error) {
      console.error('Failed to create performance review:', error);
      throw error;
    }

    return review;
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats(companyId: string): Promise<EmployeeStats> {
    try {
      const employees = await this.getEmployees(companyId);

      const totalEmployees = employees.length;
      const activeEmployees = employees.filter((e) => e.status === 'active').length;
      const onLeaveEmployees = employees.filter((e) => e.status === 'on_leave').length;

      // Department breakdown
      const departmentBreakdown: Record<string, number> = {};
      for (const employee of employees) {
        departmentBreakdown[employee.department] = (departmentBreakdown[employee.department] || 0) + 1;
      }

      // Calculate payroll metrics
      const totalPayrollCost = employees.reduce((sum, e) => sum + e.salary, 0);
      const averageSalary = totalEmployees > 0 ? totalPayrollCost / totalEmployees : 0;

      // Placeholder for attendance rate (would need to calculate from actual data)
      const attendanceRate = 95; // Example: 95%
      const averageWorkHoursPerDay = 8; // Example: 8 hours

      return {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        departmentBreakdown,
        attendanceRate,
        averageWorkHoursPerDay,
        totalPayrollCost,
        averageSalary,
      };
    } catch (error) {
      console.error('Failed to get employee stats:', error);
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        onLeaveEmployees: 0,
        departmentBreakdown: {},
        attendanceRate: 0,
        averageWorkHoursPerDay: 0,
        totalPayrollCost: 0,
        averageSalary: 0,
      };
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(
    companyId: string,
    employeeId: string,
    updates: Partial<Employee>
  ): Promise<Employee | null> {
    try {
      const updated = await prisma.employee.update({
        where: { id: employeeId },
        data: {
          ...updates,
          emergencyContact: updates.emergencyContact
            ? JSON.stringify(updates.emergencyContact)
            : undefined,
          updatedAt: new Date(),
        },
      });

      return {
        ...updated,
        emergencyContact: updated.emergencyContact ? JSON.parse(updated.emergencyContact) : undefined,
      } as Employee;
    } catch (error) {
      console.error('Failed to update employee:', error);
      return null;
    }
  }
}

export const employeeService = new EmployeeService();
