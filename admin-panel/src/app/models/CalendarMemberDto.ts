import { CalendarDto } from "./CalendarDto";

export interface CalendarMemberDto {
  userId: string;
  name?: string;
  lastName?: string;
  calendarId: string;
  username?: string;
  role?: 'Manager' | 'User';
}

export interface CalendarMemberConflict{
  user: CalendarMemberDto;
  conflicts: CalendarDto[]
}
