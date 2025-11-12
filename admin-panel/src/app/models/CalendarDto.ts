import { CalendarMemberDto } from "./CalendarMemberDto";

export interface CalendarDto{
  id?: string;
  name: string;
  active: boolean;
  managers?: CalendarMemberDto[];
  members?: CalendarMemberDto[];
}
