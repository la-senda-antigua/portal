import { createReducer, on } from '@ngrx/store';
import { VideoPlaylistState, VideoStoreState } from '../models/video.model';
import {
  AllGalleryVideosLoaded,
  BibleStudyBatchLoaded,
  BibleStudyPlaylistLoaded,
  GalleryPlaylistLoaded,
  PreachingBatchLoaded,
  PreachingPlaylistLoaded,
} from './videos.actions';

//#region Preachings
export const preachingsInitialState: VideoStoreState = {
  currentPage: 0,
  pageSize: 0,
  videosInStore: [],
  totalVideos: 0,
  totalPages: 0,
};

export const preachingsReducer = createReducer(
  preachingsInitialState,
  on(PreachingBatchLoaded, (oldState, newState) => ({
    currentPage: newState.currentPage,
    pageSize: newState.pageSize,
    videosInStore: [
      ...oldState.videosInStore,
      ...newState.videosInStore.filter(
        (v) => !oldState.videosInStore.some((ov) => ov.id === v.id)
      ),
    ],
    totalVideos: newState.totalVideos,
    totalPages: newState.totalPages,
  }))
);

const preachingPlaylistInitialState: VideoPlaylistState = {
  playlists: [],
};

export const preachingPlaylistReducer = createReducer(
  preachingPlaylistInitialState,
  on(PreachingPlaylistLoaded, (state, { playlists }) => ({
    playlists: [...playlists],
  }))
);
//#endregion

//#region Bible Courses
export const bibleStudiesInitialState: VideoStoreState = {
  currentPage: 0,
  pageSize: 0,
  videosInStore: [],
  totalVideos: 0,
  totalPages: 0,
};

export const bibleStudiesReducer = createReducer(
  bibleStudiesInitialState,
  on(BibleStudyBatchLoaded, (oldState, newState) => ({
    currentPage: newState.currentPage,
    pageSize: newState.pageSize,
    videosInStore: [
      ...oldState.videosInStore,
      ...newState.videosInStore.filter(
        (v) => !oldState.videosInStore.some((ov) => ov.id === v.id)
      ),
    ],
    totalVideos: newState.totalVideos,
    totalPages: newState.totalPages,
  }))
);

const bibleStudyPlaylistInitialState: VideoPlaylistState = {
  playlists: [],
};

export const bibleStudyPlaylistReducer = createReducer(
  bibleStudyPlaylistInitialState,
  on(BibleStudyPlaylistLoaded, (state, { playlists }) => ({
    playlists: [...playlists],
  }))
);
//#endregion

//#region Gallery Videos
export const galleryVideosInitialState: VideoStoreState = {
  videosInStore: [],
};

export const galleryVideosReducer = createReducer(
  galleryVideosInitialState,
  on(AllGalleryVideosLoaded, (oldState, newState) => ({
    videosInStore: [
      ...oldState.videosInStore,
      ...newState.videosInStore.filter(
        (v) => !oldState.videosInStore.some((ov) => ov.id === v.id)
      ),
    ],
  }))
);

const galleryPlaylistInitialState: VideoPlaylistState = {
  playlists: [],
};

export const galleryPlaylistReducer = createReducer(
  galleryPlaylistInitialState,
  on(GalleryPlaylistLoaded, (state, { playlists }) => ({
    playlists: [...playlists],
  }))
);
//#endregion
