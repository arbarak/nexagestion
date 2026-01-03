import { describe, it, expect, beforeEach, vi } from 'vitest';
import { employeeService } from '../employee-service';

describe('EmployeeService', () => {
  const mockCompanyId = 'company_test_123';
  const mockEmployeeId = 'emp_test_123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEmployee', () => {
    it('should create an employee with required fields', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        position: 'Developer',
        department: 'Engineering',
        salary: 50000,
      };

      const employee = await employeeService.createEmployee(mockCompanyId, employeeData);

      expect(employee).toBeDefined();
      expect(employee.firstName).toBe('John');
      expect(employee.lastName).toBe('Doe');
      expect(employee.email).toBe('john@example.com');
      expect(employee.companyId).toBe(mockCompanyId);
      expect(employee.status).toBe('active');
    });

    it('should set default employment type to full_time', async () => {
      const employeeData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        position: 'Manager',
        department: 'Sales',
      };

      const employee = await employeeService.createEmployee(mockCompanyId, employeeData);

      expect(employee.employmentType).toBe('full_time');
    });

    it('should set currency to MAD by default', async () => {
      const employeeData = {
        firstName: 'Ahmed',
        lastName: 'Hassan',
        email: 'ahmed@example.com',
        position: 'Analyst',
        department: 'Finance',
      };

      const employee = await employeeService.createEmployee(mockCompanyId, employeeData);

      expect(employee.currency).toBe('MAD');
    });

    it('should throw error if required fields are missing', async () => {
      const invalidData = {
        firstName: 'John',
        // missing other required fields
      };

      await expect(employeeService.createEmployee(mockCompanyId, invalidData as any)).rejects.toThrow(
        'required'
      );
    });
  });

  describe('requestLeave', () => {
    it('should create a leave request with pending status', async () => {
      const leaveData = {
        leaveType: 'vacation' as const,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        reason: 'Holiday vacation',
      };

      const leaveRequest = await employeeService.requestLeave(mockCompanyId, mockEmployeeId, leaveData);

      expect(leaveRequest).toBeDefined();
      expect(leaveRequest.leaveType).toBe('vacation');
      expect(leaveRequest.status).toBe('pending');
      expect(leaveRequest.daysRequested).toBe(5);
    });

    it('should calculate correct number of days', async () => {
      const leaveData = {
        leaveType: 'sick' as const,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-10'),
        reason: 'Medical treatment',
      };

      const leaveRequest = await employeeService.requestLeave(mockCompanyId, mockEmployeeId, leaveData);

      expect(leaveRequest.daysRequested).toBe(10);
    });

    it('should throw error if required fields are missing', async () => {
      const invalidData = {
        leaveType: 'vacation' as const,
        // missing startDate and endDate
      };

      await expect(
        employeeService.requestLeave(mockCompanyId, mockEmployeeId, invalidData as any)
      ).rejects.toThrow('required');
    });

    it('should support multiple leave types', async () => {
      const leaveTypes = ['vacation', 'sick', 'personal', 'unpaid', 'maternity', 'sabbatical'] as const;

      for (const leaveType of leaveTypes) {
        const leaveData = {
          leaveType,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-05'),
        };

        const leaveRequest = await employeeService.requestLeave(mockCompanyId, mockEmployeeId, leaveData);

        expect(leaveRequest.leaveType).toBe(leaveType);
      }
    });
  });

  describe('Payroll', () => {
    it('should generate payroll records for active employees', async () => {
      const payPeriodStart = new Date('2024-01-01');
      const payPeriodEnd = new Date('2024-01-31');

      const payrollRecords = await employeeService.generatePayroll(
        mockCompanyId,
        payPeriodStart,
        payPeriodEnd
      );

      expect(Array.isArray(payrollRecords)).toBe(true);
      if (payrollRecords.length > 0) {
        const record = payrollRecords[0];
        expect(record).toHaveProperty('baseSalary');
        expect(record).toHaveProperty('taxes');
        expect(record).toHaveProperty('netSalary');
        expect(record.status).toBe('draft');
      }
    });

    it('should calculate taxes correctly', async () => {
      const payPeriodStart = new Date('2024-01-01');
      const payPeriodEnd = new Date('2024-01-31');

      const payrollRecords = await employeeService.generatePayroll(
        mockCompanyId,
        payPeriodStart,
        payPeriodEnd
      );

      for (const record of payrollRecords) {
        // Tax should be approximately 15% of base salary
        const expectedTax = record.baseSalary * 0.15;
        expect(record.taxes).toBeCloseTo(expectedTax, 0);
      }
    });

    it('should calculate net salary correctly', async () => {
      const payPeriodStart = new Date('2024-01-01');
      const payPeriodEnd = new Date('2024-01-31');

      const payrollRecords = await employeeService.generatePayroll(
        mockCompanyId,
        payPeriodStart,
        payPeriodEnd
      );

      for (const record of payrollRecords) {
        const expectedNet = record.baseSalary + record.bonuses - record.deductions - record.taxes;
        expect(record.netSalary).toBeCloseTo(Math.max(0, expectedNet), 0);
      }
    });

    it('should not generate negative salaries', async () => {
      const payPeriodStart = new Date('2024-01-01');
      const payPeriodEnd = new Date('2024-01-31');

      const payrollRecords = await employeeService.generatePayroll(
        mockCompanyId,
        payPeriodStart,
        payPeriodEnd
      );

      for (const record of payrollRecords) {
        expect(record.netSalary).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Attendance', () => {
    it('should record check-in time', async () => {
      const checkInTime = new Date();

      const record = await employeeService.recordAttendance(mockCompanyId, mockEmployeeId, checkInTime);

      expect(record).toBeDefined();
      expect(record.checkInTime).toBeDefined();
      expect(record.status).toBe('present');
    });

    it('should record work hours on checkout', async () => {
      const checkInTime = new Date('2024-01-15T09:00:00Z');
      const checkOutTime = new Date('2024-01-15T17:30:00Z');

      // First record check-in
      await employeeService.recordAttendance(mockCompanyId, mockEmployeeId, checkInTime);

      // Then record check-out
      const record = await employeeService.recordCheckOut(mockCompanyId, mockEmployeeId, checkOutTime);

      if (record) {
        const expectedHours = 8.5; // 9:00 AM to 5:30 PM
        expect(record.workHours).toBeCloseTo(expectedHours, 1);
      }
    });

    it('should calculate work hours in decimal format', async () => {
      const checkInTime = new Date('2024-01-15T08:00:00Z');
      const checkOutTime = new Date('2024-01-15T16:30:00Z');

      await employeeService.recordAttendance(mockCompanyId, mockEmployeeId, checkInTime);
      const record = await employeeService.recordCheckOut(mockCompanyId, mockEmployeeId, checkOutTime);

      if (record) {
        expect(record.workHours).toBeCloseTo(8.5, 1);
      }
    });
  });

  describe('Employee Statistics', () => {
    it('should return employee statistics object', async () => {
      const stats = await employeeService.getEmployeeStats(mockCompanyId);

      expect(stats).toHaveProperty('totalEmployees');
      expect(stats).toHaveProperty('activeEmployees');
      expect(stats).toHaveProperty('onLeaveEmployees');
      expect(stats).toHaveProperty('departmentBreakdown');
      expect(stats).toHaveProperty('attendanceRate');
      expect(stats).toHaveProperty('totalPayrollCost');
      expect(stats).toHaveProperty('averageSalary');
    });

    it('should have numeric statistics', async () => {
      const stats = await employeeService.getEmployeeStats(mockCompanyId);

      expect(typeof stats.totalEmployees).toBe('number');
      expect(typeof stats.activeEmployees).toBe('number');
      expect(typeof stats.totalPayrollCost).toBe('number');
      expect(stats.totalEmployees).toBeGreaterThanOrEqual(0);
    });

    it('should have valid department breakdown', async () => {
      const stats = await employeeService.getEmployeeStats(mockCompanyId);

      expect(typeof stats.departmentBreakdown).toBe('object');
      const totalByDept = Object.values(stats.departmentBreakdown).reduce((a, b) => a + (b as number), 0);
      expect(totalByDept).toBe(stats.totalEmployees);
    });

    it('should have realistic attendance rate', async () => {
      const stats = await employeeService.getEmployeeStats(mockCompanyId);

      expect(stats.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(stats.attendanceRate).toBeLessThanOrEqual(100);
    });

    it('average salary should be correct', async () => {
      const stats = await employeeService.getEmployeeStats(mockCompanyId);

      if (stats.totalEmployees > 0) {
        expect(stats.averageSalary).toBeLessThanOrEqual(stats.totalPayrollCost);
        expect(stats.averageSalary).toBeCloseTo(stats.totalPayrollCost / stats.totalEmployees, 0);
      }
    });
  });

  describe('Employment Types', () => {
    it('should support all employment types', async () => {
      const types = ['full_time', 'part_time', 'contract', 'intern'] as const;

      for (const empType of types) {
        const employeeData = {
          firstName: 'Test',
          lastName: 'Employee',
          email: `test-${empType}@example.com`,
          position: 'Tester',
          department: 'QA',
          employmentType: empType,
        };

        const employee = await employeeService.createEmployee(mockCompanyId, employeeData);

        expect(employee.employmentType).toBe(empType);
      }
    });
  });

  describe('Employee Status', () => {
    it('should support all employee statuses', async () => {
      const statuses = ['active', 'inactive', 'on_leave', 'terminated'] as const;

      for (const status of statuses) {
        const employeeData = {
          firstName: 'Status',
          lastName: 'Test',
          email: `status-${status}@example.com`,
          position: 'Tester',
          department: 'QA',
          status,
        };

        const employee = await employeeService.createEmployee(mockCompanyId, employeeData);

        expect(employee.status).toBe(status);
      }
    });
  });
});
