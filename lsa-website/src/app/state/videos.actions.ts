import { createAction, props } from '@ngrx/store';
import { VideoStoreState } from '../models/video.model';

export const PreachingBatchLoaded = createAction(
  '[Preachings] Batch Loaded',
  props<VideoStoreState>()
);
