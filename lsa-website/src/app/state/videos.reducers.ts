import { createReducer, on } from '@ngrx/store';
import { VideoPlaylistState, VideoStoreState } from '../models/video.model';
import { BibleStudyBatchLoaded, BibleStudyPlaylistLoaded, GalleryPlaylistLoaded, PreachingBatchLoaded, PreachingPlaylistLoaded } from './videos.actions';

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
    videosInStore: [...oldState.videosInStore, ...newState.videosInStore],
    totalVideos: newState.totalVideos,
    totalPages: newState.totalPages,
  }))
);

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
    videosInStore: [...oldState.videosInStore, ...newState.videosInStore],
    totalVideos: newState.totalVideos,
    totalPages: newState.totalPages,
  }))
);

export const galleryVideosInitialState: VideoStoreState = {
  currentPage: 0,
  pageSize: 0,
  videosInStore: [],
  totalVideos: 0,
  totalPages: 0,
};

export const galleryVideosReducer = createReducer(
  galleryVideosInitialState,
  on(BibleStudyBatchLoaded, (oldState, newState) => ({
    currentPage: newState.currentPage,
    pageSize: newState.pageSize,
    videosInStore: [...oldState.videosInStore, ...newState.videosInStore],
    totalVideos: newState.totalVideos,
    totalPages: newState.totalPages,
  }))
);

const preachingPlaylistInitialState: VideoPlaylistState = {
  playlists: [],
};

export const preachingPlaylistReducer = createReducer(
  preachingPlaylistInitialState,
  on(PreachingPlaylistLoaded, (state, {playlists}) => ({
    playlists: [...state.playlists, ...playlists]
  }))
);

const bibleStudyPlaylistInitialState: VideoPlaylistState = {
  playlists: [],
};

export const bibleStudyPlaylistReducer = createReducer(
  bibleStudyPlaylistInitialState,
  on(BibleStudyPlaylistLoaded, (state, {playlists}) => ({
    playlists: [...state.playlists, ...playlists]
  }))
);

const galleryPlaylistInitialState: VideoPlaylistState = {
  playlists: [],
};

export const galleryPlaylistReducer = createReducer(
  galleryPlaylistInitialState,
  on(GalleryPlaylistLoaded, (state, {playlists}) => ({
    playlists: [...state.playlists, ...playlists]
  }))
);