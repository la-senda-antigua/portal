import { UserRole } from "./PortalUser";

export interface CalendarMemberDto {
  userId: string;
  calendarId: string;
  username?: string;
  roles?: UserRole[];
}
