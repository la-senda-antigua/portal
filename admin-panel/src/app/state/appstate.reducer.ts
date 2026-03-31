import { createReducer, on } from '@ngrx/store';
import { AppState, LoadedDateRange } from './appstate.selectors';
import { CalendarsActions, CalendarsApiActions } from './calendars.actions';
import { UsersActions, UsersApiActions } from './users.actions';
import {
  hydrateState,
  syncUserGroups,
  syncUserCalendars,
  removeUserFromGroups,
  removeUserFromCalendars,
  addUserGroup,
  updateUserGroup,
  removeUserGroup,
  addCalendar,
  updateCalendar,
  removeCalendar,
} from './appstate.reducer.helpers';
import { CalendarEvent } from '../models/CalendarEvent';

const compareRanges = (a: LoadedDateRange, b: LoadedDateRange): number =>
  a.startDate.localeCompare(b.startDate);

const mergeRanges = (ranges: LoadedDateRange[]): LoadedDateRange[] => {
  if (!ranges.length) {
    return [];
  }

  const sorted = [...ranges].sort(compareRanges);
  const merged: LoadedDateRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.startDate <= last.endDate) {
      merged[merged.length - 1] = {
        startDate: last.startDate,
        endDate:
          current.endDate > last.endDate ? current.endDate : last.endDate,
      };
      continue;
    }

    merged.push(current);
  }

  return merged;
};

const removeRange = (
  ranges: LoadedDateRange[],
  target: LoadedDateRange,
): LoadedDateRange[] =>
  ranges.filter((r) => {
    return !(r.startDate === target.startDate && r.endDate === target.endDate);
  });

const initialState: AppState = {
  users: [],
  userGroups: [],
  calendars: [],
  loadingUsers: false,
  loadingGroups: false,
  loadingCalendars: false,
  usersLoaded: false,
  userGroupsLoaded: false,
  calendarsLoaded: false,
  error: null,
  currentUser: null,
  calendarEventsByRange: {},
  loadedEventRangesByCalendarId: {},
  loadingEventRangesByCalendarId: {},
  loadingCalendarEvents: false,
};

