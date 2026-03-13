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
  error: null,
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

  // User Success Actions
  on(UsersApiActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    ...hydrateState(users, state.userGroups, state.calendars),
    loadingUsers: false,
    usersLoaded: true,
    error: null,
  })),
  on(UsersApiActions.addUserSuccess, (state, { user }) => ({
    ...state,
    ...hydrateState([...state.users, user], state.userGroups, state.calendars),
    loadingUsers: false,
    error: null,
  })),
  on(UsersApiActions.updateUserSuccess, (state, { userId, changes }) => ({
    ...state,
    ...hydrateState(
      state.users.map((u) => (u.userId === userId ? { ...u, ...changes } : u)),
      state.userGroups,
      state.calendars,
    ),
    error: null,
    loadingUsers: false,
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
  on(UsersApiActions.addUserGroupSuccess, (state, { group }) => ({
    ...state,
    ...hydrateState(state.users, [...state.userGroups, group], state.calendars),
    error: null,
    loadingGroups: false,
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
    error: null,
    loadingGroups: false,
  })),
  on(UsersApiActions.removeUserGroupSuccess, (state, { groupId }) => ({
    ...state,
    ...hydrateState(
      state.users,
      state.userGroups.filter((g) => g.id !== groupId),
      state.calendars,
    ),
    error: null,
    loadingGroups: false,
  })),

  // Calendar Success Actions
  on(CalendarsApiActions.loadCalendarsSuccess, (state, { calendars }) => ({
    ...state,
    ...hydrateState(state.users, state.userGroups, calendars),
    loadingCalendars: false,
    calendarsLoaded: true,
    error: null,
  })),
  on(CalendarsApiActions.addCalendarSuccess, (state, { calendar }) => ({
    ...state,
    ...hydrateState(state.users, state.userGroups, [
      ...state.calendars,
      calendar,
    ]),
    error: null,
    loadingCalendars: false,
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
      error: null,
      loadingCalendars: false,
    }),
  ),
  on(CalendarsApiActions.removeCalendarSuccess, (state, { calendarId }) => ({
    ...state,
    ...hydrateState(
      state.users,
      state.userGroups,
      state.calendars.filter((c) => c.id !== calendarId),
    ),
    error: null,
    loadingCalendars: false,
  })),

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
