import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  RecentServicesConfig,
  VideoListType,
} from 'src/app/models/app.config.models';
import { VideosService } from 'src/app/services/videos.service';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { SearchboxComponent } from '../searchbox/searchbox.component';
import { VideoCarrouselComponent } from '../video-list/video-carrrousel.component';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lsa-recent-services',
  imports: [
    DescriptionBlockComponent,
    SearchboxComponent,
    VideoCarrouselComponent,
    MatProgressSpinnerModule,
    CommonModule,
  ],
  templateUrl: './recent-services.component.html',
  styleUrl: './recent-services.component.scss',
})
export class RecentServices implements OnInit {
  private _videosLoadedSubject = new Subject<boolean>();

  readonly config = input.required<RecentServicesConfig>();

  readonly searchQuery = signal('');
  readonly showSpinner = signal(true);
  readonly haveAllVideosBeenRequested = signal(false);

  readonly unfilteredVideos = computed(() =>
    [...this.videoService.preachingsInStore()].sort((a, b) =>
      a.date < b.date ? 1 : -1
    )
  );
  readonly filteredVideos = computed(() => {
    const query = this.searchQuery().trim().toLowerCase().NoAccentString();
    if (query === '') {
      return this.unfilteredVideos();
    }
    return this.unfilteredVideos().filter(
      (video) =>
        video.title.toLowerCase().NoAccentString().includes(query) ||
        video.preacher?.toLowerCase().NoAccentString().includes(query)
    );
  });
  readonly haveAllVideosBeenLoaded = computed(() => {
    return (
      this.unfilteredVideos().length != 0 &&
      this.unfilteredVideos().length >=
        this.videoService.getTotalVideos(VideoListType.Preachings)!
    );
  });
  readonly searchQueryChanged$ = toObservable(this.searchQuery);

  readonly videoService = inject(VideosService);

  readonly videoBatchLoaded$ = this._videosLoadedSubject.asObservable();

  constructor() {
    effect(() => {
      if (this.haveAllVideosBeenLoaded() || this.haveAllVideosBeenRequested()) {
        return;
      }
      if (this.searchQuery().trim() !== '') {
        this.haveAllVideosBeenRequested.set(true);
        this.videoService.loadAllSermons();
      }
    });
  }

  ngOnInit() {
    if (this.unfilteredVideos().length === 0) {
      this.loadVideos();
    } else {
      this.showSpinner.set(false);
    }
  }

  loadVideos() {
    if (this.haveAllVideosBeenLoaded()) {
      return;
    }
    this.videoService
      .loadVideoBatch(VideoListType.Preachings, this.config().initialLoad)
      .subscribe(() => {
        this.showSpinner.set(false);
        this._videosLoadedSubject.next(true);
      });
  }
}
