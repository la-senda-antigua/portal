import {
  Component,
  computed,
  effect,
  inject,
  input,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { VideoListConfig } from 'src/app/models/app.config.models';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { MatButtonModule } from '@angular/material/button';
import { SearchboxComponent } from '../searchbox/searchbox.component';
import { VideoModel } from 'src/app/models/video.model';
import { VideosService } from 'src/app/services/videos.service';

@Component({
  selector: 'lsa-video-list',
  imports: [DescriptionBlockComponent, MatButtonModule, SearchboxComponent],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss',
})
export class VideoListComponent {
  readonly videosService = inject(VideosService);
  readonly config = input.required<VideoListConfig>();
  readonly button = computed(() => this.config().button);
  readonly searchBox = computed(() => this.config().searchBox);
  readonly descriptionBlock = computed(() => this.config().descriptionBlock);
  readonly type = computed(() => this.config().type);
  readonly videos = signal<readonly VideoModel[]>([]);

  constructor() {
    effect(() => {
      if (this.config() != undefined && this.type() === 'preachings') {
        const preachings = this.videosService.getPreachings();
        if (preachings().length > 0) {
          untracked(() => {
            this.videos.set(preachings());
          });
        }
      }
    });
  }
}
