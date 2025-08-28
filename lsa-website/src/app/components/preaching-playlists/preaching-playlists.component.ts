import { Component, computed, inject, input } from '@angular/core';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { VideoCarrouselComponent } from '../video-list/video-carrrousel.component';
import { PreachingPlaylistsConfig } from 'src/app/models/app.config.models';
import { VideosService } from 'src/app/services/videos.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlaylistViewerService } from 'src/app/services/playlist-viewer.service';
import { HydratedVideoPlaylist, VideoModel } from 'src/app/models/video.model';

@Component({
  selector: 'lsa-preaching-playlists',
  imports: [
    DescriptionBlockComponent,
    VideoCarrouselComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './preaching-playlists.component.html',
  styleUrl: './preaching-playlists.component.scss',
})
export class PreachingPlaylistsComponent {
  readonly config = input.required<PreachingPlaylistsConfig>();

  readonly videoService = inject(VideosService);
  readonly playlistViewerService = inject(PlaylistViewerService);

  readonly playlists = computed(() => [
    ...this.videoService.preachingPlaylists(),
  ]);

  readonly showSpinner = computed(() => this.playlists().length === 0);

  constructor() {
    this.videoService.loadPreachingPlaylists();
  }

  onPlaylistClick(playlist: HydratedVideoPlaylist | VideoModel) {
    this.playlistViewerService.openPlaylistViewer(playlist as HydratedVideoPlaylist);
  }
}
