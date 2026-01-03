import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calendarService } from '../calendar-service';

describe('CalendarService', () => {
  const mockCompanyId = 'company_test_123';
  const mockUserId = 'user_test_123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create an event with valid data', async () => {
      const eventData = {
        title: 'Team Meeting',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        organizerId: mockUserId,
      };

      const event = await calendarService.createEvent(mockCompanyId, eventData);

      expect(event).toBeDefined();
      expect(event.title).toBe('Team Meeting');
      expect(event.eventType).toBe('event');
      expect(event.status).toBe('scheduled');
      expect(event.companyId).toBe(mockCompanyId);
    });

    it('should throw error if required fields are missing', async () => {
      const invalidData = {
        title: 'Meeting',
        // missing startTime and endTime
      };

      await expect(
        calendarService.createEvent(mockCompanyId, invalidData as any)
      ).rejects.toThrow('required');
    });

    it('should throw error if endTime is before startTime', async () => {
      const eventData = {
        title: 'Invalid Meeting',
        startTime: new Date('2024-01-15T11:00:00Z'),
        endTime: new Date('2024-01-15T10:00:00Z'),
        organizerId: mockUserId,
      };

      await expect(calendarService.createEvent(mockCompanyId, eventData)).rejects.toThrow(
        'endTime must be after startTime'
      );
    });

    it('should set default values for optional fields', async () => {
      const eventData = {
        title: 'Quick Standup',
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T09:30:00Z'),
        organizerId: mockUserId,
      };

      const event = await calendarService.createEvent(mockCompanyId, eventData);

      expect(event.eventType).toBe('event');
      expect(event.priority).toBe('medium');
      expect(event.attendees).toEqual([]);
      expect(event.resourceIds).toEqual([]);
    });
  });

  describe('getCalendarView', () => {
    it('should return day view with correct date range', async () => {
      const testDate = new Date('2024-01-15');
      const view = await calendarService.getCalendarView(mockCompanyId, 'day', testDate);

      expect(view.viewType).toBe('day');
      expect(view.startDate.toDateString()).toBe(testDate.toDateString());
      expect(view.endDate.getDate()).toBe(testDate.getDate() + 1);
    });

    it('should return week view with correct date range', async () => {
      const testDate = new Date('2024-01-15'); // Monday
      const view = await calendarService.getCalendarView(mockCompanyId, 'week', testDate);

      expect(view.viewType).toBe('week');
      // Week should start on Sunday
      const startDay = view.startDate.getDay();
      expect(startDay).toBe(0);
    });

    it('should return month view with correct date range', async () => {
      const testDate = new Date('2024-01-15');
      const view = await calendarService.getCalendarView(mockCompanyId, 'month', testDate);

      expect(view.viewType).toBe('month');
      expect(view.startDate.getMonth()).toBe(0); // January
      expect(view.endDate.getMonth()).toBe(1); // February
    });

    it('should return agenda view with 30-day range', async () => {
      const testDate = new Date('2024-01-15');
      const view = await calendarService.getCalendarView(mockCompanyId, 'agenda', testDate);

      expect(view.viewType).toBe('agenda');
      const daysDiff = Math.ceil(
        (view.endDate.getTime() - view.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBeLessThanOrEqual(31);
    });
  });

  describe('findAvailableSlots', () => {
    it('should find available time slots within business hours', async () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-16');

      const slots = await calendarService.findAvailableSlots(
        mockCompanyId,
        startDate,
        endDate,
        30 // 30 minutes
      );

      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);

      // Check that all slots are within business hours (9 AM - 5 PM)
      for (const slot of slots) {
        expect(slot.startTime.getHours()).toBeGreaterThanOrEqual(9);
        expect(slot.endTime.getHours()).toBeLessThanOrEqual(17);
      }
    });

    it('should return slots with correct duration', async () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');
      endDate.setDate(endDate.getDate() + 1);

      const slots = await calendarService.findAvailableSlots(
        mockCompanyId,
        startDate,
        endDate,
        60 // 60 minutes
      );

      for (const slot of slots) {
        const duration = (slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60);
        expect(duration).toBeCloseTo(60, -1);
      }
    });
  });

  describe('exportCalendar', () => {
    it('should export calendar in iCalendar format', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const ical = await calendarService.exportCalendar(mockCompanyId, startDate, endDate);

      expect(ical).toContain('BEGIN:VCALENDAR');
      expect(ical).toContain('END:VCALENDAR');
      expect(ical).toContain('VERSION:2.0');
      expect(ical).toContain('PRODID:-//NexaGestion//Calendar//EN');
    });

    it('should include proper iCalendar date format', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');

      const ical = await calendarService.exportCalendar(mockCompanyId, startDate, endDate);

      // Check for valid iCalendar date format (YYYYMMDDTHHMMSSZ)
      const dateRegex = /\d{8}T\d{6}Z/;
      expect(ical).toMatch(dateRegex);
    });
  });

  describe('getCalendarStats', () => {
    it('should return calendar statistics object', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const stats = await calendarService.getCalendarStats(mockCompanyId, startDate, endDate);

      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('eventsByType');
      expect(stats).toHaveProperty('eventsByStatus');
      expect(stats).toHaveProperty('busyHours');
    });

    it('should have numeric values for statistics', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const stats = await calendarService.getCalendarStats(mockCompanyId, startDate, endDate);

      expect(typeof stats.totalEvents).toBe('number');
      expect(typeof stats.busyHours).toBe('number');
      expect(stats.totalEvents).toBeGreaterThanOrEqual(0);
      expect(stats.busyHours).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Priority conversion', () => {
    it('should correctly convert priorities to iCalendar format', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');

      const ical = await calendarService.exportCalendar(mockCompanyId, startDate, endDate);

      // Check for priority values
      expect(ical).toMatch(/PRIORITY:\d/);
    });
  });
});
