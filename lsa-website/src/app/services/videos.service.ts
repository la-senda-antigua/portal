import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetSermonsResponse, VideoModel } from '../models/video.model';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private baseUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);
  preachingsCurrentPage = 0;

  getRecentPreachings(
    pageSize = 100,
    loadNextPage = true
  ): Observable<VideoModel[]> {
    if (loadNextPage) {
      this.preachingsCurrentPage++;
    }
    return this.httpClient
      .get<GetSermonsResponse>(
        `${this.baseUrl}/sermons?page=${this.preachingsCurrentPage}&pageSize=${pageSize}`
      )
      .pipe(
        map((response) => {
          return response.items.map((i) => {
            return {
              date: new Date(i.date),
              title: i.title,
              videoUrl: i.videoPath,
              thumbnailUrl: i.cover,
              preacher: i.preacher.name,
            } as VideoModel;
          });
        })
      );
  }
}
