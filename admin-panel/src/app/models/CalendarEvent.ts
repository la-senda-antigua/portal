export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string | null;
  eventDate: string;
  start?: string | null;
  end?: string | null;
  backgroundColor?: string;
  calendarId: string;
  displayTitle?: string;
}
