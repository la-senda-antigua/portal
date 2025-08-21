import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { iif, map, Observable, of, switchMap } from 'rxjs';
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
    MatIconModule,
    SearchboxComponent,
    CommonModule,
  ],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss',
})
export class VideoListComponent {
  readonly carrouselContainer = viewChild<ElementRef>('carrouselContainer');
  readonly videoListContainer = viewChild<ElementRef>('videoListContainer');
  readonly videosService = inject(VideosService);
  readonly config = input.required<VideoListConfig>();
  readonly button = computed(() => this.config().button);
  readonly searchBox = computed(() => this.config().searchBox);
  readonly descriptionBlock = computed(() => this.config().descriptionBlock);
  readonly type = computed(() => this.config().type);
  readonly videos = computed(() => {
    switch (this.config().type) {
      case 'biblestudies':
        return [...this.videosService.bibleStudiesInStore()].sort((a, b) =>
          a.date < b.date ? 1 : -1
        );

      default:
        return [...this.videosService.preachingsInStore()].sort((a, b) =>
          a.date < b.date ? 1 : -1
        );
    }
  });
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

  readonly videoListContainerLeftPosition = signal(0);

  // number of pixels that a video card takes in the carrousel
  readonly videoSize = computed(
    () =>
      (this.videoListContainer()?.nativeElement.offsetWidth ?? 0) /
      (this.filteredVideos().length || 1)
  );
  // number of videos that can be displayed in the carrouselContainer at once
  readonly numberOfVideosPerViewPort = computed(() => {
    return Math.floor(
      (this.carrouselContainer()?.nativeElement.offsetWidth ?? 0) /
        (this.videoSize() ?? 1)
    );
  });

  // scroll size is the number of videos that can be scrolled at once
  readonly scrollSize = computed(() => {
    return this.numberOfVideosPerViewPort() > 2
      ? this.numberOfVideosPerViewPort() - 1
      : 1;
  });

  // videos that are currently being viewed or have been scrolled to the left
  readonly numberOfVideosViewed = computed(() => {
    const position = Math.abs(this.videoListContainerLeftPosition());
    const viewedVideos = position / (this.videoSize() ?? 1);
    return viewedVideos + this.numberOfVideosPerViewPort();
  });

  readonly shouldLoadMore = computed(() => {
    return (
      this.numberOfVideosViewed() >= this.filteredVideos().length &&
      !this.allVideosLoaded()
    );
  });

  constructor() {
    effect(() => {
      if (this.config() != undefined) {
        untracked(() => {
          this.videosService.loadVideoBatch(this.type());
        });
      }
    });
  }

  scrollLeft() {
    const currentPosition = this.videoListContainerLeftPosition();
    if (currentPosition >= 0) {
      return;
    }
    const newPosition =
      currentPosition + (this.videoSize() ?? 1) * this.scrollSize();
    this.videoListContainerLeftPosition.set(newPosition);
  }

  scrollRight() {
    of(this.shouldLoadMore())
      .pipe(
        switchMap((shouldLoadMore) => {
          if (shouldLoadMore) {
            return this.loadMore();
          }
          return of(void 0);
        })
      )
      .subscribe(() => {
        const currentPosition = this.videoListContainerLeftPosition();
        const scrollStep =
          this.filteredVideos().length - this.numberOfVideosViewed() >=
          this.scrollSize()
            ? this.scrollSize() * (this.videoSize() ?? 1)
            : (this.filteredVideos().length - this.numberOfVideosViewed()) *
              (this.videoSize() ?? 1);
        const newPosition = currentPosition - scrollStep;
        this.videoListContainerLeftPosition.set(newPosition);
      });
  }

  loadMore(): Observable<void> {
    const query = this.getNoAccentString(this.searchQuery().trim());
    if (!this.allVideosLoaded() && query !== '') {
      return this.videosService.loadAllSermons();
    }

    return this.videosService
      .loadVideoBatch(this.type())
      .pipe(map(() => void 0));
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
