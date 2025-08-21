import { Component, computed, input } from '@angular/core';
import { VideoModel } from 'src/app/models/video.model';
import { VideoCardComponent } from '../video-card/video-card.component';

@Component({
  selector: 'lsa-video-collage',
  imports: [VideoCardComponent],
  templateUrl: './video-collage.component.html',
  styleUrl: './video-collage.component.scss',
})
export class VideoCollageComponent {
  readonly videos = input.required<ReadonlyArray<VideoModel>>();
  readonly title = input.required<string>();
  readonly collageCover = computed(() => {
    return {
      title: this.title(),
      thumbnailUrl: this.videos()[0].thumbnailUrl,
    } as any;
  });
  readonly collapsedVideos = computed(() =>
    this.videos().map(
      (v) => ({ thumbnailUrl: v.thumbnailUrl, title: this.title() } as any)
    )
  );
}
