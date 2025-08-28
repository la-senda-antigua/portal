import { createSelector } from '@ngrx/store';
import {
  HydratedVideoPlaylist,
  VideoModel,
  VideoPlaylist,
  VideoPlaylistState,
  VideoStoreState,
} from '../models/video.model';
import {
  bibleStudiesReducer,
  bibleStudyPlaylistReducer,
  galleryPlaylistReducer,
  galleryVideosReducer,
  preachingPlaylistReducer,
  preachingsReducer,
} from './videos.reducers';

export interface AppState {
  preachings: VideoStoreState;
  bibleStudies: VideoStoreState;
  galleryVideos: VideoStoreState;
  preachingPlaylists: VideoPlaylistState;
  bibleStudyPlaylists: VideoPlaylistState;
  galleryPlaylists: VideoPlaylistState;
}

export const AppStateReducerMap = {
  preachings: preachingsReducer,
  bibleStudies: bibleStudiesReducer,
  galleryVideos: galleryVideosReducer,
  preachingPlaylists: preachingPlaylistReducer,
  bibleStudyPlaylists: bibleStudyPlaylistReducer,
  galleryPlaylists: galleryPlaylistReducer,
};

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

export const selectGalleryVideosState = (state: AppState) => state.bibleStudies;

export const selectGalleryVideosInStore = createSelector(
  selectGalleryVideosState,
  (state: VideoStoreState) => state.videosInStore
);

export const selectGalleryVideosCurrentPage = createSelector(
  selectGalleryVideosState,
  (state: VideoStoreState) => state.currentPage
);

export const selectPreachingPlaylists = (state: AppState) =>
  state.preachingPlaylists;

export const selectBibleStudyPlaylists = (state: AppState) =>
  state.bibleStudyPlaylists;

export const selectGalleryPlaylists = (state: AppState) =>
  state.galleryPlaylists;

function hydratePlaylists(
  playlists: ReadonlyArray<VideoPlaylist>,
  videos: ReadonlyArray<VideoModel>
): ReadonlyArray<HydratedVideoPlaylist> {
  return playlists
    .map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      videos: videos.filter((video) => video.playlist === playlist.id),
    }))
    .filter((pl) => pl.videos.length > 0);
}

export const selectHydratedPreachingPlaylists = createSelector(
  selectPreachingPlaylists,
  selectPreachingsInStore,
  (playlistsState, videos) => hydratePlaylists(playlistsState.playlists, videos)
);

export const selectHydratedBibleStudyPlaylists = createSelector(
  selectBibleStudyPlaylists,
  selectBibleStudiesInStore,
  (playlistsState, videos) => hydratePlaylists(playlistsState.playlists, videos)
);

export const selectHydratedGalleryPlaylists = createSelector(
  selectGalleryPlaylists,
  selectGalleryVideosInStore,
  (playlistsState, videos) => hydratePlaylists(playlistsState.playlists, videos)
);
