import { CalendarMemberDto } from "./CalendarMemberDto";

export interface CalendarDto{
  id?: string;
  name: string;
  active?: boolean;
  color?: string;
  isPublic?: boolean;
  managers?: CalendarMemberDto[];
  members?: CalendarMemberDto[];
}
