import { EventInput } from '@fullcalendar/core';
import { CalendarEvent } from '../../models/CalendarEvent';
import { PortalUser } from '../../models/PortalUser';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const adjustDateByDays = (dateString: string, days: number): string => {
  const datePart = dateString.substring(0, 10);
  const date = new Date(`${datePart}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

export const extractDatePart = (
  value: string | null | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const datePart = value.split('T')[0].split(' ')[0];
  return datePart.includes('-') ? datePart : undefined;
};

export const toDateOnly = (
  value: string | null | undefined,
): string | undefined => {
  return extractDatePart(value) ?? value?.split(' ')[0];
};

export const normalizeEventDateTime = (
  dateTimeOrTime: string | null | undefined,
  eventDate: string | null | undefined,
  allDay: boolean | undefined,
): string | undefined => {
  const eventDateOnly = toDateOnly(eventDate);

  if (!dateTimeOrTime && !eventDate) {
    return undefined;
  }

  if (allDay) {
    return extractDatePart(dateTimeOrTime) ?? eventDateOnly ?? undefined;
  }

  if (!dateTimeOrTime) {
    return eventDateOnly ? `${eventDateOnly}T00:00:00` : undefined;
  }

  const normalized = dateTimeOrTime.replace(' ', 'T');
  if (normalized.includes('T')) {
    return normalized;
  }

  if (!eventDateOnly) {
    return normalized;
  }

  return `${eventDateOnly}T${normalized}`;
};

export const eventOverlapsRange = (
  event: CalendarEvent,
  range: DateRange,
): boolean => {
  const eventStart = extractDatePart(event.start) ?? toDateOnly(event.eventDate);
  const eventEnd =
    extractDatePart(event.end) ??
    extractDatePart(event.start) ??
    toDateOnly(event.eventDate);

  if (!eventStart || !eventEnd) {
    return false;
  }

  return eventStart <= range.endDate && eventEnd >= range.startDate;
};

export const mergeRanges = (ranges: DateRange[]): DateRange[] => {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );
  const merged: DateRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.startDate <= last.endDate) {
      merged[merged.length - 1] = {
        startDate: last.startDate,
        endDate: current.endDate > last.endDate ? current.endDate : last.endDate,
      };
    } else {
      merged.push(current);
    }
  }

  return merged;
};

export const isRangeCovered = (
  windowRange: DateRange,
  coveredRanges: DateRange[],
): boolean => {
  return coveredRanges.some(
    (range) =>
      range.startDate <= windowRange.startDate &&
      range.endDate >= windowRange.endDate,
  );
};

export const getEventsForCalendarIds = (
  byCalendarId: Record<string, CalendarEvent[]>,
  calendarIds: string[],
): CalendarEvent[] => {
  return calendarIds.flatMap((calendarId) => byCalendarId[calendarId] ?? []);
};

export const hydrateEventAssignees = (
  event: CalendarEvent,
  usersById: Map<string, PortalUser>,
): CalendarEvent => {
  if (!event.assignees?.length) {
    return event;
  }

  const assignees = event.assignees.map((assignee) => {
    const userId = assignee?.userId;
    if (!userId) {
      return assignee;
    }

    const fullUser = usersById.get(userId);
    if (!fullUser) {
      return assignee;
    }

    const hasOnlyId = Object.keys(assignee).length === 1;
    const missingIdentity =
      !assignee.username && !assignee.name && !assignee.lastName;

    if (hasOnlyId || missingIdentity) {
      return fullUser;
    }

    return assignee;
  });

  const displayTitle =
    event.displayTitle?.trim() ||
    event.title?.trim() ||
    assignees
      .map((a: PortalUser) => `${a.name ?? ''} ${a.lastName ?? ''}`.trim())
      .join(', ');

  return {
    ...event,
    assignees,
    displayTitle,
  };
};

export const buildEventUniqueKey = (event: CalendarEvent): string => {
  return (
    event.id ??
    [
      event.calendarId,
      toDateOnly(event.eventDate),
      event.start ?? '',
      event.end ?? '',
      event.title ?? '',
    ].join('|')
  );
};

export const toCalendarEventInput = (
  event: CalendarEvent,
  getCalendarColor: (calendarId: string) => string,
): EventInput => {
  const start = normalizeEventDateTime(event.start, event.eventDate, event.allDay);
  let end = normalizeEventDateTime(event.end, event.eventDate, event.allDay);

  if (event.allDay && end) {
    end = adjustDateByDays(end, 1);
  }

  const color = getCalendarColor(event.calendarId);
  return {
    title: event.displayTitle ?? event.title,
    backgroundColor: color,
    borderColor: color,
    start,
    end,
    allDay: event.allDay,
    extendedProps: {
      calendarId: event.calendarId,
      description: event.description,
      id: event.id,
      originalTitle: event.title,
      displayTitle: event.displayTitle,
    },
  } as EventInput;
};

export const normalizeDialogEventDto = (eventDto: any): any => {
  const normalized = { ...eventDto };

  if (normalized.start && normalized.start.length === 5) {
    normalized.start = `${normalized.start}:00`;
  }

  if (normalized.end && normalized.end.length === 5) {
    normalized.end = `${normalized.end}:00`;
  }

  if (!normalized.end) {
    normalized.end = null;
  }

  normalized.eventDate = normalized.date;
  normalized.assignees =
    normalized.assignees?.map((assignee: PortalUser) => ({
      userId: assignee.userId,
    })) ?? [];

  return normalized;
};

export const prepareCopyData = (eventData: any): any => {
  return {
    ...eventData,
    id: undefined,
    date: eventData.start.substring(0, 10),
    endDate: eventData.end
      ? eventData.end.substring(0, 10)
      : eventData.start.substring(0, 10),
    start: eventData.start
      ? eventData.start.split('T')[1]?.substring(0, 5) || ''
      : '',
    end: eventData.end
      ? eventData.end.split('T')[1]?.substring(0, 5) || ''
      : '',
  };
};
