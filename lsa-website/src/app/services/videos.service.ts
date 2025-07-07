import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  GetSermonsResponse,
  VideoModel,
  VideoStoreState,
} from '../models/video.model';
import { PreachingBatchLoaded } from '../state/videos.actions';
import {
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
  private preachingsInStore = this.store.selectSignal(selectPreachingsInStore);

  getPreachings(): Signal<readonly VideoModel[]> {
    if (this.preachingsInStore().length === 0) {
      this.loadPreachingBatch();
    }
    return this.preachingsInStore;
  }

  loadPreachingBatch(pageSize = 100): void {
    const currentPage = this.preachingsStoreState().currentPage;
    this.httpClient
      .get<GetSermonsResponse>(
        `${this.baseUrl}/sermons?page=${currentPage}&pageSize=${pageSize}`
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