export const appStateReducer = createReducer(
  initialState,

  // User Actions
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loadingUsers: true,
  })),
  on(UsersActions.addUser, (state) => ({
    ...state,
    loadingUsers: true,
  })),
  on(UsersActions.updateUser, (state) => ({
    ...state,
    loadingUsers: true,
  })),
  on(UsersActions.removeUser, (state) => ({
    ...state,
    loadingUsers: true,
  })),

  // User Group Actions
  on(UsersActions.loadUserGroups, (state) => ({
    ...state,
    loadingGroups: true,
  })),
  on(UsersActions.addUserGroup, (state) => ({
    ...state,
    loadingGroups: true,
  })),
  on(UsersActions.updateUserGroup, (state) => ({
    ...state,
    loadingGroups: true,
  })),
  on(UsersActions.removeUserGroup, (state) => ({
    ...state,
    loadingGroups: true,
  })),

  // Calendar Actions
  on(CalendarsActions.loadCalendars, (state) => ({
    ...state,
    loadingCalendars: true,
  })),
  on(CalendarsActions.addCalendar, (state) => ({
    ...state,
    loadingCalendars: true,
  })),
  on(CalendarsActions.updateCalendar, (state) => ({
    ...state,
    loadingCalendars: true,
  })),
  on(CalendarsActions.removeCalendar, (state) => ({
    ...state,
    loadingCalendars: true,
  })),

  // Calendar Events Actions
  on(
    CalendarsActions.loadCalendarEventsRange,
    (state, { startDate, endDate, calendarIds }) => {
      const requestedRange: LoadedDateRange = { startDate, endDate };
      const nextLoadingByCalendar = { ...state.loadingEventRangesByCalendarId };

      calendarIds.forEach((calendarId) => {
        const currentRanges = nextLoadingByCalendar[calendarId] ?? [];
        nextLoadingByCalendar[calendarId] = mergeRanges([
          ...currentRanges,
          requestedRange,
        ]);
      });

      return {
        ...state,
        loadingEventRangesByCalendarId: nextLoadingByCalendar,
        loadingCalendarEvents: true,
      };
    },
  ),
  on(CalendarsActions.updateEvent, (state) => ({
    ...state,
    loadingCalendarEvents: true,
  })),
  on(CalendarsActions.addEvent, (state) => ({
    ...state,
    loadingCalendarEvents: true,
  })),
  on(CalendarsActions.removeEvent, (state) => ({
    ...state,
    loadingCalendarEvents: true,
  })),

  // User Success Actions
  on(UsersApiActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    ...hydrateState(users, state.userGroups, state.calendars),
    loadingUsers: false,
    usersLoaded: true,
    error: null,
  })),
  on(UsersApiActions.addUserSuccess, (state, { user }) => {
    const updatedGroups = syncUserGroups(state.userGroups, user);
    const updatedCalendars = syncUserCalendars(state.calendars, user);

    return {
      ...state,
      ...hydrateState([...state.users, user], updatedGroups, updatedCalendars),
      loadingUsers: false,
      error: null,
    };
  }),
  on(UsersApiActions.updateUserSuccess, (state, { userId, user }) => {
    const syncedGroups = syncUserGroups(state.userGroups, user);
    const syncedCalendars = syncUserCalendars(state.calendars, user);

    return {
      ...state,
      ...hydrateState(
        state.users.map((u) => (u.userId === userId ? { ...user } : u)),
        syncedGroups,
        syncedCalendars,
      ),
      error: null,
      loadingUsers: false,
    };
  }),
  on(UsersApiActions.removeUserSuccess, (state, { userId }) => {
    const nextUsers = state.users.filter((u) => u.userId !== userId);
    const nextGroups = removeUserFromGroups(state.userGroups, userId);
    const nextCalendars = removeUserFromCalendars(state.calendars, userId);

    return {
      ...state,
      ...hydrateState(nextUsers, nextGroups, nextCalendars),
      error: null,
      loadingUsers: false,
    };
  }),

  // User Group Success Actions
  on(UsersApiActions.loadUserGroupsSuccess, (state, { groups }) => ({
    ...state,
    ...hydrateState(state.users, groups, state.calendars),
    loadingGroups: false,
    userGroupsLoaded: true,
    error: null,
  })),
  on(UsersApiActions.addUserGroupSuccess, (state, { group }) => {
    const nextGroups = addUserGroup(state.userGroups, group);

    return {
      ...state,
      ...hydrateState(state.users, nextGroups, state.calendars),
      error: null,
      loadingGroups: false,
    };
  }),
  on(
    UsersApiActions.updateUserGroupSuccess,
    (state, { groupId, userGroup }) => {
      const nextGroups = updateUserGroup(state.userGroups, groupId, userGroup);

      return {
        ...state,
        ...hydrateState(state.users, nextGroups, state.calendars),
        error: null,
        loadingGroups: false,
      };
    },
  ),
  on(UsersApiActions.removeUserGroupSuccess, (state, { groupId }) => {
    const nextGroups = removeUserGroup(state.userGroups, groupId);

    return {
      ...state,
      ...hydrateState(state.users, nextGroups, state.calendars),
      error: null,
      loadingGroups: false,
    };
  }),

  // Calendar Success Actions
  on(CalendarsApiActions.loadCalendarsSuccess, (state, { calendars }) => ({
    ...state,
    ...hydrateState(state.users, state.userGroups, calendars),
    loadingCalendars: false,
    calendarsLoaded: true,
    error: null,
  })),
  on(CalendarsApiActions.addCalendarSuccess, (state, { calendar }) => {
    const nextCalendars = addCalendar(state.calendars, calendar);

    return {
      ...state,
      ...hydrateState(state.users, state.userGroups, nextCalendars),
      error: null,
      loadingCalendars: false,
    };
  }),
  on(
    CalendarsApiActions.updateCalendarSuccess,
    (state, { calendarId, calendar }) => {
      const nextCalendars = updateCalendar(
        state.calendars,
        calendarId,
        calendar,
      );

      return {
        ...state,
        ...hydrateState(state.users, state.userGroups, nextCalendars),
        error: null,
        loadingCalendars: false,
      };
    },
  ),
  on(CalendarsApiActions.removeCalendarSuccess, (state, { calendarId }) => {
    const nextCalendars = removeCalendar(state.calendars, calendarId);

    return {
      ...state,
      ...hydrateState(state.users, state.userGroups, nextCalendars),
      error: null,
      loadingCalendars: false,
    };
  }),

  // Calendar Events Success Actions
  on(
    CalendarsApiActions.loadCalendarEventsRangeSuccess,
    (state, { startDate, endDate, calendarIds, events }) => {
      const coveredRange: LoadedDateRange = { startDate, endDate };
      const nextLoadedByCalendar = { ...state.loadedEventRangesByCalendarId };
      const nextLoadingByCalendar = { ...state.loadingEventRangesByCalendarId };
      const nextEventsByCalendar = { ...state.calendarEventsByRange };

      calendarIds.forEach((calendarId) => {
        nextLoadedByCalendar[calendarId] = mergeRanges([
          ...(nextLoadedByCalendar[calendarId] ?? []),
          coveredRange,
        ]);
        nextLoadingByCalendar[calendarId] = removeRange(
          nextLoadingByCalendar[calendarId] ?? [],
          coveredRange,
        );

        const incomingForCalendar = events.filter(
          (event) => event.calendarId === calendarId,
        );
        nextEventsByCalendar[calendarId] = [...(nextEventsByCalendar[calendarId] ?? []), ...incomingForCalendar];
      });

      return {
        ...state,
        calendarEventsByRange: nextEventsByCalendar,
        loadedEventRangesByCalendarId: nextLoadedByCalendar,
        loadingEventRangesByCalendarId: nextLoadingByCalendar,
        loadingCalendarEvents: Object.values(nextLoadingByCalendar).some(
          (ranges) => ranges.length > 0,
        ),
        error: null,
      };
    },
  ),
  on(CalendarsApiActions.updateEventSuccess, (state, { event }) => {
    const updatedCalendarEventsByRange = Object.fromEntries(
      Object.entries(state.calendarEventsByRange).map(([key, events]) => [
        key,
        events.map((e) => (e.id === event.id ? event : e)),
      ]),
    );

    return {
      ...state,
      calendarEventsByRange: updatedCalendarEventsByRange,
      loadingCalendarEvents: false,
      error: null,
    };
  }),
  on(CalendarsApiActions.addEventSuccess, (state, { event }) => {
    const updatedCalendarEventsByRange = {
      ...state.calendarEventsByRange,
      [event.calendarId]: [
        ...(state.calendarEventsByRange[event.calendarId] || []),
        event,
      ],
    };

    return {
      ...state,
      calendarEventsByRange: updatedCalendarEventsByRange,
      loadingCalendarEvents: false,
      error: null,
    };
  }),
  on(CalendarsApiActions.removeEventSuccess, (state, { eventId }) => {
    const updatedCalendarEventsByRange = Object.fromEntries(
      Object.entries(state.calendarEventsByRange).map(([key, events]) => [
        key,
        events.filter((e) => e.id !== eventId),
      ]),
    );

    return {
      ...state,
      calendarEventsByRange: updatedCalendarEventsByRange,
      loadingCalendarEvents: false,
      error: null,
    };
  }),
  on(
    CalendarsApiActions.loadCalendarEventsRangeFailure,
    (state, { startDate, endDate, calendarIds }) => {
      const requestedRange: LoadedDateRange = { startDate, endDate };
      const nextLoadingByCalendar = { ...state.loadingEventRangesByCalendarId };

      calendarIds.forEach((calendarId) => {
        nextLoadingByCalendar[calendarId] = removeRange(
          nextLoadingByCalendar[calendarId] ?? [],
          requestedRange,
        );
      });

      return {
        ...state,
        loadingEventRangesByCalendarId: nextLoadingByCalendar,
        loadingCalendarEvents: Object.values(nextLoadingByCalendar).some(
          (ranges) => ranges.length > 0,
        ),
      };
    },
  ),

  // Failure Actions
  on(
    UsersApiActions.loadUsersFailure,
    UsersApiActions.loadUserGroupsFailure,
    UsersApiActions.addUserFailure,
    UsersApiActions.updateUserFailure,
    UsersApiActions.removeUserFailure,
    UsersApiActions.addUserGroupFailure,
    UsersApiActions.updateUserGroupFailure,
    UsersApiActions.removeUserGroupFailure,
    CalendarsApiActions.loadCalendarsFailure,
    CalendarsApiActions.addCalendarFailure,
    CalendarsApiActions.updateCalendarFailure,
    CalendarsApiActions.removeCalendarFailure,
    CalendarsApiActions.updateEventFailure,
    CalendarsApiActions.addEventFailure,
    CalendarsApiActions.removeEventFailure,
    (state, { error }) => ({
      ...state,
      loadingUsers: false,
      loadingGroups: false,
      loadingCalendars: false,
      loadingCalendarEvents: false,
      error: error,
    }),
  ),
);
