import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlaylistViewerComponent } from '../components/playlist-viewer/playlist-viewer.component';
import { HydratedVideoPlaylist } from '../models/video.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistViewerService {
  constructor(private dialog: MatDialog) {}
  openPlaylistViewer(playlist: HydratedVideoPlaylist) {
    this.dialog.open(PlaylistViewerComponent, {
      width: '90vw',
      minHeight: '90vh',
      data: {
        playlist,
      },
    });
  }
}
