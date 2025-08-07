import { Injectable } from '@angular/core';
import { VideosServiceBase } from './videos.service.base';
import { Observable } from 'rxjs';
import { TableResult } from '../models/TableResult';
import { Preacher } from '../models/Preacher';

@Injectable({
  providedIn: 'root',
})
export class PreachersService extends VideosServiceBase {
  override apiUrl = '/preachers';
  
  override getAll(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<Preacher>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<Preacher>>(url);
  }

  override add(item: Preacher): Observable<Preacher> {
    return this.requestManager.post<Preacher>(this.apiUrl, item);
  }

  override edit(item: Preacher): Observable<Preacher> {
    const url = `${this.apiUrl}/${item.id}`;
    return this.requestManager.put<Preacher>(url, item);
  }

  override delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }
}
