import { createReducer, on } from '@ngrx/store';
import { PortalUser } from '../models/PortalUser';
import { UsersActions, UsersApiActions } from './users.actions';
import { UserGroup, UserGroupMember } from '../models/UserGroup';
import { AppState as AppState } from './appstate.selectors';
import { Calendar, CalendarDto } from '../models/CalendarDto';
import { CalendarMemberDto } from '../models/CalendarMemberDto';
import { CalendarsActions, CalendarsApiActions } from './calendars.actions';

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
};

function getMemberUserId(member: UserGroupMember | string): string | undefined {
  if (typeof member === 'string') {
    return member;
  }

  return member?.userId;
}

function hydrateState(
  users: PortalUser[],
  groups: UserGroup[],
  calendars: (CalendarDto | Calendar)[],
): Partial<AppState> {
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

  const hydratedCalendars: Calendar[] = calendars.map((calendar) => ({
    ...calendar,
    managers: calendar.managers?.map((manager) => {
      const managerId = typeof manager === 'string' ? manager : manager.userId;
      const user = usersById.get(managerId);

      if (!user) {
        return {
          userId: managerId,
          name: '',
          lastName: '',
          calendarId: calendar.id ?? '',
          username: '',
          role: 'Manager',
        } as CalendarMemberDto;
      }

      return {
        userId: user.userId,
        name: user.name ?? '',
        lastName: user.lastName ?? '',
        calendarId: calendar.id ?? '',
        username: user.username,
        role: 'Manager',
      } as CalendarMemberDto;
    }),
    members: calendar.members?.map((member) => {
      const memberId = typeof member === 'string' ? member : member.userId;
      const user = usersById.get(memberId);

      if (!user) {
        return {
          userId: memberId,
          name: '',
          lastName: '',
          calendarId: calendar.id ?? '',
          username: '',
          role: 'User',
        } as CalendarMemberDto;
      }

      return {
        userId: user.userId,
        name: user.name ?? '',
        lastName: user.lastName ?? '',
        calendarId: calendar.id ?? '',
        username: user.username,
        role: 'User',
      } as CalendarMemberDto;
    }),
  }));

  const hydratedUsers = users.map((user) => ({
    ...user,
    groups: hydratedGroups
      .filter((group) =>
        (group.members ?? []).some((member) => member.userId === user.userId),
      )
      .map((g) => ({ id: g.id, groupName: g.groupName })) as UserGroup[],
    calendarsAsManager: hydratedCalendars.filter((calendar) =>
      calendar.managers?.some((manager) => manager.userId === user.userId),
    ) as Calendar[],
    calendarsAsMember: hydratedCalendars.filter((calendar) =>
      calendar.members?.some((member) => member.userId === user.userId),
    ) as Calendar[],
  }));

  return {
    users: hydratedUsers,
    userGroups: hydratedGroups,
    calendars: hydratedCalendars,
  };
}

export const appStateReducer = createReducer(
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
    ...hydrateState(users, state.userGroups, state.calendars),
    loadingUsers: false,
    usersLoaded: true,
  })),
  on(UsersApiActions.loadUsersFailure, (state) => ({
    ...state,
    loadingUsers: false,
  })),
  on(UsersApiActions.addUserSuccess, (state, { user }) => ({
    ...state,
    ...hydrateState([...state.users, user], state.userGroups, state.calendars),
  })),
  on(UsersApiActions.removeUserSuccess, (state, { userId }) => {
    const nextUsers = state.users.filter((u) => u.userId !== userId);
    const nextGroups = state.userGroups.map((group) => ({
      ...group,
      members: group.members?.filter((member) => member.userId !== userId),
    }));

    return {
      ...state,
      ...hydrateState(nextUsers, nextGroups, state.calendars),
    };
  }),
  on(UsersApiActions.updateUserSuccess, (state, { userId, changes }) => ({
    ...state,
    ...hydrateState(
      state.users.map((u) => (u.userId === userId ? { ...u, ...changes } : u)),
      state.userGroups,
      state.calendars,
    ),
  })),
  on(UsersApiActions.loadUserGroupsSuccess, (state, { groups }) => ({
    ...state,
    ...hydrateState(state.users, groups, state.calendars),
    loadingGroups: false,
    userGroupsLoaded: true,
  })),
  on(UsersApiActions.loadUserGroupsFailure, (state) => ({
    ...state,
    loadingGroups: false,
  })),
  on(UsersApiActions.addUserGroupSuccess, (state, { group }) => ({
    ...state,
    ...hydrateState(state.users, [...state.userGroups, group], state.calendars),
  })),
  on(UsersApiActions.removeUserGroupSuccess, (state, { groupId }) => ({
    ...state,
    ...hydrateState(
      state.users,
      state.userGroups.filter((g) => g.id !== groupId),
      state.calendars,
    ),
  })),
  on(UsersApiActions.updateUserGroupSuccess, (state, { groupId, changes }) => ({
    ...state,
    ...hydrateState(
      state.users,
      state.userGroups.map((g) =>
        g.id === groupId ? { ...g, ...changes } : g,
      ),
      state.calendars,
    ),
  })),
  on(CalendarsActions.loadCalendars, (state) => ({
    ...state,
    loadingCalendars: true,
  })),
  on(CalendarsApiActions.loadCalendarsSuccess, (state, { calendars }) => ({
    ...state,
    ...hydrateState(state.users, state.userGroups, calendars),
    loadingCalendars: false,
    calendarsLoaded: true,
  })),
  on(CalendarsApiActions.loadCalendarsFailure, (state) => ({
    ...state,
    loadingCalendars: false,
  })),
  on(CalendarsApiActions.addCalendarSuccess, (state, { calendar }) => ({
    ...state,
    ...hydrateState(state.users, state.userGroups, [
      ...state.calendars,
      calendar,
    ]),
  })),
  on(CalendarsApiActions.removeCalendarSuccess, (state, { calendarId }) => ({
    ...state,
    ...hydrateState(
      state.users,
      state.userGroups,
      state.calendars.filter((c) => c.id !== calendarId),
    ),
  })),
  on(
    CalendarsApiActions.updateCalendarSuccess,
    (state, { calendarId, calendar }) => ({
      ...state,
      ...hydrateState(
        state.users,
        state.userGroups,
        state.calendars.map((c) => (c.id === calendarId ? { ...calendar } : c)),
      ),
    }),
  ),
);
