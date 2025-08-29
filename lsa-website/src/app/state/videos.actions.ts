import { createAction, props } from '@ngrx/store';
import {
  VideoModel,
  VideoPlaylist,
  VideoStoreState,
} from '../models/video.model';

export const PreachingBatchLoaded = createAction(
  '[Preachings] Batch Loaded',
  props<VideoStoreState>()
);

export const BibleStudyBatchLoaded = createAction(
  '[BibleStudies] Batch Loaded',
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

export const AllGalleryVideosLoaded = createAction(
  '[GalleryVideos] All loaded',
  props<VideoStoreState>()
);

export const GalleryPlaylistLoaded = createAction(
  '[GalleryPlaylist] Loaded',
  props<{ playlists: ReadonlyArray<VideoPlaylist> }>()
);
