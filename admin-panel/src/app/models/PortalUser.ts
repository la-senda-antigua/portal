export interface PortalUser {
  userId: string;
  username: string;
  name?: string;
  lastName?: string;
  role: string;
  calendarsAsManager?: any[];
  calendarsAsMember?: any[];
}

export enum UserRole {
  Admin = 'Admin',
  CalendarManager = 'CalendarManager',
  MediaManager = 'MediaManager',
  BroadcastManager = 'BroadcastManager',
  User = 'User',
}