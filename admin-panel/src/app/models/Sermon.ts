export interface Sermon {
  sermonId: number;
  date: string;
  title: string;
  audioPath: string;
  videoPath: string;
  hasVideo: boolean;
  hasAudio: boolean;
  preacherName: string;
  cover: string;
}
