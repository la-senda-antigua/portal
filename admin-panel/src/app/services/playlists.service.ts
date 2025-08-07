import { Injectable } from '@angular/core';
import { VideosServiceBase } from './videos.service.base';
import { Observable } from 'rxjs';
import { TableResult } from '../models/TableResult';
import { VideoPlaylist } from '../models/VideoPlaylist';

@Injectable({
  providedIn: 'root',
})
export class PlaylistsService extends VideosServiceBase {
  override apiUrl = '/videoplaylist';
    
  override getAll(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<VideoPlaylist>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<VideoPlaylist>>(url);
  }

  override add(item: VideoPlaylist): Observable<VideoPlaylist> {
    return this.requestManager.post<VideoPlaylist>(this.apiUrl, item);
  }

  override edit(item: VideoPlaylist): Observable<VideoPlaylist> {
    const url = `${this.apiUrl}/${item.id}`;
    return this.requestManager.put<VideoPlaylist>(url, item);
  }

  override delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }
}
