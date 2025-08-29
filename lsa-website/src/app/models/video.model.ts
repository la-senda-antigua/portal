export interface VideoModel {
  id: number;
  date: Date;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  preacher?: string;
  playlist?: string;
}

export interface VideoStoreState {
  currentPage?: number;
  pageSize?: number;
  videosInStore: ReadonlyArray<VideoModel>;
  totalVideos?: number;
  totalPages?: number;
}

export interface VideoPlaylistState{
  playlists: ReadonlyArray<VideoPlaylist>;
}

export interface VideoPlaylist{
  id: string;
  name: string;
  videoIds: ReadonlyArray<number>;
}

export interface HydratedVideoPlaylist {
  id: string;
  name: string;
  videos: ReadonlyArray<VideoModel>;
  maestros?: string[]
  date: Date;
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
