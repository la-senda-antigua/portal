import { createReducer, on } from '@ngrx/store';
import { PlaylistStoreState, VideoModel, VideoPlaylist, VideoStoreState } from '../models/video.model';
import { BibleStudyBatchLoaded, PreachingBatchLoaded, VideoPlaylistsLoaded } from './videos.actions';

function reduceVideosInStore(
  oldState: VideoStoreState,
  newState: VideoStoreState
): ReadonlyArray<VideoModel> {
  const newVideos = newState.videosInStore.filter(
    video => !oldState.videosInStore.some(oldVideo => oldVideo.id === video.id)
  );
  return [...oldState.videosInStore, ...newVideos];
}

function reducePlaylistsInStore(
  oldState: PlaylistStoreState,
  newState: PlaylistStoreState
): ReadonlyArray<VideoPlaylist> {
  const newPlaylists = newState.playlists.filter(
    playlist => !oldState.playlists.some(oldPlaylist => oldPlaylist.id === playlist.id)
  );
  return [...oldState.playlists, ...newPlaylists];
}

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
    videosInStore: reduceVideosInStore(oldState, newState),
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
    videosInStore: reduceVideosInStore(oldState, newState),
    totalVideos: newState.totalVideos,
    totalPages: newState.totalPages,
  }))
);

export const playlistsInitialState: PlaylistStoreState = {
  playlists: [],
};

export const playlistsReducer = createReducer(
  playlistsInitialState,
  on(VideoPlaylistsLoaded, (olstate, newState) => ({
    playlists: reducePlaylistsInStore(olstate, newState)
  }))
);