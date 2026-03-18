import { CalendarDto, Calendar } from "../models/CalendarDto";
import { CalendarMemberDto } from "../models/CalendarMemberDto";
import { PortalUser } from "../models/PortalUser";
import { UserGroupMember, UserGroup, UserGroupDto } from "../models/UserGroup";
import { AppState } from "./appstate.selectors";

export function getMemberUserId(member: UserGroupMember | string): string | undefined {
  if (typeof member === 'string') {
    return member;
  }

  return member?.userId;
}

export function hydrateState(
  users: PortalUser[],
  groups: (UserGroup | UserGroupDto)[],
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

function getCalendarId(calendarRef: string | Calendar): string | undefined {
  if (typeof calendarRef === 'string') {
    return calendarRef;
  }

  return calendarRef?.id;
}

function addUserToCalendarRole(
  calendars: Calendar[],
  calendarRefs: Array<string | Calendar> | undefined,
  role: 'managers' | 'members',
  userId: string,
): Calendar[] {
  if (!calendarRefs?.length) {
    return calendars;
  }

  const targetCalendarIds = new Set(
    calendarRefs
      .map((calendarRef) => getCalendarId(calendarRef))
      .filter((id): id is string => !!id),
  );

  if (!targetCalendarIds.size) {
    return calendars;
  }

  return calendars.map((calendar) => {
    if (!calendar.id || !targetCalendarIds.has(calendar.id)) {
      return calendar;
    }

    return {
      ...calendar,
      [role]: [
        ...(calendar[role] ?? []),
        {
          userId,
        } as CalendarMemberDto,
      ],
    };
  });
}

function addUserToCalendars(calendars: Calendar[], user: PortalUser): Calendar[] {
  const withManagers = addUserToCalendarRole(
    calendars,
    user.calendarsAsManager as Array<string | Calendar> | undefined,
    'managers',
    user.userId,
  );

  return addUserToCalendarRole(
    withManagers,
    user.calendarsAsMember as Array<string | Calendar> | undefined,
    'members',
    user.userId,
  );
}

function removeUserFromGroupMembers(
  members: UserGroupMember[] | undefined,
  userId: string,
): UserGroupMember[] {
  return (members ?? []).filter((member) => member.userId !== userId);
}

function getGroupId(groupRef: string | UserGroup): string | undefined {
  if (typeof groupRef === 'string') {
    return groupRef;
  }

  return groupRef?.id;
}

export function removeUserFromGroups(groups: UserGroup[], userId: string): UserGroup[] {
  return groups.map((group) => ({
    ...group,
    members: removeUserFromGroupMembers(group.members, userId),
  }));
}

export function syncUserGroups(groups: UserGroup[], user: PortalUser): UserGroup[] {
  const targetGroupIds = new Set(
    ((user.groups as Array<string | UserGroup> | undefined) ?? [])
      .map((groupRef) => getGroupId(groupRef))
      .filter((id): id is string => !!id),
  );

  return groups.map((group) => {
    const withoutUser = removeUserFromGroupMembers(group.members, user.userId);

    if (!group.id || !targetGroupIds.has(group.id)) {
      return {
        ...group,
        members: withoutUser,
      };
    }

    return {
      ...group,
      members: [
        ...withoutUser,
        {
          userId: user.userId,
        } as UserGroupMember,
      ],
    };
  });
}

function removeUserFromCalendarRole(
  calendars: Calendar[],
  role: 'managers' | 'members',
  userId: string,
): Calendar[] {
  return calendars.map((calendar) => ({
    ...calendar,
    [role]: (calendar[role] ?? []).filter((member) => member.userId !== userId),
  }));
}

export function removeUserFromCalendars(calendars: Calendar[], userId: string): Calendar[] {
  const withoutManagers = removeUserFromCalendarRole(calendars, 'managers', userId);
  return removeUserFromCalendarRole(withoutManagers, 'members', userId);
}

export function syncUserCalendars(calendars: Calendar[], user: PortalUser): Calendar[] {
  const withoutUser = removeUserFromCalendars(calendars, user.userId);
  return addUserToCalendars(withoutUser, user);
}

export function addUserGroup(groups: UserGroup[], group: UserGroup | UserGroupDto): UserGroup[] {
  if (!group.id) {
    return [...groups, group] as UserGroup[];
  }

  const alreadyExists = groups.some((existingGroup) => existingGroup.id === group.id);

  if (alreadyExists) {
    return groups.map((existingGroup) =>
      existingGroup.id === group.id ? { ...existingGroup, ...group } : existingGroup,
    ) as UserGroup[];
  }

  return [...groups, group] as UserGroup[];
}

export function updateUserGroup(
  groups: UserGroup[],
  groupId: string,
  userGroup: UserGroup | UserGroupDto,
): UserGroup[] {
  return groups.map((group) =>
    group.id === groupId ? { ...group, ...userGroup } : group,
  ) as UserGroup[];
}

export function removeUserGroup(groups: UserGroup[], groupId: string): UserGroup[] {
  return groups.filter((group) => group.id !== groupId);
}

export function addCalendar(
  calendars: Calendar[],
  calendar: CalendarDto,
): Calendar[] {
  if (!calendar.id) {
    return [...calendars, { ...calendar } as Calendar];
  }

  const alreadyExists = calendars.some((existingCalendar) => existingCalendar.id === calendar.id);

  if (alreadyExists) {
    return calendars.map((existingCalendar) =>
      existingCalendar.id === calendar.id
        ? ({ ...existingCalendar, ...calendar } as Calendar)
        : existingCalendar,
    );
  }

  return [...calendars, { ...calendar } as Calendar];
}

export function updateCalendar(
  calendars: Calendar[],
  calendarId: string,
  calendar: CalendarDto,
): Calendar[] {
  return calendars.map((existingCalendar) =>
    existingCalendar.id === calendarId
      ? ({ ...existingCalendar, ...calendar } as Calendar)
      : existingCalendar,
  );
}

export function removeCalendar(
  calendars: Calendar[],
  calendarId: string,
): Calendar[] {
  return calendars.filter((calendar) => calendar.id !== calendarId);
}
