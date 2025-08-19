export interface VideoModel {
  id: number;
  date: Date;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  preacher?: string;
  preacherId?: number;
  playlist?: string;
}

export interface VideoPlaylist {
  id: string;
  name: string;
}

export interface HydratedPlaylist extends VideoPlaylist {
  videos: ReadonlyArray<VideoModel>;
}

export interface VideoStoreState {
  currentPage: number;
  pageSize: number;
  videosInStore: ReadonlyArray<VideoModel>;
  totalVideos: number;
  totalPages: number;
}

export interface PlaylistStoreState{
  playlists: ReadonlyArray<VideoPlaylist>;
}

export interface VideoRecordingDto {
  id: number;
  date: string;
  title: string;
  videoPath: string;
  audioPath?: string;
  cover: string;
  preacherId: number;
  preacher: { id: number; name: string };
  playlist?: string;
}

export interface GetVideosResponse {
  items: VideoRecordingDto[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}