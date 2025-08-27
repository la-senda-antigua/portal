import { Component, computed, inject, input } from '@angular/core';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { VideoCarrouselComponent } from '../video-list/video-carrrousel.component';
import { PreachingPlaylistsConfig } from 'src/app/models/app.config.models';
import { VideosService } from 'src/app/services/videos.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'lsa-preaching-playlists',
  imports: [DescriptionBlockComponent, VideoCarrouselComponent, MatProgressSpinnerModule],
  templateUrl: './preaching-playlists.component.html',
  styleUrl: './preaching-playlists.component.scss',
})
export class PreachingPlaylistsComponent {
  readonly config = input.required<PreachingPlaylistsConfig>();

  readonly videoService = inject(VideosService);

  readonly playlists = computed(() => [
    ...this.videoService.preachingPlaylists(),
  ]);

  readonly showSpinner = computed(()=> this.playlists().length === 0);

  constructor() {
    this.videoService.loadPreachingPlaylists();
  }
}
