import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of, switchMap } from 'rxjs';
import { VideoModel } from 'src/app/models/video.model';
import { VideoCardComponent } from '../video-card/video-card.component';

@Component({
  selector: 'lsa-video-carrousel',
  imports: [
    VideoCardComponent,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './video-carrousel.component.html',
  styleUrl: './video-carrousel.component.scss',
})
export class VideoCarrouselComponent {
  readonly carrouselContainer = viewChild<ElementRef>('carrouselContainer');
  readonly videoListContainer = viewChild<ElementRef>('videoListContainer');

  readonly videos = input.required<VideoModel[]>();
  readonly moreVideosLoadedObservable = input<Observable<boolean>>();

  readonly moreVideosRequested = output<void>();

  readonly searchQuery = signal('');
  readonly videoListContainerLeftPosition = signal(0);

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
  // videos that are currently being viewed or have been scrolled to the left
  readonly numberOfVideosViewed = computed(() => {
    const position = Math.abs(this.videoListContainerLeftPosition());
    const viewedVideos = position / (this.videoSize() ?? 1);
    return viewedVideos + this.numberOfVideosPerViewPort();
  });

  readonly shouldLoadMore = computed(
    () => this.numberOfVideosViewed() >= this.videos().length
  );

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
    if(this.moreVideosLoadedObservable() == undefined){
      return of(false);
    }

    this.moreVideosRequested.emit();
    return this.moreVideosLoadedObservable()!
  }

  handleMissingThumbnail(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/video-default-thumbnail.jpg';
  }
}
