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

//#region Preachings
export const selectPreachingsState = (state: AppState) => state.preachings;

export const selectPreachingsInStore = createSelector(
  selectPreachingsState,
  (state: VideoStoreState) => state.videosInStore
);

export const selectPreachingsCurrentPage = createSelector(
  selectPreachingsState,
  (state: VideoStoreState) => state.currentPage
);

export const selectPreachingPlaylists = (state: AppState) =>
  state.preachingPlaylists;

export const selectHydratedPreachingPlaylists = createSelector(
  selectPreachingPlaylists,
  selectPreachingsInStore,
  (playlistsState, videos) => hydratePlaylists(playlistsState.playlists, videos)
);
//#endregion Preachings

//#region Bible Courses
export const selectBibleStudiesState = (state: AppState) => state.bibleStudies;

export const selectBibleStudiesInStore = createSelector(
  selectBibleStudiesState,
  (state: VideoStoreState) => state.videosInStore
);

export const selectBibleStudiesCurrentPage = createSelector(
  selectBibleStudiesState,
  (state: VideoStoreState) => state.currentPage
);

export const selectBibleStudyPlaylists = (state: AppState) =>
  state.bibleStudyPlaylists;

export const selectHydratedBibleStudyPlaylists = createSelector(
  selectBibleStudyPlaylists,
  selectBibleStudiesInStore,
  (playlistsState, videos) => hydratePlaylists(playlistsState.playlists, videos)
);
//#endregion Bible Courses

//#region Gallery Videos
export const selectGalleryVideosState = (state: AppState) =>
  state.galleryVideos;

export const selectGalleryVideosInStore = createSelector(
  selectGalleryVideosState,
  (state: VideoStoreState) => state.videosInStore
);

export const selectGalleryPlaylists = (state: AppState) =>
  state.galleryPlaylists;

/**
 * selects the videos that are not part of a playlist
 */
export const selectSingleGalleryVideos = createSelector(
  selectGalleryVideosInStore,
  (videos) =>
    videos.filter(
      (v) =>
        v.playlist == undefined ||
        v.playlist === '' ||
        v.playlist === '00000000-0000-0000-0000-000000000000'
    )
);

export const selectHydratedGalleryPlaylists = createSelector(
  selectGalleryPlaylists,
  selectGalleryVideosInStore,
  (playlistsState, videos) => hydratePlaylists(playlistsState.playlists, videos)
);

/**
 * selects all videos in the gallery, the single ones, and the hydrated playlists
 */
export const selectAllGalleryVideosAndPlaylists = createSelector(
  selectHydratedGalleryPlaylists,
  selectSingleGalleryVideos,
  (playlists, videos) =>
    [...playlists, ...videos].sort((a, b) => (a.date < b.date ? 1 : -1))
);
//#endregion Gallery Videos

//#region Common Functions
function getLastVideoDate(videos: ReadonlyArray<VideoModel>) {
  if (videos?.length > 0) {
    const sortedVideos = [...videos].sort((a, b) => (a.date < b.date ? 1 : -1));
    return sortedVideos[0].date;
  }
  return new Date(0, 0, 0);
}

function hydratePlaylists(
  playlists: ReadonlyArray<VideoPlaylist>,
  videos: ReadonlyArray<VideoModel>
): ReadonlyArray<HydratedVideoPlaylist> {
  return playlists
    .map((playlist) => {
      const plVideos = videos.filter((video) => video.playlist === playlist.id);
      const date = getLastVideoDate(plVideos);
      const preachers = plVideos
        .filter((v) => v.preacher)
        .map((v) => v.preacher) as string[];
      const maestros = [...new Set(preachers)];
      return {
        id: playlist.id,
        name: playlist.name,
        videos: plVideos,
        maestros,
        date,
      };
    })
    .filter((pl) => pl.videos.length > 0)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
//#endregion
