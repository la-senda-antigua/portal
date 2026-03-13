import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PortalUser } from '../models/PortalUser';
import { UserGroup } from '../models/UserGroup';
import { Calendar } from '../models/CalendarDto';

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