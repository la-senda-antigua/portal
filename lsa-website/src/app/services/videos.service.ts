import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  GetSermonsResponse,
  VideoModel,
  VideoRecordingDto,
  VideoStoreState,
} from '../models/video.model';
import { PreachingBatchLoaded } from '../state/videos.actions';
import {
  selectPreachingsCurrentPage,
  selectPreachingsInStore,
  selectPreachingsState,
} from '../state/videos.selectors';

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private baseUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);
  private store = inject(Store);
  private preachingsStoreState = this.store.selectSignal(selectPreachingsState);
  private preachingsCurrentPage = this.store.selectSignal(
    selectPreachingsCurrentPage
  );
  public preachingsInStore = this.store.selectSignal(selectPreachingsInStore);

  loadVideoBatch(type: 'preachings' | 'biblestudies') {
    switch (type) {
      case 'biblestudies':
        break;
      default:
        this.loadPreachingBatch();
    }
  }

  getTotalVideos(type: 'preachings' | 'biblestudies') {
    switch (type) {
      case 'biblestudies':
        return 0;
      default:
        return this.preachingsStoreState().totalVideos;
    }
  }

  loadAllSermons(): void {
    const currentPage = this.preachingsCurrentPage();
    const totalPages = this.preachingsStoreState().totalPages;
    const pageSize = this.preachingsStoreState().pageSize;
    for (let i = currentPage; i < totalPages; i++) {
      this.loadPreachingBatch(pageSize, i + 1);
    }
  }

  private loadPreachingBatch(
    pageSize = 100,
    page: number | undefined = undefined
  ): void {
    if (page === undefined) {
      page = this.preachingsCurrentPage() + 1;
    }
    this.httpClient
      .get<GetSermonsResponse>(
        `${this.baseUrl}/sermons?page=${page}&pageSize=${pageSize}`
      )
      .pipe(
        map((response) => {
          return {
            currentPage: response.page,
            pageSize: response.pageSize,
            videosInStore: response.items.map(
              (i) =>
                ({
                  date: new Date(i.date),
                  title: i.title,
                  videoUrl: i.videoPath,
                  thumbnailUrl: i.cover,
                  preacher: i.preacher.name,
                } as VideoModel)
            ),
            totalVideos: response.totalItems,
            totalPages: response.totalPages,
          };
        })
      )
      .subscribe((state: VideoStoreState) =>
        this.store.dispatch(PreachingBatchLoaded(state))
      );
  }
}
