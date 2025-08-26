import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { forkJoin, map, Observable, skip, Subject, switchMap, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VideoListType } from '../models/app.config.models';
import {
  GetVideosResponse,
  VideoModel,
  VideoPlaylist,
  VideoStoreState,
} from '../models/video.model';
import {
  BibleStudyBatchLoaded,
  BibleStudyPlaylistLoaded,
  GalleryPlaylistLoaded,
  GalleryVideoBatchLoaded,
  PreachingBatchLoaded,
  PreachingPlaylistLoaded,
} from '../state/videos.actions';
import {
  selectBibleStudiesCurrentPage,
  selectBibleStudiesInStore,
  selectBibleStudiesState,
  selectGalleryVideosCurrentPage,
  selectGalleryVideosInStore,
  selectGalleryVideosState,
  selectHydratedPreachingPlaylists,
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
  public preachingPlaylists = this.store.selectSignal(selectHydratedPreachingPlaylists);

  private bibleStudiesStoreState = this.store.selectSignal(
    selectBibleStudiesState
  );
  private bibleStudiesCurrentPage = this.store.selectSignal(
    selectBibleStudiesCurrentPage
  );
  public bibleStudiesInStore = this.store.selectSignal(
    selectBibleStudiesInStore
  );

  private galleryVideosStoreState = this.store.selectSignal(
    selectGalleryVideosState
  );
  private galleryVideosCurrentPage = this.store.selectSignal(
    selectGalleryVideosCurrentPage
  );
  public galleryVideosInStore = this.store.selectSignal(
    selectGalleryVideosInStore
  );

  private videoBatchLoaded$ = new Subject();

  loadVideoBatch(type: VideoListType, batchSize = 100) {
    switch (type) {
      case VideoListType.BibleStudies:
        this.loadBibleStudiesBatch(batchSize);
        return this.videoBatchLoaded$.asObservable();
      case VideoListType.Preachings:
        this.loadPreachingBatch(batchSize);
        return this.videoBatchLoaded$.asObservable();
      case VideoListType.GalleryVideos:
        this.loadGalleryVideosBatch(batchSize);
        return this.videoBatchLoaded$.asObservable();
    }
  }

  getTotalVideos(type: VideoListType) {
    switch (type) {
      case VideoListType.BibleStudies:
        return this.bibleStudiesStoreState().totalVideos;
      default:
        return this.preachingsStoreState().totalVideos;
    }
  }

  loadAllVideos(type: VideoListType): Observable<void> {
    switch (type) {
      case VideoListType.BibleStudies:
        return this.loadAllBibleStudies();
      default:
        return this.loadAllSermons();
    }
  }

  loadAllSermons(): Observable<void> {
    const currentPage = this.preachingsCurrentPage();
    const totalPages = this.preachingsStoreState().totalPages;
    const pageSize = this.preachingsStoreState().pageSize;
    const pagedItems = [];
    for (let i = currentPage; i < totalPages; i++) {
      pagedItems.push({ pageSize, page: i + 1 });
    }
    const observables = pagedItems.map((item) =>
      this.loadPreachingBatch(item.pageSize, item.page)
    );
    return forkJoin([observables]).pipe(map(() => void 0));
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
                  id: i.id,
                  playlist: i.playlist
                } as VideoModel)
            ),
            totalVideos: response.totalItems,
            totalPages: response.totalPages,
          };
        }),
        switchMap((state: VideoStoreState) => {
          const preachingsObservable = this.store.select(selectPreachingsInStore).pipe(skip(1), take(1));
          this.store.dispatch(PreachingBatchLoaded(state));
          return preachingsObservable;
        })
      )
      .subscribe(() => {
        this.videoBatchLoaded$.next(null);
      });
  }

  loadAllBibleStudies(): Observable<void> {
    const currentPage = this.bibleStudiesCurrentPage();
    const totalPages = this.bibleStudiesStoreState().totalPages;
    const pageSize = this.bibleStudiesStoreState().pageSize;
    const pagedItems = [];
    for (let i = currentPage; i < totalPages; i++) {
      pagedItems.push({ pageSize, page: i + 1 });
    }
    pagedItems.map((item) =>
      this.loadBibleStudiesBatch(item.pageSize, item.page)
    );
    return forkJoin([pagedItems]).pipe(map(() => void 0));
  }

  loadPreachingPlaylists() {
    this.httpClient
      .get<VideoPlaylist[]>(`${this.baseUrl}/VideoPlaylist/SermonPlaylists`)
      .subscribe((playlists) =>
        this.store.dispatch(PreachingPlaylistLoaded({ playlists }))
      );
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
      .subscribe((state: VideoStoreState) => {
        this.store.dispatch(BibleStudyBatchLoaded(state));
        this.videoBatchLoaded$.next(null);
      });
  }

  loadBibleStudyPlaylists() {
    this.httpClient
      .get<VideoPlaylist[]>(`${this.baseUrl}/VideoPlaylist/LessonPlaylists`)
      .subscribe((playlists) =>
        this.store.dispatch(BibleStudyPlaylistLoaded({ playlists }))
      );
  }

  private loadGalleryVideosBatch(
    pageSize = 100,
    page: number | undefined = undefined
  ): void {
    if (page === undefined) {
      page = this.galleryVideosCurrentPage() + 1;
    }
    this.httpClient
      .get<GetVideosResponse>(
        `${this.baseUrl}/gallery?page=${page}&pageSize=${pageSize}`
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
      .subscribe((state: VideoStoreState) => {
        this.store.dispatch(GalleryVideoBatchLoaded(state));
        this.videoBatchLoaded$.next(null);
      });
  }

  loadGalleryVideosPlaylists() {
    this.httpClient
      .get<VideoPlaylist[]>(`${this.baseUrl}/VideoPlaylist/GalleryPlaylists`)
      .subscribe((playlists) =>
        this.store.dispatch(GalleryPlaylistLoaded({ playlists }))
      );
  }
}
