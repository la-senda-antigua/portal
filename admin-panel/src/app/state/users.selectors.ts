import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PortalUser } from '../models/PortalUser';
import { UserGroup } from '../models/UserGroup';

export interface UsersState {
  users: PortalUser[];
  userGroups: UserGroup[];
  loadingUsers: boolean;
  loadingGroups: boolean;
  usersLoaded: boolean;
  userGroupsLoaded: boolean;
}

export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectUsers = createSelector(
  selectUsersState,
  (state) => state.users,
);

export const selectUserGroups = createSelector(
  selectUsersState,
  (state) => state.userGroups,
);

export const selectUsersLoading = createSelector(
  selectUsersState,
  (state) => state.loadingUsers,
);

export const selectUserGroupsLoading = createSelector(
  selectUsersState,
  (state) => state.loadingGroups,
);

export const selectUsersLoaded = createSelector(
  selectUsersState,
  (state) => state.usersLoaded,
);

export const selectUserGroupsLoaded = createSelector(
  selectUsersState,
  (state) => state.userGroupsLoaded,
);