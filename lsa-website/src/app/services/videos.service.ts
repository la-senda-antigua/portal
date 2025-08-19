import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  GetVideosResponse,
  VideoModel,
  VideoPlaylist,
  VideoStoreState,
} from '../models/video.model';
import {
  BibleStudyBatchLoaded,
  PreachingBatchLoaded,
  VideoPlaylistsLoaded,
} from '../state/videos.actions';
import {
  selectBibleStudiesCurrentPage,
  selectBibleStudiesInStore,
  selectBibleStudiesState,
  selectHydratedPlaylists,
  selectPastorPreachingsInStore,
  selectPlaylists,
  selectPreachingsCurrentPage,
  selectPreachingsInStore,
  selectPreachingsState,
} from '../state/videos.selectors';
import { VideoListType } from '../models/app.config.models';

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
  public pastorPreachingsInStore = this.store.selectSignal(
    selectPastorPreachingsInStore
  );

  private bibleStudiesStoreState = this.store.selectSignal(
    selectBibleStudiesState
  );
  private bibleStudiesCurrentPage = this.store.selectSignal(
    selectBibleStudiesCurrentPage
  );
  public bibleStudiesInStore = this.store.selectSignal(
    selectBibleStudiesInStore
  );

  private playlistsInStore = this.store.selectSignal(selectPlaylists);
  public hydratedPlaylists = this.store.selectSignal(selectHydratedPlaylists);

  private loadVideosTimer?: any;

  loadVideoBatch(type: VideoListType) {
    if (this.loadVideosTimer) {
      clearTimeout(this.loadVideosTimer);
      this.loadVideosTimer = undefined;
    }
    this.loadVideosTimer = setTimeout(() => {
      if( this.playlistsInStore().length === 0) {
        this.getAllPlaylists();
      }
      switch (type) {
        case VideoListType.BibleStudies:
          this.loadBibleStudiesBatch();
          break;
        default:
          this.loadPreachingBatch();
      }
    }, 500);
  }

  getTotalVideos(type: VideoListType): number {
    switch (type) {
      case VideoListType.BibleStudies:
        return this.bibleStudiesStoreState().totalVideos;
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
      .get<GetVideosResponse>(
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
                  preacherId: i.preacher.id,
                  playlist: i.playlist,
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

  loadAllBibleStudies(): void {
    const currentPage = this.bibleStudiesCurrentPage();
    const totalPages = this.bibleStudiesStoreState().totalPages;
    const pageSize = this.bibleStudiesStoreState().pageSize;
    for (let i = currentPage; i < totalPages; i++) {
      this.loadBibleStudiesBatch(pageSize, i + 1);
    }
  }

  private loadBibleStudiesBatch(
    pageSize = 100,
    page: number | undefined = undefined
  ): void {
    if (page === undefined) {
      page = this.bibleStudiesCurrentPage() + 1;
    }
    this.httpClient
      .get<GetVideosResponse>(
        `${this.baseUrl}/lessons?page=${page}&pageSize=${pageSize}`
      )
      .pipe(
        map((response) => {
          return {
            currentPage: response.page,
            pageSize: response.pageSize,
            videosInStore: response.items.map(
              (i) =>
                ({
                  id: i.id,
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
        this.store.dispatch(BibleStudyBatchLoaded(state))
      );
  }

  private getAllPlaylists() {
    this.httpClient
      .get<VideoPlaylist[]>(`${this.baseUrl}/videoplaylist/getall`)
      .subscribe((playlists) => {
        this.store.dispatch(VideoPlaylistsLoaded({ playlists }));
      });
  }
}
