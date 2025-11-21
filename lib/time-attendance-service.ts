export interface AttendanceRecord {
  id: string;
  companyId: string;
  employeeId: string;
  attendanceDate: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  workingHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
  remarks: string;
  createdAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveCode: string;
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'unpaid';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  createdAt: Date;
}

export interface TimeSheet {
  id: string;
  employeeId: string;
  timesheetCode: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalHours: number;
  overtimeHours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
}

export interface AttendanceMetrics {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  averageAttendanceRate: number;
  totalLeaveRequests: number;
  approvedLeaves: number;
  pendingLeaves: number;
}

export class TimeAttendanceService {
  private records: Map<string, AttendanceRecord> = new Map();
  private leaveRequests: Map<string, LeaveRequest> = new Map();
  private timesheets: Map<string, TimeSheet> = new Map();

  async recordAttendance(
    companyId: string,
    employeeId: string,
    attendanceDate: Date,
    checkInTime: Date,
    status: 'present' | 'absent' | 'late' | 'half-day' | 'leave',
    remarks: string
  ): Promise<AttendanceRecord> {
    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      employeeId,
      attendanceDate,
      checkInTime,
      workingHours: 0,
      status,
      remarks,
      createdAt: new Date(),
    };

    this.records.set(record.id, record);
    console.log(`Attendance recorded for employee: ${employeeId}`);
    return record;
  }

  async recordCheckOut(recordId: string, checkOutTime: Date): Promise<AttendanceRecord | null> {
    const record = this.records.get(recordId);
    if (!record) return null;

    record.checkOutTime = checkOutTime;
    const hours = (checkOutTime.getTime() - record.checkInTime.getTime()) / (1000 * 60 * 60);
    record.workingHours = Math.round(hours * 100) / 100;

    this.records.set(recordId, record);
    console.log(`Check-out recorded: ${recordId}`);
    return record;
  }

  async createLeaveRequest(
    employeeId: string,
    leaveCode: string,
    leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'unpaid',
    startDate: Date,
    endDate: Date,
    reason: string
  ): Promise<LeaveRequest> {
    const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const request: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      leaveCode,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
      status: 'pending',
      createdAt: new Date(),
    };

    this.leaveRequests.set(request.id, request);
    console.log(`Leave request created: ${leaveCode}`);
    return request;
  }

  async approveLeaveRequest(leaveRequestId: string, approvedBy: string): Promise<LeaveRequest | null> {
    const request = this.leaveRequests.get(leaveRequestId);
    if (!request) return null;

    request.status = 'approved';
    request.approvedBy = approvedBy;
    this.leaveRequests.set(leaveRequestId, request);
    console.log(`Leave request approved: ${leaveRequestId}`);
    return request;
  }

  async createTimeSheet(
    employeeId: string,
    timesheetCode: string,
    weekStartDate: Date,
    weekEndDate: Date,
    totalHours: number,
    overtimeHours: number
  ): Promise<TimeSheet> {
    const timesheet: TimeSheet = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      timesheetCode,
      weekStartDate,
      weekEndDate,
      totalHours,
      overtimeHours,
      status: 'draft',
      createdAt: new Date(),
    };

    this.timesheets.set(timesheet.id, timesheet);
    console.log(`Timesheet created: ${timesheetCode}`);
    return timesheet;
  }

  async getAttendanceRecords(companyId: string, employeeId?: string): Promise<AttendanceRecord[]> {
    let records = Array.from(this.records.values()).filter((r) => r.companyId === companyId);

    if (employeeId) {
      records = records.filter((r) => r.employeeId === employeeId);
    }

    return records;
  }

  async getLeaveRequests(employeeId?: string, status?: string): Promise<LeaveRequest[]> {
    let requests = Array.from(this.leaveRequests.values());

    if (employeeId) {
      requests = requests.filter((r) => r.employeeId === employeeId);
    }

    if (status) {
      requests = requests.filter((r) => r.status === status);
    }

    return requests;
  }

  async getAttendanceMetrics(companyId: string): Promise<AttendanceMetrics> {
    const records = Array.from(this.records.values()).filter((r) => r.companyId === companyId);
    const today = new Date().toDateString();
    const todayRecords = records.filter((r) => r.attendanceDate.toDateString() === today);

    const presentToday = todayRecords.filter((r) => r.status === 'present').length;
    const absentToday = todayRecords.filter((r) => r.status === 'absent').length;
    const lateToday = todayRecords.filter((r) => r.status === 'late').length;
    const onLeaveToday = todayRecords.filter((r) => r.status === 'leave').length;

    const leaveRequests = Array.from(this.leaveRequests.values());
    const approvedLeaves = leaveRequests.filter((r) => r.status === 'approved').length;
    const pendingLeaves = leaveRequests.filter((r) => r.status === 'pending').length;

    return {
      totalEmployees: 150,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      averageAttendanceRate: 92.5,
      totalLeaveRequests: leaveRequests.length,
      approvedLeaves,
      pendingLeaves,
    };
  }
}

export const timeAttendanceService = new TimeAttendanceService();

