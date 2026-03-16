import { createReducer, on } from '@ngrx/store';
import { AppState } from './appstate.selectors';
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
  on(UsersApiActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    loadingUsers: false,
    error: null,
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

  //Calendar Events Actions
    on(CalendarsActions.loadCalendarEventsRange, (state) => ({
    ...state,
    loadingCalendarEvents: true,
  })),

  on(
    CalendarsApiActions.loadCalendarEventsRangeSuccess,
    (state, { cacheKey, events }) => ({
      ...state,
      loadingCalendarEvents: false,
      calendarEventsByRange: {
        ...state.calendarEventsByRange,
        [cacheKey]: events,
      },
      error: null,
    }),
  ),

  on(CalendarsApiActions.loadCalendarEventsRangeFailure, (state, { error }) => ({
    ...state,
    loadingCalendarEvents: false,
    error,
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
    (state, { error }) => ({
      ...state,
      loadingUsers: false,
      loadingGroups: false,
      loadingCalendars: false,
      error: error?.message || 'An error occurred while loading data.',
    }),
  ),
);
