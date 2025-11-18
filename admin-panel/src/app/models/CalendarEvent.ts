export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  backgroundColor?: string;
  calendarId: string;
}
