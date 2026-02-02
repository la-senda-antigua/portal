import { Injectable } from '@angular/core';
import { GeneralServiceBase } from './general.service.base';
import { CalendarDto } from '../models/CalendarDto';
import { Observable, of } from 'rxjs';
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

  override getMyCalendars(): Observable<CalendarDto[]> {
    const url: string = `${this.apiUrl}/myCalendars`;
    return this.requestManager.get<CalendarDto[]>(url);
  }

  override add(item: CalendarDto): Observable<CalendarDto> {
    return this.requestManager.post<CalendarDto>(this.apiUrl, item);
  }

  override edit(item: CalendarDto): Observable<CalendarDto> {
    const url = `${this.apiUrl}/${item.id}`;
    return this.requestManager.put<CalendarDto>(url, item);
  }

  override delete(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }

  deleteEvent(id: number): Observable<void> {
    const url = `${this.apiUrl}/events/${id}`;
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

  getMonthEvents(month: number, year: number): Observable<CalendarEvent[]> {
    const url = `${this.apiUrl}/events?month=${month}&year=${year}`;
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

  updateEvent(item: CalendarEvent): Observable<void> {
    const url = `${this.apiUrl}/updateEvent`;
    return this.requestManager.put<void>(url, item);
  }

  addEvent(item: CalendarEvent): Observable<void> {
    const url = `${this.apiUrl}/addEvent`;
    return this.requestManager.post<void>(url, item);
  }

  private colors = [
    '#7986CB', '#33B679', '#8E24AA', '#E67C73', '#F6BF26',
    '#F4511E', '#039BE5', '#616161', '#3F51B5', '#0B8043',
    '#D50000', '#009688', '#E91E63', '#9C27B0', '#673AB7',
    '#2196F3', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548',
    '#9E9E9E', '#607D8B', '#5C6BC0', '#26A69A', '#EC407A'
  ];

  private calendarColors = new Map<string, string>();
  private colorIndex = 0;

  getCalendarColor(calendarId: string): string {
    if (!this.calendarColors.has(calendarId)) {
      const color = this.colors[this.colorIndex];
      this.calendarColors.set(calendarId, color);
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    }
    return this.calendarColors.get(calendarId)!;
  }

}
