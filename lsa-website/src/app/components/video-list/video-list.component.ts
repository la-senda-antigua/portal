import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { VideoListConfig } from 'src/app/models/app.config.models';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { MatButtonModule } from '@angular/material/button';
import { SearchboxComponent } from '../searchbox/searchbox.component';
import { VideosService } from 'src/app/services/videos.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'lsa-video-list',
  imports: [
    DescriptionBlockComponent,
    MatButtonModule,
    SearchboxComponent,
    CommonModule,
    MatCardModule,
  ],
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
  readonly videos = computed(() => this.videosService.preachingsInStore());
  readonly currentViewSize = signal(0);
  readonly disableLoadMore = computed(
    () => this.videos().length >= this.videosService.getTotalVideos(this.type())
  );
  private loadSize?: number;
  private lastThumbnailError?: string;
  cardHovered: number | undefined;

  constructor() {
    effect(() => {
      if (this.config() != undefined) {
        this.loadSize = this.config().size;
        untracked(() => {
          this.videosService.loadVideoBatch(this.type());
          if (this.currentViewSize() === 0) {
            this.currentViewSize.set(this.loadSize!);
          }
        });
      }
    });
  }

  loadMore() {
    if (this.loadSize == undefined) {
      return;
    }
    const nextViewSize = this.currentViewSize() + this.loadSize;
    if (nextViewSize > this.videos().length) {
      this.videosService.loadVideoBatch(this.type());
    }
    this.currentViewSize.set(nextViewSize);
  }

  handleMissingThumbnail(event: Event) {
    const img = event.target as HTMLImageElement;
    const errorSrc = img.src;
    if (this.lastThumbnailError === errorSrc) {
      return;
    }
    this.lastThumbnailError = errorSrc;
    img.src = 'assets/images/video-default-thumbnail.jpg';
  }
}
