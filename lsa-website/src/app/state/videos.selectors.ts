import { createSelector } from '@ngrx/store';
import { VideoStoreState } from '../models/video.model';

export interface AppState {
  preachings: VideoStoreState;
  bibleStudies: VideoStoreState;
}

export const selectPreachingsState = (state: AppState) => state.preachings;

export const selectPreachingsInStore = createSelector(
  selectPreachingsState,
  (state: VideoStoreState) => state.videosInStore
);

export const selectPreachingsCurrentPage = createSelector(
  selectPreachingsState,
  (state: VideoStoreState) => state.currentPage
);

export const selectBibleStudiesState = (state: AppState) => state.bibleStudies;

export const selectBibleStudiesInStore = createSelector(
  selectBibleStudiesState,
  (state: VideoStoreState) => state.videosInStore
);

export const selectBibleStudiesCurrentPage = createSelector(
  selectBibleStudiesState,
  (state: VideoStoreState) => state.currentPage
);