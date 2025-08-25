import { Injectable } from '@angular/core';
import { GeneralServiceBase } from './general.service.base';
import { TableResult } from '../models/TableResult';
import { Observable } from 'rxjs';
import { CalendarEvent } from '../models/CalendarEvent';

@Injectable({
  providedIn: 'root'
})
export class CalendarService extends GeneralServiceBase {
  override apiUrl = '/calendar';

  override getPage(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<CalendarEvent>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<CalendarEvent>>(url);
  }

  override add(item: CalendarEvent): Observable<CalendarEvent> {
    return this.requestManager.post<CalendarEvent>(this.apiUrl, item);
  }

  override edit(item: CalendarEvent): Observable<CalendarEvent> {
    const url = `${this.apiUrl}/${item.id}`;
    return this.requestManager.put<CalendarEvent>(url, item);
  }

  override delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }
}
