import { CalendarMemberDto } from '../app/models/CalendarMemberDto';
import { PortalUser } from '../app/models/PortalUser';
import { UserGroupMember } from '../app/models/UserGroup';

const colors = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#ff5722',
  '#795548',
  '#607d8b',
  '#d32f2f',
  '#c2185b',
];

export function getUserColor(userId: string): string {
  const index = userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function getInitial(user: PortalUser | UserGroupMember | CalendarMemberDto): string {
  const name = (user as PortalUser).name || user.username || '';
  return name.charAt(0).toUpperCase();
}

export function getDisplayName(user: PortalUser | UserGroupMember): string {
  if (user.name || user.lastName) {
    return `${user.name ?? ''} ${user.lastName ?? ''}`.trim();
  }
  return user.username.split('@')[0];
}
