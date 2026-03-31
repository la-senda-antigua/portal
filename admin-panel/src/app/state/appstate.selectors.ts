import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PortalUser } from '../models/PortalUser';
import { UserGroup } from '../models/UserGroup';
import { Calendar, CalendarDto } from '../models/CalendarDto';
import { CalendarEvent } from '../models/CalendarEvent';

export interface LoadedDateRange {
  startDate: string;
  endDate: string;
}

export interface AppState {
  users: PortalUser[];
  userGroups: UserGroup[];
  calendars: Calendar[];
  loadingUsers: boolean;
  loadingGroups: boolean;
  loadingCalendars: boolean;
  usersLoaded: boolean;
  userGroupsLoaded: boolean;
  calendarsLoaded: boolean;
  error: any | null;
  currentUser: PortalUser | null;
  calendarEventsByRange: Record<string, CalendarEvent[]>;
  loadedEventRangesByCalendarId: Record<string, LoadedDateRange[]>;
  loadingEventRangesByCalendarId: Record<string, LoadedDateRange[]>;
  loadingCalendarEvents: boolean;
}

export const selectAppState = createFeatureSelector<AppState>('appState');

export const selectUsers = createSelector(
  selectAppState,
  (state) => state.users,
);

export const selectUserGroups = createSelector(
  selectAppState,
  (state) => state.userGroups,
);

export const selectUsersLoading = createSelector(
  selectAppState,
  (state) => state.loadingUsers,
);

export const selectUserGroupsLoading = createSelector(
  selectAppState,
  (state) => state.loadingGroups,
);

export const selectUsersLoaded = createSelector(
  selectAppState,
  (state) => state.usersLoaded,
);

export const selectUserGroupsLoaded = createSelector(
  selectAppState,
  (state) => state.userGroupsLoaded,
);

export const selectCalendars = createSelector(
  selectAppState,
  (state) => state.calendars,
);

export const selectLoadingCalendars = createSelector(
  selectAppState,
  (state) => state.loadingCalendars,
);

export const selectCalendarsLoaded = createSelector(
  selectAppState,
  (state) => state.calendarsLoaded,
);

export const selectCalendarEventsByRange = createSelector(
  selectAppState,
  (state) => state.calendarEventsByRange,
);

export const selectLoadedEventRangesByCalendarId = createSelector(
  selectAppState,
  (state) => state.loadedEventRangesByCalendarId,
);

export const selectLoadingEventRangesByCalendarId = createSelector(
  selectAppState,
  (state) => state.loadingEventRangesByCalendarId,
);

export const selectCalendarEventsLoading = createSelector(
  selectAppState,
  (state) => state.loadingCalendarEvents,
);

export const selectError = createSelector(
  selectAppState,
  (state) => state.error,
);
