import { Injectable } from '@angular/core';
import { GeneralServiceBase } from './general.service.base';
import { CalendarDto } from '../models/CalendarDto';
import { Observable } from 'rxjs';
import { TableResult } from '../models/TableResult';
import { CalendarEvent } from '../models/CalendarEvent';

@Injectable({
  providedIn: 'root',
})
export class CalendarsService extends GeneralServiceBase {
  override apiUrl = '/calendars';

  override getAll(): Observable<CalendarDto[]> {
    return this.requestManager.get<CalendarDto[]>(this.apiUrl + '/getAll');
  }

  override getPage(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<CalendarDto>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<CalendarDto>>(url);
  }

  override getMyPage(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<CalendarDto>> {
    const url: string = `${this.apiUrl}/myCalendars?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<CalendarDto>>(url);
  }

  override add(item: CalendarDto): Observable<CalendarDto> {
    return this.requestManager.post<CalendarDto>(this.apiUrl, item);
  }

  override edit(item: CalendarDto): Observable<CalendarDto> {
    const url = `${this.apiUrl}/${item.id}`;
    return this.requestManager.put<CalendarDto>(url, item);
  }

  override delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }

  override getById(id: string): Observable<CalendarDto> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.get<CalendarDto>(url);
  }

  getCalendarEvent(calendarId: string): Observable<CalendarEvent[]> {
    const url = `${this.apiUrl}/${calendarId}`;
    return this.requestManager.get<CalendarEvent[]>(url);
  }

  addMember(data: { calendarId: string; userId: string }): Observable<void> {
    const url = `${this.apiUrl}/addMember`;
    return this.requestManager.post<void>(url, data);
  }

  removeMember(data: { calendarId: string; userId: string }): Observable<void> {
    const url = `${this.apiUrl}/removeMember`;
    return this.requestManager.post<void>(url, data);
  }
}
