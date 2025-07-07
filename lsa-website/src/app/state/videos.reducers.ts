import { createReducer, on } from '@ngrx/store';
import { VideoStoreState } from '../models/video.model';
import { PreachingBatchLoaded } from './videos.actions';

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
