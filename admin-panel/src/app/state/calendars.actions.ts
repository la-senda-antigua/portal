import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { CalendarDto } from "../models/CalendarDto";
import { CalendarEvent } from "../models/CalendarEvent";

export const CalendarsActions = createActionGroup({
    source: 'Calendars',
    events: {
        'Load Calendars': emptyProps(),
        'Add Calendar': props<{ calendar: CalendarDto }>(),
        'Remove Calendar': props<{ calendarId: string }>(),
        'Update Calendar': props<{ calendarId: string; calendar: CalendarDto }>(),
        'Load Calendar Events Range': props<{
          cacheKey: string;
          startDate: string;
          endDate: string;
          calendarIds: string[];
        }>(),
        'Update Event': props<{ eventId: string; event: CalendarEvent }>(),
        'Add Event': props<{ event: CalendarEvent }>(),
        'Remove Event': props<{ eventId: string }>(),
    },
});

export const CalendarsApiActions = createActionGroup({
    source: 'Calendars API',
    events: {
        'Load Calendars Success': props<{ calendars: CalendarDto[] }>(),
        'Load Calendars Failure': props<{ error: any }>(),
        'Add Calendar Success': props<{ calendar: CalendarDto }>(),
        'Add Calendar Failure': props<{ error: any }>(),
        'Remove Calendar Success': props<{ calendarId: string }>(),
        'Remove Calendar Failure': props<{ error: any }>(),
        'Update Calendar Success': props<{
            calendarId: string;
            calendar: CalendarDto;
        }>(),
        'Update Calendar Failure': props<{ error: any }>(),
        'Load Calendar Events Range Success': props<{
          cacheKey: string;
          events: CalendarEvent[];
        }>(),
        'Load Calendar Events Range Failure': props<{ error: any }>(),
        'Update Event Success': props<{ event: CalendarEvent }>(),
        'Update Event Failure': props<{ error: any }>(),
        'Add Event Success': props<{ event: CalendarEvent }>(),
        'Add Event Failure': props<{ error: any }>(),
        'Remove Event Success': props<{ eventId: string }>(),
        'Remove Event Failure': props<{ error: any }>(),
    },
});
