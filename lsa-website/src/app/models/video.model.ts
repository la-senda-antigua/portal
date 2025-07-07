export interface VideoModel {
  id: number;
  date: Date;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  preacher?: string;
}

export interface VideoStoreState {
  currentPage: number;
  pageSize: number;
  videosInStore: ReadonlyArray<VideoModel>;
  totalVideos: number;
  totalPages: number;
}

export interface SermonDto {
  id: number;
  date: string;
  title: string;
  videoPath: string;
  audioPath: string;
  cover: string;
  preacherId: number;
  preacher: { id: number; name: string };
}

export interface GetSermonsResponse {
  items: SermonDto[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
