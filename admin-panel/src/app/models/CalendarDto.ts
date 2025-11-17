import { CalendarMemberDto } from "./CalendarMemberDto";

export interface CalendarDto{
  id?: string;
  name: string;
  active: boolean;
  color?: string;
  managers?: CalendarMemberDto[];
  members?: CalendarMemberDto[];
}
