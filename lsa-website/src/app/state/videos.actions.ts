import { createAction, props } from '@ngrx/store';
import { VideoPlaylist, VideoStoreState } from '../models/video.model';

export const PreachingBatchLoaded = createAction(
  '[Preachings] Batch Loaded',
  props<VideoStoreState>()
);

export const BibleStudyBatchLoaded = createAction(
  '[BibleStudies] Batch Loaded',
  props<VideoStoreState>()
);

export const GalleryVideoBatchLoaded = createAction(
  '[GalleryVideos] Batch Loaded',
  props<VideoStoreState>()
);

export const PreachingPlaylistLoaded = createAction(
  '[PreachingPlaylist] Loaded',
  props<{ playlists: ReadonlyArray<VideoPlaylist> }>()
);

export const BibleStudyPlaylistLoaded = createAction(
  '[BibleStudyPlaylist] Loaded',
  props<{ playlists: ReadonlyArray<VideoPlaylist> }>()
);

export const GalleryPlaylistLoaded = createAction(
  '[GalleryPlaylist] Loaded',
  props<{ playlists: ReadonlyArray<VideoPlaylist> }>()
);