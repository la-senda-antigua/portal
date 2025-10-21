import { Injectable } from '@angular/core';
import { GeneralServiceBase } from './general.service.base';
import { Observable } from 'rxjs';
import { TableResult } from '../models/TableResult';
import { Sermon, SermonDto } from '../models/Sermon';

@Injectable({
  providedIn: 'root',
})
export class CoursesService extends GeneralServiceBase {
  override apiUrl = '/lessons';
  
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

  override search(
    searchTerm: string, 
    page: number=1, 
    pageSize:number=10
  ): Observable<TableResult<Sermon>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.requestManager.get<TableResult<Sermon>>(url);
  }

  override addWithImage(formData: FormData): Observable<SermonDto> {
    return this.requestManager.post_auto_content<SermonDto>(this.apiUrl, formData);
  }
  
  override editWithImage(id: number, formData: FormData): Observable<void> {    
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.put_auto_content<void>(url, formData);
  }
}
