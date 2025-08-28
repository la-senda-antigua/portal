import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';
import {
  BibleCoursesConfig,
  VideoListType,
} from 'src/app/models/app.config.models';
import { HydratedVideoPlaylist, VideoModel } from 'src/app/models/video.model';
import { PlaylistViewerService } from 'src/app/services/playlist-viewer.service';
import { VideosService } from 'src/app/services/videos.service';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { SearchboxComponent } from '../searchbox/searchbox.component';
import { VideoCarrouselComponent } from '../video-list/video-carrrousel.component';

@Component({
  selector: 'lsa-bible-courses',
  imports: [
    DescriptionBlockComponent,
    MatProgressSpinnerModule,
    VideoCarrouselComponent,
    SearchboxComponent,
  ],
  templateUrl: './bible-courses.component.html',
  styleUrl: './bible-courses.component.scss',
})
export class BibleCoursesComponent implements OnInit {
  readonly config = input.required<BibleCoursesConfig>();

  readonly videoService = inject(VideosService);
  readonly playlistViewerService = inject(PlaylistViewerService);

  readonly playlists = computed(() => [
    ...this.videoService.bibleStudyPlaylists(),
  ]);

  readonly showSpinner = computed(() => this.playlists().length === 0);

  readonly searchQuery = signal<string>('');

  readonly searchQueryChanged$ = toObservable(this.searchQuery);

  readonly filteredPlaylists = computed(() => {
    const query = this.searchQuery().trim().toLowerCase().NoAccentString();
    if (query == '') {
      return this.playlists();
    }
    return this.playlists().filter((pl) => {
      if (pl.name.toLowerCase().NoAccentString().includes(query)) return true;
      if (
        pl.maestros
          ?.map((m) => m.toLowerCase().NoAccentString())
          .some((m) => m.includes(query))
      )
        return true;
      return false;
    });
  });

  ngOnInit(): void {
    if (this.playlists().length === 0) {
      this.videoService
        .loadVideoBatch(VideoListType.BibleStudies, this.config().initialLoad)
        .pipe(switchMap(() => this.videoService.loadAllBibleStudies()))
        .subscribe();
      this.videoService.loadBibleStudyPlaylists();
    }
  }

  onPlaylistClick(playlist: HydratedVideoPlaylist | VideoModel) {
    this.playlistViewerService.openPlaylistViewer(
      playlist as HydratedVideoPlaylist
    );
  }
}
