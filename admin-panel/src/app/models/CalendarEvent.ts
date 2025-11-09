export interface CalendarEvent {
  title: string;
  description?: string | null;
  eventDate: string;
  calendarId: string;

  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;

}
