import { Preacher } from './Preacher';
import { VideoRecording } from './VideoRecording';
export interface SermonDto extends VideoRecording{
  preacherId: number;
}
export interface Sermon extends SermonDto {
  audioPath: string;
  hasVideo: boolean;
  hasAudio: boolean;
  preacherName: string;
  preacher: Preacher;
}