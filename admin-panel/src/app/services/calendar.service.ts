import { Injectable } from '@angular/core';
import { GeneralServiceBase } from './general.service.base';
import { TableResult } from '../models/TableResult';
import { Observable } from 'rxjs';
import { PublicEvent } from '../models/PublicEvent';

@Injectable({
  providedIn: 'root'
})
export class CalendarService extends GeneralServiceBase {
  override apiUrl = '/publicEvents';

  override getPage(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<PublicEvent>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<PublicEvent>>(url);
  }

  override add(item: PublicEvent): Observable<PublicEvent> {
    return this.requestManager.post<PublicEvent>(this.apiUrl, item);
  }

  override edit(item: PublicEvent): Observable<PublicEvent> {
    const url = `${this.apiUrl}/${item.id}`;
    return this.requestManager.put<PublicEvent>(url, item);
  }

  override delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }

  override disable(id: number, isActive: boolean = true): Observable<void> {
    const url = isActive
      ?`${this.apiUrl}/cancelEvent/${id}`
      :`${this.apiUrl}/reactivateEvent/${id}`;

    return this.requestManager.post<void>(url, {});
  }
}
