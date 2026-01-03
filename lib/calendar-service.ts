import { prisma } from './prisma';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  eventType: 'meeting' | 'task' | 'deadline' | 'appointment' | 'reminder' | 'event';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  companyId: string;
  organizerId: string;
  attendees?: string[]; // User IDs
  recurrenceRule?: string; // iCalendar RRULE format
  reminders?: CalendarReminder[];
  resourceIds?: string[]; // Resource IDs (rooms, equipment, etc.)
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarReminder {
  id: string;
  eventId: string;
  reminderTime: number; // minutes before event
  reminderType: 'email' | 'notification' | 'sms';
  sent?: boolean;
  sentAt?: Date;
}

export interface CalendarResource {
  id: string;
  name: string;
  type: 'room' | 'equipment' | 'staff' | 'other';
  capacity?: number;
  companyId: string;
  availabilityRule?: string; // iCalendar RRULE format for availability
  bookings: CalendarEvent[];
}

export interface SchedulingConflict {
  eventId: string;
  conflictingEventId: string;
  resourceId?: string;
  attendeeId?: string;
  conflictType: 'time' | 'resource' | 'attendee';
}

export interface CalendarView {
  viewType: 'day' | 'week' | 'month' | 'agenda';
  startDate: Date;
  endDate: Date;
  events: CalendarEvent[];
  resources?: CalendarResource[];
}

export interface ScheduleSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  reason?: string;
}

export class CalendarService {
  /**
   * Create a calendar event
   */
  async createEvent(companyId: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    if (!data.title || !data.startTime || !data.endTime) {
      throw new Error('title, startTime, and endTime are required');
    }

    if (data.endTime <= data.startTime) {
      throw new Error('endTime must be after startTime');
    }

    // Check for conflicts
    const conflicts = await this.checkConflicts(
      companyId,
      data.startTime,
      data.endTime,
      data.attendees,
      data.resourceIds
    );

    if (conflicts.length > 0) {
      console.warn(`${conflicts.length} scheduling conflicts detected`);
    }

    const event: CalendarEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      eventType: data.eventType || 'event',
      status: data.status || 'scheduled',
      priority: data.priority || 'medium',
      companyId,
      organizerId: data.organizerId || '',
      attendees: data.attendees || [],
      recurrenceRule: data.recurrenceRule,
      resourceIds: data.resourceIds || [],
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    await this.persistEvent(event);

    // Send reminders if configured
    if (data.reminders && data.reminders.length > 0) {
      await this.setReminders(event.id, data.reminders);
    }

    // Handle recurring events
    if (data.recurrenceRule) {
      await this.generateRecurringInstances(event);
    }

    return event;
  }

  /**
   * Get events for a date range
   */
  async getEvents(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters?: {
      eventType?: string;
      status?: string;
      organizerId?: string;
      resourceId?: string;
    }
  ): Promise<CalendarEvent[]> {
    // In production, query from database with filters
    // This is a simplified implementation
    return [];
  }

  /**
   * Get calendar view (day/week/month)
   */
  async getCalendarView(
    companyId: string,
    viewType: 'day' | 'week' | 'month' | 'agenda',
    date: Date,
    userId?: string
  ): Promise<CalendarView> {
    let startDate: Date;
    let endDate: Date;

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    switch (viewType) {
      case 'day':
        startDate = new Date(dateObj);
        endDate = new Date(dateObj);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case 'week':
        startDate = new Date(dateObj);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;

      case 'month':
        startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
        endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 1);
        break;

      case 'agenda':
        startDate = new Date(dateObj);
        endDate = new Date(dateObj);
        endDate.setDate(endDate.getDate() + 30); // 30 days ahead
        break;

      default:
        throw new Error('Invalid view type');
    }

    const events = await this.getEvents(companyId, startDate, endDate);

