import { Preacher } from "./Preacher";

export interface Sermon {
  id: number;
  date: string;
  title: string;
  audioPath: string;
  videoPath: string;
  hasVideo: boolean;
  hasAudio: boolean;
  preacherName: string;
  cover: string;

  preacher: Preacher;
}

export interface SermonDto{
  id?: number;
  date: string;
  title: string;
  preacherId: number;
  videoPath: string;
}
