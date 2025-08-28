import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { delay, Observable, of, switchMap, take, tap } from 'rxjs';
import { HydratedVideoPlaylist, VideoModel } from 'src/app/models/video.model';
import { VideoCardComponent } from '../video-card/video-card.component';
import { VideoCollageComponent } from '../video-collage/video-collage.component';

@Component({
  selector: 'lsa-video-carrousel',
  imports: [
    VideoCardComponent,
    VideoCollageComponent,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './video-carrousel.component.html',
  styleUrl: './video-carrousel.component.scss',
})
export class VideoCarrouselComponent {
  readonly videoClick = output<HydratedVideoPlaylist | VideoModel>();
  readonly moreVideosRequested = output<void>();

  readonly carrouselContainer = viewChild<ElementRef>('carrouselContainer');
  readonly videoListContainer = viewChild<ElementRef>('videoListContainer');

  readonly videos = input.required<VideoModel[] | HydratedVideoPlaylist[]>();
  readonly allVideosLoaded = input<boolean>(true);
  readonly moreVideosLoadedObservable = input<Observable<boolean>>();
  readonly resetLeftScroll = input<boolean>(false);
  readonly selectedVideo = input<VideoModel | undefined>(undefined);
  readonly emitVideoClick = input(false);

  readonly videoListContainerLeftPosition = signal(0);

  readonly videoCards = computed(() => {
    return this.videos()
      .filter((v) => (v as VideoModel).videoUrl != undefined)
      .map((v) => v as VideoModel);
  });
  readonly playlistCards = computed(() => {
    return this.videos()
      .filter((v) => (v as HydratedVideoPlaylist).videos.length > 0)
      .map((v) => v as HydratedVideoPlaylist);
  });
  // number of pixels that a video card takes in the carrousel
  readonly videoSize = computed(
    () =>
      (this.videoListContainer()?.nativeElement.offsetWidth ?? 0) /
      (this.videos().length || 1)
  );
  // number of videos that can be displayed in the carrouselContainer at once
  readonly numberOfVideosPerViewPort = computed(() => {
    return Math.floor(
      (this.carrouselContainer()?.nativeElement.offsetWidth ?? 0) /
        (this.videoSize() ?? 1)
    );
  });
  // Number of videos that can be scrolled at once
  readonly scrollSize = computed(() => {
    return this.numberOfVideosPerViewPort() > 2
      ? this.numberOfVideosPerViewPort() - 1
      : 1;
  });
  // video cards that are currently being viewed or have been scrolled to the left
  readonly numberOfVideosViewed = computed(() => {
    const position = Math.abs(this.videoListContainerLeftPosition());
    const viewedVideos = position / (this.videoSize() ?? 1);
    const currentVideosInView =
      this.videos().length > this.numberOfVideosPerViewPort()
        ? this.numberOfVideosPerViewPort()
        : this.videos().length;
    return viewedVideos + currentVideosInView;
  });

  readonly shouldLoadMore = computed(
    () =>
      !this.allVideosLoaded() &&
      this.numberOfVideosViewed() >= this.videos().length - this.scrollSize()
  );

  constructor() {
    effect(() => {
      if (this.resetLeftScroll() === false) {
        return;
      }
      untracked(() => this.videoListContainerLeftPosition.set(0));
    });
  }

  scrollLeft() {
    const currentPosition = this.videoListContainerLeftPosition();
    if (currentPosition >= 0) {
      return;
    }
    const newPosition =
      currentPosition + (this.videoSize() ?? 1) * this.scrollSize();
    if (newPosition > 0) {
      this.videoListContainerLeftPosition.set(0);
      return;
    }
    this.videoListContainerLeftPosition.set(newPosition);
  }

  scrollRight() {
    of(this.shouldLoadMore())
      .pipe(
        switchMap((shouldLoadMore) => {
          if (shouldLoadMore) {
            return this.loadMore().pipe(delay(500));
          }
          return of(true);
        })
      )
      .subscribe((shouldScroll) => {
        if (!shouldScroll) {
          return;
        }
        const currentPosition = this.videoListContainerLeftPosition();
        const scrollStep =
          this.videos().length - this.numberOfVideosViewed() >=
          this.scrollSize()
            ? this.scrollSize() * (this.videoSize() ?? 1)
            : (this.videos().length - this.numberOfVideosViewed()) *
              (this.videoSize() ?? 1);
        const newPosition = currentPosition - scrollStep;
        this.videoListContainerLeftPosition.set(newPosition);
      });
  }

  loadMore(): Observable<boolean> {
    this.moreVideosRequested.emit();

    if (this.moreVideosLoadedObservable() == undefined) {
      return of(false);
    }

    return this.moreVideosLoadedObservable()!.pipe(take(1));
  }

  handleMissingThumbnail(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/video-default-thumbnail.jpg';
  }
}
