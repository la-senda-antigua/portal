import { Injectable } from '@angular/core';
import { VideosServiceBase } from './videos.service.base';
import { Observable } from 'rxjs';
import { TableResult } from '../models/TableResult';
import { GalleryVideo } from '../models/GalleryVideo';

@Injectable({
  providedIn: 'root',
})
export class GalleryService extends VideosServiceBase {
  override apiUrl = '/gallery';
  
  override getPage(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<GalleryVideo>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<GalleryVideo>>(url);
  }

  override add(item: GalleryVideo): Observable<GalleryVideo> {
    return this.requestManager.post<GalleryVideo>(this.apiUrl, item);
  }

  override edit(item: GalleryVideo): Observable<GalleryVideo> {
    const url = `${this.apiUrl}/${item.id}`;
    return this.requestManager.put<GalleryVideo>(url, item);
  }

  override delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }
}
