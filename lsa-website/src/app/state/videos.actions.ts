import { createAction, props } from '@ngrx/store';
import { PlaylistStoreState, VideoStoreState } from '../models/video.model';

export const PreachingBatchLoaded = createAction(
  '[Preachings] Batch Loaded',
  props<VideoStoreState>()
);

export const BibleStudyBatchLoaded = createAction(
  '[BibleStudies] Batch Loaded',
  props<VideoStoreState>()
);

export const VideoPlaylistsLoaded = createAction(
  '[VideoPlaylists] Loaded',
  props<PlaylistStoreState>()
);
