import { createReducer, on } from '@ngrx/store';
import { PortalUser } from '../models/PortalUser';
import { UsersActions, UsersApiActions } from './users.actions';
import { UserGroup, UserGroupMember } from '../models/UserGroup';
import { UsersState } from './users.selectors';

export const initialState: UsersState = {
  users: [],
  userGroups: [],
  loadingUsers: false,
  loadingGroups: false,
  usersLoaded: false,
  userGroupsLoaded: false,
};

function getMemberUserId(member: UserGroupMember | string): string | undefined {
  if (typeof member === 'string') {
    return member;
  }

  return member?.userId;
}

function hydrateState(users: PortalUser[], groups: UserGroup[]) {
  const usersById = new Map(users.map((u) => [u.userId, u]));

  const hydratedGroups = groups.map((group) => ({
    ...group,
    members: (
      group.members as Array<UserGroupMember | string> | undefined
    )?.map((member) => {
      const userId = getMemberUserId(member);

      if (!userId) {
        return member as UserGroupMember;
      }

      const user = usersById.get(userId);

      if (!user) {
        return {
          userGroupId:
            typeof member === 'string'
              ? (group.id ?? '')
              : (member.userGroupId ?? group.id ?? ''),
          userId,
          username: typeof member === 'string' ? '' : member.username,
          name: typeof member === 'string' ? '' : member.name,
          lastName: typeof member === 'string' ? '' : member.lastName,
        } as UserGroupMember;
      }

      return {
        userGroupId:
          typeof member === 'string'
            ? (group.id ?? '')
            : (member.userGroupId ?? group.id ?? ''),
        userId: user.userId,
        username: user.username,
        name: user.name ?? '',
        lastName: user.lastName ?? '',
      } as UserGroupMember;
    }),
  }));

  const hydratedUsers = users.map((user) => ({
    ...user,
    groups: hydratedGroups
      .filter((group) =>
        (group.members ?? []).some((member) => member.userId === user.userId),
      )
      .map((g) => ({ id: g.id, groupName: g.groupName })) as UserGroup[],
  }));

  return {
    users: hydratedUsers,
    userGroups: hydratedGroups,
  };
}

export const usersReducer = createReducer(
  initialState,
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loadingUsers: true,
  })),
  on(UsersActions.loadUserGroups, (state) => ({
    ...state,
    loadingGroups: true,
  })),
  on(UsersApiActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    ...hydrateState(users, state.userGroups),
    loadingUsers: false,
    usersLoaded: true,
  })),
  on(UsersApiActions.loadUsersFailure, (state) => ({
    ...state,
    loadingUsers: false,
  })),
  on(UsersApiActions.addUserSuccess, (state, { user }) => ({
    ...state,
    ...hydrateState([...state.users, user], state.userGroups),
  })),
  on(UsersApiActions.removeUserSuccess, (state, { userId }) => {
    const nextUsers = state.users.filter((u) => u.userId !== userId);
    const nextGroups = state.userGroups.map((group) => ({
      ...group,
      members: group.members?.filter((member) => member.userId !== userId),
    }));

    return {
      ...state,
      ...hydrateState(nextUsers, nextGroups),
    };
  }),
  on(UsersApiActions.updateUserSuccess, (state, { userId, changes }) => ({
    ...state,
    ...hydrateState(
      state.users.map((u) => (u.userId === userId ? { ...u, ...changes } : u)),
      state.userGroups,
    ),
  })),
  on(UsersApiActions.loadUserGroupsSuccess, (state, { groups }) => ({
    ...state,
    ...hydrateState(state.users, groups),
    loadingGroups: false,
    userGroupsLoaded: true,
  })),
  on(UsersApiActions.loadUserGroupsFailure, (state) => ({
    ...state,
    loadingGroups: false,
  })),
  on(UsersApiActions.addUserGroupSuccess, (state, { group }) => ({
    ...state,
    ...hydrateState(state.users, [...state.userGroups, group]),
  })),
  on(UsersApiActions.removeUserGroupSuccess, (state, { groupId }) => ({
    ...state,
    ...hydrateState(
      state.users,
      state.userGroups.filter((g) => g.id !== groupId),
    ),
  })),
  on(UsersApiActions.updateUserGroupSuccess, (state, { groupId, changes }) => ({
    ...state,
    ...hydrateState(
      state.users,
      state.userGroups.map((g) =>
        g.id === groupId ? { ...g, ...changes } : g,
      ),
    ),
  })),
);
