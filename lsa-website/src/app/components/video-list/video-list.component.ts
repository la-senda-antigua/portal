import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { VideoListConfig } from 'src/app/models/app.config.models';
import { VideosService } from 'src/app/services/videos.service';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { SearchboxComponent } from '../searchbox/searchbox.component';
import { VideoCardComponent } from '../video-card/video-card.component';

@Component({
  selector: 'lsa-video-list',
  imports: [
    DescriptionBlockComponent,
    VideoCardComponent,
    MatButtonModule,
    SearchboxComponent,
    CommonModule,
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
  readonly videos = computed(() =>
    [...this.videosService.preachingsInStore()].sort((a, b) =>
      a.date < b.date ? 1 : -1
    )
  );
  readonly currentViewSize = signal(0);
  readonly searchQuery = signal('');
  readonly filteredVideos = computed(() => {
    const query = this.getNoAccentString(this.searchQuery().trim());
    if (query === '') {
      return this.videos();
    }
    return this.videos().filter(
      (video) =>
        this.getNoAccentString(video.preacher).includes(query) ||
        this.getNoAccentString(video.title).includes(query)
    );
  });
  readonly allVideosLoaded = computed(() => {
    return (
      this.videos().length >= this.videosService.getTotalVideos(this.type())
    );
  });
  readonly disableLoadMore = computed(() => {
    if (this.allVideosLoaded()) {
      return this.currentViewSize() >= this.filteredVideos().length;
    }
    return false;
  });

  private loadSize?: number;

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

    const query = this.getNoAccentString(this.searchQuery().trim());
    if (!this.allVideosLoaded() && query !== '') {
      this.videosService.loadAllSermons();
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
    img.src = 'assets/images/video-default-thumbnail.jpg';
  }

  private getNoAccentString(query?: string) {
    return (query ?? '')
      .toLowerCase()
      .replaceAll('á', 'a')
      .replaceAll('é', 'e')
      .replaceAll('í', 'i')
      .replaceAll('ó', 'o')
      .replaceAll('ú', 'u')
      .replaceAll('ñ', 'n');
  }
}
