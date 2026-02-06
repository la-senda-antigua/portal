export interface CalendarEventModel {
    id: number;
    title: string;
    description: string;
    start: Date;
    end: Date;
    allDay: boolean;
}
