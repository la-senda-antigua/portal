import { createSelector, select } from '@ngrx/store';
import {
  HydratedPlaylist,
  PlaylistStoreState,
  VideoStoreState,
} from '../models/video.model';

export interface AppState {
  preachings: VideoStoreState;
  bibleStudies: VideoStoreState;
  playlists: PlaylistStoreState;
}

export const selectPreachingsState = (state: AppState) => state.preachings;

export const selectPreachingsInStore = createSelector(
  selectPreachingsState,
  (state: VideoStoreState) =>
    state.videosInStore.filter(
      (video) => !video.preacherId || video.preacherId !== 4
    )
);

export const selectPastorPreachingsInStore = createSelector(
  selectPreachingsState,
  (state: VideoStoreState) =>
    state.videosInStore.filter((video) => video.preacherId === 4)
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

export const selectPlaylistsState = (state: AppState) => state.playlists;

export const selectPlaylists = createSelector(
  selectPlaylistsState,
  (state: PlaylistStoreState) => state.playlists
);

export const selectHydratedPlaylists = createSelector(
  selectPlaylists,
  selectBibleStudiesInStore,
  selectPastorPreachingsInStore,
  (playlists, studies, preachings) => {
    const hydratedPlaylists: HydratedPlaylist[] = playlists.map((playlist) => ({
      ...playlist,
      videos: [
        ...studies.filter((video) => video.playlist === playlist.id),
        ...preachings.filter((video) => video.playlist === playlist.id),
      ].sort((a, b) => (a.date > b.date ? -1 : 1)),
    }));
    return hydratedPlaylists;
  }
);
