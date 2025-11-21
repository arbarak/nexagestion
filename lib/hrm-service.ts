export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive' | 'on-leave';
  manager?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'unpaid';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes: string;
}

export interface Performance {
  id: string;
  employeeId: string;
  reviewDate: Date;
  rating: number;
  feedback: string;
  goals: string[];
  reviewedBy: string;
  createdAt: Date;
}

export class HRMService {
  private employees: Map<string, Employee> = new Map();
  private leaveRequests: LeaveRequest[] = [];
  private attendance: Attendance[] = [];
  private performance: Performance[] = [];

  async createEmployee(
    companyId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    department: string,
    position: string,
    salary: number,
    hireDate: Date,
    manager?: string
  ): Promise<Employee> {
    const employee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      hireDate,
      status: 'active',
      manager,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.employees.set(employee.id, employee);
    console.log(`Employee created: ${firstName} ${lastName}`);
    return employee;
  }

  async getEmployees(companyId: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(
      (e) => e.companyId === companyId
    );
  }

  async requestLeave(
    employeeId: string,
    type: 'vacation' | 'sick' | 'personal' | 'unpaid',
    startDate: Date,
    endDate: Date,
    reason: string
  ): Promise<LeaveRequest> {
    const request: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      type,
      startDate,
      endDate,
      reason,
      status: 'pending',
      createdAt: new Date(),
    };

    this.leaveRequests.push(request);
    console.log(`Leave request created: ${employeeId}`);
    return request;
  }

  async approveLeaveRequest(requestId: string, approvedBy: string): Promise<LeaveRequest | null> {
    const request = this.leaveRequests.find((r) => r.id === requestId);
    if (!request) return null;

    request.status = 'approved';
    request.approvedBy = approvedBy;
    console.log(`Leave request approved: ${requestId}`);
    return request;
  }

  async recordAttendance(
    employeeId: string,
    date: Date,
    checkIn: Date,
    status: 'present' | 'absent' | 'late' | 'half-day' = 'present'
  ): Promise<Attendance> {
    const record: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      date,
      checkIn,
      status,
      notes: '',
    };

    this.attendance.push(record);
    console.log(`Attendance recorded: ${employeeId}`);
    return record;
  }

  async recordCheckOut(attendanceId: string, checkOut: Date): Promise<Attendance | null> {
    const record = this.attendance.find((a) => a.id === attendanceId);
    if (!record) return null;

    record.checkOut = checkOut;
    console.log(`Check-out recorded: ${attendanceId}`);
    return record;
  }

  async createPerformanceReview(
    employeeId: string,
    rating: number,
    feedback: string,
    goals: string[],
    reviewedBy: string
  ): Promise<Performance> {
    const review: Performance = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      reviewDate: new Date(),
      rating,
      feedback,
      goals,
      reviewedBy,
      createdAt: new Date(),
    };

    this.performance.push(review);
    console.log(`Performance review created: ${employeeId}`);
    return review;
  }

  async getHRMMetrics(companyId: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    averageSalary: number;
    departmentCount: number;
    pendingLeaveRequests: number;
  }> {
    const employees = Array.from(this.employees.values()).filter(
      (e) => e.companyId === companyId
    );

    const activeEmployees = employees.filter((e) => e.status === 'active').length;
    const onLeave = employees.filter((e) => e.status === 'on-leave').length;
    const averageSalary = employees.length > 0
      ? employees.reduce((sum, e) => sum + e.salary, 0) / employees.length
      : 0;

    const departments = new Set(employees.map((e) => e.department)).size;
    const pendingLeaveRequests = this.leaveRequests.filter(
      (r) => r.status === 'pending'
    ).length;

    return {
      totalEmployees: employees.length,
      activeEmployees,
      onLeave,
      averageSalary,
      departmentCount: departments,
      pendingLeaveRequests,
    };
  }

  async getEmployeeAttendance(employeeId: string, limit: number = 30): Promise<Attendance[]> {
    return this.attendance
      .filter((a) => a.employeeId === employeeId)
      .slice(-limit);
  }

  async getLeaveRequests(companyId: string): Promise<LeaveRequest[]> {
    const employees = Array.from(this.employees.values()).filter(
      (e) => e.companyId === companyId
    );
    const employeeIds = new Set(employees.map((e) => e.id));

    return this.leaveRequests.filter((r) => employeeIds.has(r.employeeId));
  }
}

export const hrmService = new HRMService();

