import { Injectable } from '@angular/core';
import { VideosServiceBase } from './videos.service.base';
import { Observable } from 'rxjs';
import { TableResult } from '../models/TableResult';
import { Sermon, SermonDto } from '../models/Sermon';

@Injectable({
  providedIn: 'root',
})
export class SermonsService extends VideosServiceBase {
  override apiUrl = '/sermons';
  
  override getPage(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<Sermon>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<Sermon>>(url);
  }

  override add(sermon: SermonDto): Observable<SermonDto> {
    return this.requestManager.post<SermonDto>(this.apiUrl, sermon);
  }

  override edit(sermon: Sermon): Observable<Sermon> {
    const url = `${this.apiUrl}/${sermon.id}`;
    return this.requestManager.put<Sermon>(url, sermon);
  }

  override delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }
}
