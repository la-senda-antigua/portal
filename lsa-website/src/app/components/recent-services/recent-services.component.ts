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

@Component({
  selector: 'lsa-recent-services',
  imports: [
    DescriptionBlockComponent,
    SearchboxComponent,
    VideoCarrouselComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './recent-services.component.html',
  styleUrl: './recent-services.component.scss',
})
export class RecentServices implements OnInit {
  readonly config = input.required<RecentServicesConfig>();

  readonly searchQuery = signal('');
  private _loadingVideos = new Subject<boolean>();
  readonly loadingVideos$ = this._loadingVideos.asObservable();

  readonly unfilteredVideos = computed(() =>
    [...this.videoService.preachingsInStore()].sort((a, b) =>
      a.date < b.date ? 1 : -1
    )
  );
  readonly filteredVideos = computed(() => {
    const query = this.getNoAccentString(this.searchQuery());
    if (query === '') {
      return this.unfilteredVideos();
    }
    return this.unfilteredVideos().filter(
      (video) =>
        this.getNoAccentString(video.title).includes(query) ||
        this.getNoAccentString(video.preacher).includes(query)
    );
  });
  readonly haveAllVideosBeenLoaded = computed(() => {
    return (
      this.unfilteredVideos().length != 0 &&
      this.unfilteredVideos().length >=
        this.videoService.getTotalVideos(VideoListType.Preachings)
    );
  });
  readonly haveAllVideosBeenRequested = signal(false);

  readonly videoService = inject(VideosService);

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
    this.loadVideos();
  }

  loadVideos() {
    if (this.haveAllVideosBeenLoaded()) {
      return;
    }
    this.videoService
      .loadVideoBatch(VideoListType.Preachings, this.config().initialLoad)
      .subscribe(() => this._loadingVideos.next(true));
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
