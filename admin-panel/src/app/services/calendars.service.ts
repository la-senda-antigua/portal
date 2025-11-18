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
    const url = `${this.apiUrl}/updateEvent/${item.id}`;
    return this.requestManager.put<void>(url, item);
  }

  private colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#E65100',
    '#880E4F', '#4A148C', '#311B92', '#1A237E', '#0D47A1',
    '#01579B', '#006064', '#004D40', '#1B5E20', '#33691E'
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
