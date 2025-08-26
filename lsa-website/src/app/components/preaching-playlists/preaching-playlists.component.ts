import { Component, computed, inject, input } from '@angular/core';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { VideoCarrouselComponent } from '../video-list/video-carrrousel.component';
import { PreachingPlaylistsConfig } from 'src/app/models/app.config.models';
import { VideosService } from 'src/app/services/videos.service';

@Component({
  selector: 'lsa-preaching-playlists',
  imports: [DescriptionBlockComponent, VideoCarrouselComponent],
  templateUrl: './preaching-playlists.component.html',
  styleUrl: './preaching-playlists.component.scss',
})
export class PreachingPlaylistsComponent {
  readonly config = input.required<PreachingPlaylistsConfig>();

  readonly videoService = inject(VideosService);

  readonly playlists = computed(() => [
    ...this.videoService.preachingPlaylists(),
  ]);

  constructor() {
    this.videoService.loadPreachingPlaylists();
  }
}
