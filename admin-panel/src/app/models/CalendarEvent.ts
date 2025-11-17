export interface CalendarEvent {
  eventId?: string;
  title: string;
  description?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  backgroundColor?: string;
  calendarId: string;
}