    return {
      viewType,
      startDate,
      endDate,
      events,
    };
  }

  /**
   * Check scheduling conflicts
   */
  async checkConflicts(
    companyId: string,
    startTime: Date,
    endTime: Date,
    attendeeIds?: string[],
    resourceIds?: string[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Get overlapping events
    // In production, query from database

    return conflicts;
  }

  /**
   * Find available time slots
   */
  async findAvailableSlots(
    companyId: string,
    startDate: Date,
    endDate: Date,
    durationMinutes: number,
    attendeeIds?: string[],
    resourceIds?: string[]
  ): Promise<ScheduleSlot[]> {
    const slots: ScheduleSlot[] = [];
    const slotDuration = durationMinutes * 60 * 1000; // Convert to milliseconds

    let currentTime = new Date(startDate);
    currentTime.setHours(9, 0, 0, 0); // Start from 9 AM

    while (currentTime < endDate) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration);

      // Check if slot is within business hours (9 AM - 5 PM)
      if (currentTime.getHours() >= 9 && slotEnd.getHours() <= 17) {
        // Check for conflicts
        const conflicts = await this.checkConflicts(
          companyId,
          currentTime,
          slotEnd,
          attendeeIds,
          resourceIds
        );

        slots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
          available: conflicts.length === 0,
        });
      }

      // Move to next 30-minute slot
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  }

  /**
   * Update an event
   */
  async updateEvent(
    companyId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    // Get existing event
    // Update with new data
    // Check for conflicts with updated times/attendees
    // Persist changes
    // Return updated event

    return {
      id: eventId,
      title: updates.title || '',
      startTime: updates.startTime || new Date(),
      endTime: updates.endTime || new Date(),
      eventType: updates.eventType || 'event',
      status: updates.status || 'scheduled',
      priority: updates.priority || 'medium',
      companyId,
      organizerId: updates.organizerId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Cancel an event
   */
  async cancelEvent(companyId: string, eventId: string, reason?: string): Promise<void> {
    // Get event
    // Update status to cancelled
    // Notify attendees
    // Update related records (invoices, sales, etc.)
  }

  /**
   * Set reminders for an event
   */
  async setReminders(eventId: string, reminders: CalendarReminder[]): Promise<void> {
    // In production, save reminders to database
    // Schedule reminder notifications
  }

  /**
   * Get suggested meeting times
   */
  async suggestMeetingTimes(
    companyId: string,
    attendeeIds: string[],
    durationMinutes: number,
    startDate: Date,
    endDate: Date,
    preferredTimes?: Array<{ hour: number; minute: number }>
  ): Promise<Date[]> {
    const suggestedTimes: Date[] = [];

    // Find available slots for all attendees
    const slots = await this.findAvailableSlots(
      companyId,
      startDate,
      endDate,
      durationMinutes,
      attendeeIds
    );

    // Filter by preferred times if provided
    let filteredSlots = slots;

    if (preferredTimes && preferredTimes.length > 0) {
      filteredSlots = slots.filter((slot) => {
        return preferredTimes.some((pref) => {
          return slot.startTime.getHours() === pref.hour && slot.startTime.getMinutes() === pref.minute;
        });
      });
    }

    // Return top 5 available times
    for (const slot of filteredSlots.slice(0, 5)) {
      if (slot.available) {
        suggestedTimes.push(slot.startTime);
      }
    }

    return suggestedTimes;
  }

  /**
   * Create recurring event instances
   */
  private async generateRecurringInstances(event: CalendarEvent): Promise<void> {
    if (!event.recurrenceRule) {
      return;
    }

    // Parse RRULE and generate instances
    // In production, use a library like rrule.js
    // Generate instances for next 12 months
    // Save each instance to database
  }

  /**
   * Persist event to database
   */
  private async persistEvent(event: CalendarEvent): Promise<void> {
    try {
      // In production, save to database
      // await prisma.calendarEvent.create({ data: event });
    } catch (error) {
      console.error('Failed to persist event:', error);
      throw error;
    }
  }

  /**
   * Get attendee availability
   */
  async getAttendeeAvailability(
    companyId: string,
    attendeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    busyBlocks: Array<{ start: Date; end: Date }>;
    availableBlocks: Array<{ start: Date; end: Date }>;
  }> {
    // Get all events for attendee in date range
    // Compile busy blocks
    // Compile available blocks

    return {
      busyBlocks: [],
      availableBlocks: [],
    };
  }

  /**
   * Schedule a meeting with automatic conflict resolution
   */
  async scheduleMeetingAutomatic(
    companyId: string,
    title: string,
    attendeeIds: string[],
    durationMinutes: number,
    startDate: Date,
    endDate: Date,
    organizerId: string
  ): Promise<CalendarEvent | null> {
    // Find best available time
    const suggestedTimes = await this.suggestMeetingTimes(
      companyId,
      attendeeIds,
      durationMinutes,
      startDate,
      endDate
    );

    if (suggestedTimes.length === 0) {
      return null;
    }

    // Create event at first suggested time
    const meetingEnd = new Date(suggestedTimes[0].getTime() + durationMinutes * 60 * 1000);

    return this.createEvent(companyId, {
      title,
      startTime: suggestedTimes[0],
      endTime: meetingEnd,
      eventType: 'meeting',
      attendees: attendeeIds,
      organizerId,
    });
  }

  /**
   * Export calendar to iCalendar format
   */
  async exportCalendar(companyId: string, startDate: Date, endDate: Date): Promise<string> {
    const events = await this.getEvents(companyId, startDate, endDate);

    let ical = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//NexaGestion//Calendar//EN\r\n`;
    ical += `CALSCALE:GREGORIAN\r\n`;
    ical += `METHOD:PUBLISH\r\n`;

    for (const event of events) {
      ical += `BEGIN:VEVENT\r\n`;
      ical += `UID:${event.id}\r\n`;
      ical += `DTSTAMP:${this.toICalDate(new Date())}\r\n`;
      ical += `DTSTART:${this.toICalDate(event.startTime)}\r\n`;
      ical += `DTEND:${this.toICalDate(event.endTime)}\r\n`;
      ical += `SUMMARY:${event.title}\r\n`;
      if (event.description) {
        ical += `DESCRIPTION:${event.description}\r\n`;
      }
      if (event.location) {
        ical += `LOCATION:${event.location}\r\n`;
      }
      ical += `STATUS:${event.status.toUpperCase()}\r\n`;
      ical += `PRIORITY:${this.priorityToICalPriority(event.priority)}\r\n`;
      ical += `END:VEVENT\r\n`;
    }

    ical += `END:VCALENDAR`;

    return ical;
  }

  /**
   * Convert date to iCalendar format
   */
  private toICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Convert priority to iCalendar priority
   */
  private priorityToICalPriority(priority: string): string {
    switch (priority) {
      case 'urgent':
        return '1';
      case 'high':
        return '3';
      case 'medium':
        return '5';
      case 'low':
        return '9';
      default:
        return '5';
    }
  }

  /**
   * Get calendar statistics
   */
  async getCalendarStats(companyId: string, startDate: Date, endDate: Date): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByStatus: Record<string, number>;
    busyHours: number;
    attendanceRate?: number;
  }> {
    const events = await this.getEvents(companyId, startDate, endDate);

    const stats = {
      totalEvents: events.length,
      eventsByType: {} as Record<string, number>,
      eventsByStatus: {} as Record<string, number>,
      busyHours: 0,
      attendanceRate: 0,
    };

    for (const event of events) {
      // Count by type
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;

      // Count by status
      stats.eventsByStatus[event.status] = (stats.eventsByStatus[event.status] || 0) + 1;

      // Calculate busy hours
      const durationHours = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60);
      stats.busyHours += durationHours;
    }

    return stats;
  }
}

export const calendarService = new CalendarService();
