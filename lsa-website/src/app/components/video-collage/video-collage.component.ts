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
  readonly numberOfBackgroundCards = input<number>(3);
  readonly collageCover = computed(() => {
    return {
      title: this.title(),
      thumbnailUrl: this.videos()[0].thumbnailUrl,
    } as any;
  });
}
